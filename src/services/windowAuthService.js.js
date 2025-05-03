// src/services/windowAuthService.js

/**
 * Tjeneste for å håndtere nettleserbasert autentisering til sosiale medieplattformer
 * 
 * Denne tilnærmingen bruker et popup-vindu for å autentisere brukeren direkte med
 * sosiale medieplattformer, istedenfor å bruke API-nøkler.
 */
class WindowAuthService {
  constructor() {
    this.loginWindows = {};
    this.authCallbacks = {};
    
    // Lytt til meldinger fra popup-vinduer
    window.addEventListener('message', this.handlePostMessage.bind(this), false);
  }
  
  /**
   * Start innloggingsprosessen for en bestemt plattform
   */
  openLoginWindow(platform) {
    return new Promise((resolve, reject) => {
      try {
        // Definer URL-er og parametre for hver plattform
        const authConfig = this.getAuthConfig(platform);
        
        if (!authConfig) {
          resolve({ success: false, error: `Plattformen ${platform} støttes ikke` });
          return;
        }
        
        // Generer en unik state-parameter for sikkerhet
        const state = this.generateRandomState();
        localStorage.setItem(`${platform}_auth_state`, state);
        
        // Lagre callback-funksjonen
        this.authCallbacks[platform] = (result) => {
          resolve(result);
        };
        
        // Bygg autorisasjons-URL
        const authUrl = this.buildAuthUrl(authConfig, state);
        
        // Åpne popup-vindu
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;
        
        this.loginWindows[platform] = window.open(
          authUrl,
          `${platform}Auth`,
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Sjekk om popup-vinduet ble blokkert
        if (!this.loginWindows[platform] || this.loginWindows[platform].closed || typeof this.loginWindows[platform].closed === 'undefined') {
          resolve({ 
            success: false, 
            error: 'Popup-vindu ble blokkert. Vennligst tillat popup-vinduer for denne nettsiden.'
          });
        }
        
        // Sjekk med jevne mellomrom om popup-vinduet har blitt lukket
        const checkClosed = setInterval(() => {
          if (this.loginWindows[platform] && this.loginWindows[platform].closed) {
            clearInterval(checkClosed);
            
            // Hvis callback ikke er håndtert allerede, anta at brukeren lukket vinduet
            if (this.authCallbacks[platform]) {
              this.authCallbacks[platform]({
                success: false,
                error: 'Innloggingsvinduet ble lukket av brukeren'
              });
              delete this.authCallbacks[platform];
            }
          }
        }, 500);
        
      } catch (error) {
        console.error(`Feil ved åpning av popup-vindu:`, error);
        resolve({ success: false, error: error.message });
      }
    });
  }
  
  /**
   * Håndterer meldinger fra popup-vinduene
   */
  handlePostMessage(event) {
    // Sikkerhetskontroll - vurder å legge til domain-sjekk i produksjon
    
    const data = event.data;
    
    // Ignorer meldinger som ikke er relevante
    if (!data || !data.type || data.type !== 'social_auth_callback') {
      return;
    }
    
    const { platform, code, state, error } = data;
    
    // Valider state-parameteren
    const savedState = localStorage.getItem(`${platform}_auth_state`);
    if (state !== savedState) {
      if (this.authCallbacks[platform]) {
        this.authCallbacks[platform]({
          success: false,
          error: 'Ugyldig state-parameter - mulig sikkerhetsproblem'
        });
        delete this.authCallbacks[platform];
      }
      return;
    }
    
    // Fjern lagret state
    localStorage.removeItem(`${platform}_auth_state`);
    
    // Lukk popup-vinduet
    if (this.loginWindows[platform]) {
      this.loginWindows[platform].close();
      delete this.loginWindows[platform];
    }
    
    // Håndter feil
    if (error) {
      if (this.authCallbacks[platform]) {
        this.authCallbacks[platform]({
          success: false,
          error: error
        });
        delete this.authCallbacks[platform];
      }
      return;
    }
    
    // For demo-versjonen, simulerer vi vellykket autentisering
    // I en faktisk implementasjon ville vi kalle en API for å utveksle koden
    this.simulateSuccessfulAuth(platform, code)
      .then(result => {
        if (this.authCallbacks[platform]) {
          this.authCallbacks[platform](result);
          delete this.authCallbacks[platform];
        }
      })
      .catch(error => {
        if (this.authCallbacks[platform]) {
          this.authCallbacks[platform]({
            success: false,
            error: error.message
          });
          delete this.authCallbacks[platform];
        }
      });
  }
  
  /**
   * Simulerer vellykket autentisering (for demo-formål)
   */
  async simulateSuccessfulAuth(platform, code) {
    // Generer et dummy access token
    const accessToken = `demo_${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simuler brukerinformasjon
    const usernames = {
      facebook: 'facebook_user',
      instagram: 'instagram_user',
      tiktok: 'tiktok_creator',
      youtube: 'youtube_channel',
      snapchat: 'snapchat_user'
    };
    
    // Lagre token i localStorage
    localStorage.setItem(`${platform}_access_token`, accessToken);
    localStorage.setItem(`${platform}_logged_in`, 'true');
    localStorage.setItem(`${platform}_username`, usernames[platform] || `${platform}_user`);
    
    return {
      success: true,
      platform,
      accessToken,
      username: usernames[platform] || `${platform}_user`
    };
  }
  
  /**
   * Fullfører autentiseringen ved å sende autentiseringskoden til serveren
   * I en faktisk implementasjon ville dette kallet til en backend-API
   */
  async completeAuthentication(platform, code) {
    return this.simulateSuccessfulAuth(platform, code);
  }
  
  /**
   * Henter autentiseringskonfigurasjon for en plattform
   */
  getAuthConfig(platform) {
    // I en faktisk implementasjon ville disse URL-ene peke til ekte OAuth-endepunkter
    const configs = {
      facebook: {
        authUrl: 'https://www.facebook.com/v15.0/dialog/oauth',
        redirectUri: `${window.location.origin}/auth/callback/facebook`,
        scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
        responseType: 'code'
      },
      instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        redirectUri: `${window.location.origin}/auth/callback/instagram`,
        scope: 'user_profile,user_media',
        responseType: 'code'
      },
      tiktok: {
        authUrl: 'https://www.tiktok.com/auth/authorize/',
        redirectUri: `${window.location.origin}/auth/callback/tiktok`,
        scope: 'user.info.basic,video.publish',
        responseType: 'code'
      },
      youtube: {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: `${window.location.origin}/auth/callback/youtube`,
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
        responseType: 'code',
        accessType: 'offline',
        prompt: 'consent'
      },
      snapchat: {
        authUrl: 'https://accounts.snapchat.com/accounts/oauth2/auth',
        redirectUri: `${window.location.origin}/auth/callback/snapchat`,
        scope: 'snapchat-marketing-api',
        responseType: 'code'
      }
    };
    
    return configs[platform];
  }
  
  /**
   * Bygger autorisasjons-URL for en plattform
   */
  buildAuthUrl(config, state) {
    const params = new URLSearchParams();
    // I en demo-versjon bruker vi dummy klient-IDer
    params.append('client_id', `demo_${config.redirectUri}_client_id`);
    params.append('redirect_uri', config.redirectUri);
    params.append('scope', config.scope);
    params.append('state', state);
    params.append('response_type', config.responseType);
    
    if (config.accessType) {
      params.append('access_type', config.accessType);
    }
    
    if (config.prompt) {
      params.append('prompt', config.prompt);
    }
    
    return `${config.authUrl}?${params.toString()}`;
  }
  
  /**
   * Genererer en tilfeldig state-parameter for sikkerhet
   */
  generateRandomState() {
    const randomValues = new Uint32Array(4);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues)
      .map(value => value.toString(16))
      .join('');
  }
  
  /**
   * Sjekker om brukeren er pålogget en plattform
   */
  async checkLoginStatus(platform) {
    // I en faktisk implementasjon ville dette sjekke API-tokens eller cookies
    // For demo-versjonen, sjekker vi bare localStorage
    const isLoggedIn = localStorage.getItem(`${platform}_logged_in`) === 'true';
    const username = localStorage.getItem(`${platform}_username`);
    
    return {
      isLoggedIn,
      username
    };
  }
  
  /**
   * Logger ut fra en plattform
   */
  logout(platform) {
    // I en faktisk implementasjon ville dette invalidere tokens på serveren
    // For demo-versjonen, fjerner vi bare fra localStorage
    localStorage.removeItem(`${platform}_access_token`);
    localStorage.removeItem(`${platform}_logged_in`);
    localStorage.removeItem(`${platform}_username`);
    
    return { success: true };
  }
}

// Eksporter en singleton-instans
const windowAuthService = new WindowAuthService();
export default windowAuthService;
