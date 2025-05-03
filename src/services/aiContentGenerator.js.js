// src/services/aiContentGenerator.js

/**
 * Dette er en mer avansert versjon av innholdsgeneratoren som simulerer bruk
 * av ulike AI-modeller for å generere tekst, bilder, videoer og musikk.
 * 
 * I en faktisk implementasjon ville dette integrert med:
 * - Tekst: OpenAI GPT, Claude API, osv.
 * - Bilder: DALL-E, Midjourney API, Stable Diffusion, osv.
 * - Video: RunwayML, D-ID, Synthesia, osv.
 * - Musikk: AIVA, Soundraw, Mubert, osv.
 */

// Simulerte AI-tjenester
const aiServices = {
  // Tekstgenerering med LLM
  text: {
    // Generere bildetekst
    generateCaption: async (prompt, platform, tone, length) => {
      console.log(`Genererer bildetekst for ${platform} med tone: ${tone}, lengde: ${length}`);
      
      // Simulerte plattformspesifikke stiler
      const platformStyles = {
        tiktok: {
          shortStyle: '🔥 Kort og kraftig! #trending #fyp',
          mediumStyle: '🔥 Sjekk dette ut! Hva synes du? Kommenter under 👇 #fyp #trending #kreativposter',
          longStyle: '🔥 Dette måtte jeg bare dele med dere! Elsker hvordan dette ble. Hva synes dere? La meg vite i kommentarfeltet! 👇 #fyp #trending #kreativposter #norgeontiktok'
        },
        instagram: {
          shortStyle: '✨ Inspirasjon for dagen! #instagood',
          mediumStyle: '✨ Dagens inspirasjon! Hva synes du om dette? 💭 #instagood #instadaily #kreativposter',
          longStyle: '✨ Dagens dose av inspirasjon! Dette er noe jeg har jobbet med en stund, og er veldig fornøyd med resultatet. Hva tenker du? Del gjerne dine tanker i kommentarene! 💭\n\n#instagood #instadaily #norgespafeed #kreativposter'
        },
        facebook: {
          shortStyle: 'Tenkte å dele dette med dere! 😊',
          mediumStyle: 'Tenkte å dele dette med venner og familie! Hva synes dere? 😊 #kreativposter',
          longStyle: 'Hei alle sammen! Jeg ville dele dette med dere i dag. Det er et prosjekt jeg har jobbet med en stund, og jeg er veldig fornøyd med resultatet. Setter pris på tilbakemeldinger og kommentarer! 😊 #kreativposter #delglede'
        },
        snapchat: {
          shortStyle: 'Sjekk dette! 👻',
          mediumStyle: 'Dagens snap! Hva synes du? 👻 #kreativposter',
          longStyle: 'Hei alle sammen! Sjekk ut dette nye prosjektet jeg har jobbet med. Swipe opp for å se mer! 👻 #kreativposter #snapchat'
        },
        youtube: {
          shortStyle: 'Ny video! Like & Subscribe! 🎬',
          mediumStyle: 'Ny video ute nå! Husk å like og abonnere for mer innhold! 🎬 #shorts',
          longStyle: 'Hei alle sammen! Ny video ute nå! Dette er noe jeg har jobbet med en stund, og er veldig fornøyd med resultatet. Husk å like, kommentere og abonnere for mer innhold! 🎬 #shorts #youtube #kreativposter'
        }
      };
      
      // Velg stil basert på plattform og lengde
      const style = platformStyles[platform] || platformStyles.instagram;
      let styleTemplate;
      
      switch (length) {
        case 'short':
          styleTemplate = style.shortStyle;
          break;
        case 'long':
          styleTemplate = style.longStyle;
          break;
        case 'medium':
        default:
          styleTemplate = style.mediumStyle;
          break;
      }
      
      // Tilpass tonen basert på input
      let toneModifier = '';
      switch (tone) {
        case 'formal':
          toneModifier = 'Vi er glade for å kunne presentere ';
          break;
        case 'casual':
          toneModifier = 'Sjekk ut ';
          break;
        case 'funny':
          toneModifier = 'LOL! Du kommer ikke til å tro ';
          break;
        case 'serious':
          toneModifier = 'Et viktig tema for dagen: ';
          break;
        case 'inspirational':
          toneModifier = 'La deg inspirere av ';
          break;
        default:
          toneModifier = '';
          break;
      }
      
      // Kombiner prompt med tone og stil
      const promptWords = prompt.split(' ');
      let caption;
      
      if (promptWords.length > 5) {
        const mainIdea = promptWords.slice(0, 5).join(' ') + '...';
        caption = `${toneModifier}${mainIdea} ${styleTemplate}`;
      } else {
        caption = `${toneModifier}${prompt} ${styleTemplate}`;
      }
      
      return caption;
    },
    
    // Generere hashtags
    generateHashtags: async (topic, platform, count = 5) => {
      console.log(`Genererer ${count} hashtags for ${topic} på ${platform}`);
      
      // Vanlige hashtags for hver plattform
      const platformHashtags = {
        tiktok: ['fyp', 'foryou', 'foryoupage', 'viral', 'trending', 'tiktok', 'tiktoktrend'],
        instagram: ['instagood', 'instadaily', 'instagram', 'photooftheday', 'instamood', 'picoftheday'],
        facebook: ['facebook', 'share', 'post', 'trending', 'viral'],
        snapchat: ['snapchat', 'snap', 'snapchatfilter', 'snapchatfun', 'snapchatstory'],
        youtube: ['youtube', 'youtuber', 'youtubevideos', 'shorts', 'youtubeshorts', 'subscribe']
      };
      
      // Tematiske hashtags for ulike typer innhold
      const topicMap = {
        'mat': ['food', 'foodie', 'matglede', 'oppskrift', 'middag', 'baking', 'kjøkken', 'homemade'],
        'reise': ['travel', 'reise', 'reisetips', 'vacation', 'holiday', 'adventure', 'explore', 'wanderlust'],
        'mote': ['fashion', 'style', 'outfit', 'ootd', 'fashionista', 'trend', 'streetstyle'],
        'skjønnhet': ['beauty', 'makeup', 'skincare', 'hudpleie', 'sminke', 'beautycare', 'glowup'],
        'trening': ['fitness', 'workout', 'training', 'gym', 'exercise', 'fit', 'healthylifestyle', 'active'],
        'musikk': ['music', 'musikk', 'song', 'artist', 'musician', 'singer', 'band', 'newmusic'],
        'humor': ['funny', 'comedy', 'humor', 'joke', 'laugh', 'fun', 'meme', 'komiker'],
        'teknologi': ['tech', 'technology', 'gadget', 'innovation', 'digital', 'software', 'hardware'],
        'natur': ['nature', 'outdoor', 'naturelovers', 'landscape', 'hiking', 'mountains', 'sea', 'friluftsliv']
      };
      
      // Finn relevante tematiske hashtags basert på nøkkelord i topic
      let relevantTopicHashtags = [];
      for (const [key, tags] of Object.entries(topicMap)) {
        if (topic.toLowerCase().includes(key) || 
            tags.some(tag => topic.toLowerCase().includes(tag))) {
          relevantTopicHashtags = relevantTopicHashtags.concat(tags);
        }
      }
      
      // Hvis ingen tematiske hashtags ble funnet, bruk noen generelle
      if (relevantTopicHashtags.length === 0) {
        relevantTopicHashtags = ['awesome', 'amazing', 'cool', 'norway', 'norge', 'norsk', 'content', 'creator'];
      }
      
      // Kombiner plattformspesifikke og tematiske hashtags
      const platformTags = platformHashtags[platform] || platformHashtags.instagram;
      const allTags = [...platformTags, ...relevantTopicHashtags, 'kreativposter'];
      
      // Velg tilfeldig det ønskede antallet hashtags
      const selectedTags = [];
      for (let i = 0; i < count && allTags.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * allTags.length);
        selectedTags.push(allTags[randomIndex]);
        allTags.splice(randomIndex, 1);
      }
      
      return selectedTags.map(tag => `#${tag}`);
    },
    
    // Generere fullt innlegg
    generatePost: async (prompt, platform, options = {}) => {
      const { tone = 'casual', length = 'medium', includeHashtags = true, hashtagCount = 5 } = options;
      
      const caption = await aiServices.text.generateCaption(prompt, platform, tone, length);
      let content = caption;
      
      if (includeHashtags) {
        const hashtags = await aiServices.text.generateHashtags(prompt, platform, hashtagCount);
        content += '\n\n' + hashtags.join(' ');
      }
      
      return content;
    }
  },
  
  // Bildegenerering med diffusjonsmodeller
  image: {
    generateImage: async (prompt, platform, style) => {
      console.log(`Genererer bilde for ${platform} med stil: ${style}`);
      
      // Plattformspesifikke bildedimensjoner
      const dimensions = {
        tiktok: { width: 1080, height: 1920 }, // 9:16
        instagram: { width: 1080, height: 1350 }, // 4:5 (feed)
        instagram_story: { width: 1080, height: 1920 }, // 9:16 (story)
        facebook: { width: 1200, height: 630 }, // 1.91:1 (vanlig feed)
        facebook_reels: { width: 1080, height: 1920 }, // 9:16 (reels)
        snapchat: { width: 1080, height: 1920 }, // 9:16
        youtube_shorts: { width: 1080, height: 1920 }, // 9:16
        youtube_thumbnail: { width: 1280, height: 720 } // 16:9
      };
      
      // Velg dimensjoner basert på plattform
      let dims;
      if (platform.includes('_')) {
        dims = dimensions[platform] || dimensions.instagram;
      } else if (platform === 'instagram' || platform === 'facebook') {
        // For Instagram og Facebook, sjekk om vi skal generere for feed eller stories/reels
        if (prompt.toLowerCase().includes('reel') || prompt.toLowerCase().includes('story')) {
          dims = dimensions[`${platform}_story`] || dimensions[`${platform}_reels`];
        } else {
          dims = dimensions[platform];
        }
      } else {
        dims = dimensions[platform] || dimensions.instagram;
      }
      
      // Bildestiler
      const styles = {
        photo: 'realistisk fotografi, høy detalj, profesjonell belysning',
        cartoon: 'tegneserieaktig, fargerik, morsom, stilisert',
        minimalist: 'minimalistisk, enkel, ren, moderne design',
        vintage: 'vintage, retro, film-kornete, nostalgisk',
        abstract: 'abstrakt, kunstnerisk, fargerik, ekspressiv',
        '3d': '3D-rendering, volumetrisk, dybde, realistisk tekstur',
        sketch: 'håndtegnet skisse, tegning, blyant, enkel'
      };
      
      // Kombiner prompt med stil
      const stylePrompt = styles[style] || styles.photo;
      const fullPrompt = `${prompt}, ${stylePrompt}`;
      
      // I en virkelig implementasjon ville vi her kalt på en bilde-API
      // som DALL-E, Midjourney, Stable Diffusion, osv.
      
      return {
        url: `https://example.com/generated-image-${platform}-${style}.jpg`,
        width: dims.width,
        height: dims.height,
        prompt: fullPrompt,
        alt: prompt
      };
    },
    
    // Generer flere variasjoner av et bilde
    generateVariations: async (baseImage, count = 3) => {
      console.log(`Genererer ${count} variasjoner av et bilde`);
      
      // I en virkelig implementasjon ville dette kalt på en API
      // for å generere variasjoner av et eksisterende bilde
      
      const variations = [];
      for (let i = 0; i < count; i++) {
        variations.push({
          url: `https://example.com/image-variation-${i}.jpg`,
          width: baseImage.width,
          height: baseImage.height
        });
      }
      
      return variations;
    }
  },
  
  // Videogenerering
  video: {
    // Generer en kort video basert på en tekst
    generateVideo: async (prompt, platform, options = {}) => {
      console.log(`Genererer video for ${platform} med alternativer:`, options);
      
      const { duration = 15, style = 'realistic', withMusic = true, withVoiceover = false } = options;
      
      // Plattformspesifikke videoinnstillinger
      const videoSettings = {
        tiktok: { aspectRatio: '9:16', maxDuration: 60, preferredFormat: 'mp4' },
        instagram: { aspectRatio: '9:16', maxDuration: 90, preferredFormat: 'mp4' },
        facebook: { aspectRatio: '9:16', maxDuration: 120, preferredFormat: 'mp4' },
        snapchat: { aspectRatio: '9:16', maxDuration: 60, preferredFormat: 'mp4' },
        youtube: { aspectRatio: '9:16', maxDuration: 60, preferredFormat: 'mp4' }
      };
      
      const settings = videoSettings[platform] || videoSettings.tiktok;
      
      // Simulert video respons
      const video = {
        url: `https://example.com/generated-video-${platform}-${style}.mp4`,
        thumbnailUrl: `https://example.com/generated-video-thumbnail-${platform}-${style}.jpg`,
        aspectRatio: settings.aspectRatio,
        duration: Math.min(duration, settings.maxDuration),
        format: settings.preferredFormat,
        prompt
      };
      
      // Legg til musikk hvis ønsket
      if (withMusic) {
        video.music = await aiServices.audio.generateMusic(prompt, duration);
      }
      
      // Legg til voiceover hvis ønsket
      if (withVoiceover) {
        video.voiceover = await aiServices.audio.generateVoiceover(prompt);
      }
      
      return video;
    },
    
    // Generer en tekst-til-GIF
    generateGif: async (prompt, duration = 3) => {
      console.log(`Genererer GIF basert på: ${prompt}`);
      
      // I en virkelig implementasjon ville dette kalt på en API
      // for å generere en GIF fra tekst
      
      return {
        url: `https://example.com/generated-gif.gif`,
        width: 480,
        height: 480,
        duration,
        prompt
      };
    }
  },
  
  // Lydgenerering (musikk og tale)
  audio: {
    // Generer bakgrunnsmusikk
    generateMusic: async (prompt, duration = 30) => {
      console.log(`Genererer musikk basert på: ${prompt}, varighet: ${duration}s`);
      
      // Grunnleggende musikkstiler
      const musicStyles = [
        'upbeat', 'energetic', 'calm', 'relaxing', 'epic', 'dramatic', 
        'happy', 'sad', 'mysterious', 'ambient', 'electronic', 'acoustic'
      ];
      
      // Velg en stil basert på prompt
      let selectedStyle = musicStyles[0];
      for (const style of musicStyles) {
        if (prompt.toLowerCase().includes(style)) {
          selectedStyle = style;
          break;
        }
      }
      
      // I en virkelig implementasjon ville dette kalt på en API
      // for å generere musikk, for eksempel AIVA, Soundraw, eller Mubert
      
      return {
        url: `https://example.com/generated-music-${selectedStyle}.mp3`,
        duration,
        style: selectedStyle,
        title: `AI Music - ${selectedStyle} - ${duration}s`
      };
    },
    
    // Generer tale fra tekst
    generateVoiceover: async (text, voice = 'neutral') => {
      console.log(`Genererer tale for: "${text}" med stemme: ${voice}`);
      
      // Stemmetyper
      const voices = {
        neutral: 'Nøytral norsk stemme',
        cheerful: 'Glad norsk stemme',
        serious: 'Seriøs norsk stemme',
        male: 'Mannlig norsk stemme',
        female: 'Kvinnelig norsk stemme'
      };
      
      const selectedVoice = voices[voice] || voices.neutral;
      
      // Beregn omtrentlig varighet basert på antall ord (ca. 150 ord per minutt)
      const wordCount = text.split(' ').length;
      const durationSeconds = Math.max(3, Math.ceil(wordCount / 2.5));
      
      // I en virkelig implementasjon ville dette kalt på en API
      // for å generere tale, som Amazon Polly, Google Text-to-Speech, etc.
      
      return {
        url: `https://example.com/generated-voiceover-${voice}.mp3`,
        text,
        voice: selectedVoice,
        durationSeconds
      };
    }
  }
};

// Hovedmodul for AI-innholdsgenerering
const aiContentGenerator = {
  // Generer en fullstendig pakke med innhold for en plattform
  generateContentForPlatform: async (prompt, platform, options = {}) => {
    try {
      console.log(`Genererer komplett innhold for ${platform}`);
      
      const {
        contentType = 'mixed',  // 'text', 'image', 'video', 'mixed'
        textOptions = {},
        imageOptions = {},
        videoOptions = {},
        audioOptions = {}
      } = options;
      
      let content = { platform };
      
      // Legg til tekst
      if (contentType === 'text' || contentType === 'mixed') {
        content.text = await aiServices.text.generatePost(
          prompt, 
          platform, 
          textOptions
        );
      }
      
      // Legg til bilde
      if (contentType === 'image' || contentType === 'mixed') {
        content.image = await aiServices.image.generateImage(
          prompt, 
          platform, 
          imageOptions.style || 'photo'
        );
      }
      
      // Legg til video
      if (contentType === 'video' || contentType === 'mixed') {
        content.video = await aiServices.video.generateVideo(
          prompt, 
          platform, 
          videoOptions
        );
      }
      
      // Legg til separat musikk (hvis ikke inkludert i video)
      if ((contentType === 'audio' || contentType === 'mixed') && 
          !content.video?.music && audioOptions.includeMusic) {
        content.music = await aiServices.audio.generateMusic(
          prompt, 
          audioOptions.duration || 30
        );
      }
      
      return content;
    } catch (error) {
      console.error(`Feil ved generering av innhold for ${platform}:`, error);
      throw error;
    }
  },
  
  // Generer innhold for flere plattformer samtidig
  generateContentForAllPlatforms: async (prompt, platforms, options = {}) => {
    const results = {};
    
    for (const platform of platforms) {
      try {
        results[platform] = await aiContentGenerator.generateContentForPlatform(
          prompt, 
          platform, 
          options
        );
      } catch (error) {
        console.error(`Feil ved generering for ${platform}:`, error);
        results[platform] = { error: error.message };
      }
    }
    
    return results;
  },
  
  // Generer variasjoner av samme innhold
  generateContentVariations: async (originalContent, count = 3) => {
    const platform = originalContent.platform;
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      let variation = { platform, variationOf: originalContent };
      
      // Varier tekst
      if (originalContent.text) {
        variation.text = await aiServices.text.generatePost(
          originalContent.text.split('\n')[0], // Bruk første linje som prompt
          platform,
          { tone: ['casual', 'formal', 'funny'][i % 3] }
        );
      }
      
      // Varier bilde
      if (originalContent.image) {
        const imageVariations = await aiServices.image.generateVariations(
          originalContent.image,
          1
        );
        variation.image = imageVariations[0];
      }
      
      variations.push(variation);
    }
    
    return variations;
  }
};

export default aiContentGenerator;