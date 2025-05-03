// scheduler-worker.js
// Service Worker for the KreativPoster application
// Handles background tasks like scheduled post publishing

const CACHE_NAME = 'kreativposter-cache-v1';
const SCHEDULED_POSTS_STORE = 'scheduled-posts';

// Files to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Install event - cache assets for offline use
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[ServiceWorker] Install complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached resources when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          
          // Clone the request because it's a one-time use stream
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest).then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          });
        })
    );
  }
});

// Background sync for posts
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event', event.tag);
  
  if (event.tag === 'publish-scheduled-posts') {
    event.waitUntil(publishScheduledPosts());
  }
});

// Message handling from the main thread
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received', event.data);
  
  const { type } = event.data;
  
  switch (type) {
    case 'SCHEDULE_POST':
      handleSchedulePost(event.data.post);
      break;
      
    case 'UPDATE_POST':
      handleUpdatePost(event.data.post);
      break;
      
    case 'DELETE_POST':
      handleDeletePost(event.data.postId);
      break;
      
    case 'CHECK_SCHEDULED':
      checkScheduledPosts();
      break;
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received', event);
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: '/badge.png',
    data: data.data
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click', event);
  
  event.notification.close();
  
  // This will open the app in a tab or focus an already open tab
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Open or create the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kreativposter-scheduler', 1);
    
    request.onerror = (event) => {
      console.error('[ServiceWorker] Database error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(SCHEDULED_POSTS_STORE)) {
        const store = db.createObjectStore(SCHEDULED_POSTS_STORE, { keyPath: 'id' });
        store.createIndex('scheduledFor', 'scheduledFor', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
  });
}

// Handle scheduling a new post
function handleSchedulePost(post) {
  openDatabase().then((db) => {
    const transaction = db.transaction([SCHEDULED_POSTS_STORE], 'readwrite');
    const store = transaction.objectStore(SCHEDULED_POSTS_STORE);
    store.put(post);
    
    // Register a sync task to handle this post when due
    self.registration.sync.register('publish-scheduled-posts');
    
    // Schedule an alarm for this post
    schedulePostAlarm(post);
  });
}

// Handle updating a post
function handleUpdatePost(post) {
  openDatabase().then((db) => {
    const transaction = db.transaction([SCHEDULED_POSTS_STORE], 'readwrite');
    const store = transaction.objectStore(SCHEDULED_POSTS_STORE);
    store.put(post);
    
    // Reschedule the alarm
    schedulePostAlarm(post);
  });
}

// Handle deleting a post
function handleDeletePost(postId) {
  openDatabase().then((db) => {
    const transaction = db.transaction([SCHEDULED_POSTS_STORE], 'readwrite');
    const store = transaction.objectStore(SCHEDULED_POSTS_STORE);
    store.delete(postId);
  });
}

// Check for posts due for publishing
function checkScheduledPosts() {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SCHEDULED_POSTS_STORE], 'readonly');
      const store = transaction.objectStore(SCHEDULED_POSTS_STORE);
      const index = store.index('status');
      const request = index.getAll('scheduled');
      
      request.onsuccess = () => {
        const posts = request.result;
        const now = new Date();
        const duePosts = posts.filter(post => {
          const scheduledTime = new Date(post.scheduledFor);
          return scheduledTime <= now;
        });
        
        if (duePosts.length > 0) {
          console.log('[ServiceWorker] Found posts due for publishing:', duePosts.length);
          publishPosts(duePosts);
        }
        
        resolve(duePosts);
      };
      
      request.onerror = (event) => {
        console.error('[ServiceWorker] Error checking scheduled posts:', event.target.error);
        reject(event.target.error);
      };
    });
  });
}

// Publish scheduled posts
function publishScheduledPosts() {
  return checkScheduledPosts();
}

// Publish specific posts
function publishPosts(posts) {
  openDatabase().then((db) => {
    const publishPromises = posts.map(post => publishPost(db, post));
    
    Promise.all(publishPromises).then(results => {
      console.log('[ServiceWorker] Published posts results:', results);
      
      // Notify all clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'POSTS_PUBLISHED',
            results: results
          });
        });
      });
    });
  });
}

// Publish a single post
function publishPost(db, post) {
  return new Promise((resolve, reject) => {
    // Update status to publishing
    const transaction = db.transaction([SCHEDULED_POSTS_STORE], 'readwrite');
    const store = transaction.objectStore(SCHEDULED_POSTS_STORE);
    
    post.status = 'publishing';
    store.put(post);
    
    // Simulate publishing to platforms
    const publishPromises = post.platforms.map(platform => {
      return simulatePublishToPlatform(platform, post);
    });
    
    Promise.all(publishPromises)
      .then(platformResults => {
        // Update status to published
        const updateTx = db.transaction([SCHEDULED_POSTS_STORE], 'readwrite');
        const updateStore = updateTx.objectStore(SCHEDULED_POSTS_STORE);
        
        post.status = 'published';
        post.publishedResults = platformResults;
        post.publishedAt = new Date().toISOString();
        
        updateStore.put(post);
        
        // Show notification
        showPublishNotification(post, true);
        
        // Notify clients of successful publish
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PUBLISH_COMPLETE',
              postId: post.id,
              results: platformResults
            });
          });
        });
        
        resolve({ post, success: true, results: platformResults });
      })
      .catch(error => {
        // Update status to failed
        const updateTx = db.transaction([SCHEDULED_POSTS_STORE], 'readwrite');
        const updateStore = updateTx.objectStore(SCHEDULED_POSTS_STORE);
        
        post.status = 'failed';
        post.error = error.message;
        
        updateStore.put(post);
        
        // Show notification
        showPublishNotification(post, false, error.message);
        
        // Notify clients of failed publish
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PUBLISH_FAILED',
              postId: post.id,
              error: error.message
            });
          });
        });
        
        resolve({ post, success: false, error: error.message });
      });
  });
}

// Simulate publishing to a platform (mock implementation)
function simulatePublishToPlatform(platform, post) {
  return new Promise((resolve, reject) => {
    // This is a mock implementation
    console.log(`[ServiceWorker] Publishing to ${platform}:`, post);
    
    // Simulate API call
    setTimeout(() => {
      // 90% success rate for demo
      if (Math.random() > 0.1) {
        resolve({ success: true, platform });
      } else {
        reject(new Error(`Failed to publish to ${platform}`));
      }
    }, 1000);
  });
}

// Schedule an alarm for a post
function schedulePostAlarm(post) {
  if ('Notification' in self && self.Notification.permission === 'granted') {
    // Schedule notification for just before the post is due
    const scheduledTime = new Date(post.scheduledFor).getTime();
    const notificationTime = scheduledTime - (5 * 60 * 1000); // 5 minutes before
    const now = Date.now();
    
    if (notificationTime > now) {
      // Using setTimeout in Service Worker is not reliable for long durations
      // Instead, we'll register a periodic sync that checks regularly
      self.registration.periodicSync.register('check-scheduled-posts', {
        minInterval: 15 * 60 * 1000 // Check every 15 minutes
      }).catch(error => {
        console.error('[ServiceWorker] Failed to register periodic sync:', error);
      });
    }
  }
}

// Show notification after publish attempt
function showPublishNotification(post, success, errorMessage = null) {
  const title = success ? 'Innlegg publisert' : 'Publisering feilet';
  
  const options = {
    body: success
      ? `Innlegget "${post.caption.substring(0, 50)}${post.caption.length > 50 ? '...' : ''}" ble publisert vellykket.`
      : `Kunne ikke publisere innlegget "${post.caption.substring(0, 40)}${post.caption.length > 40 ? '...' : ''}". ${errorMessage || 'Ukjent feil'}`,
    icon: post.imageUrl || '/logo.png',
    badge: '/badge.png',
    data: { postId: post.id }
  };
  
  self.registration.showNotification(title, options);
}

// Check for scheduled posts every hour
setInterval(() => {
  checkScheduledPosts();
}, 60 * 60 * 1000);

// Initial check when service worker starts
checkScheduledPosts();

console.log('[ServiceWorker] Initialized');
