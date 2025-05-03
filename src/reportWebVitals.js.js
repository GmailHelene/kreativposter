// reportWebVitals.js - Ytelsesovervåking for KreativPoster
// Basert på Create React App's web vitals modul

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Cumulative Layout Shift (CLS)
      getCLS(onPerfEntry);
      
      // First Input Delay (FID)
      getFID(onPerfEntry);
      
      // First Contentful Paint (FCP)
      getFCP(onPerfEntry);
      
      // Largest Contentful Paint (LCP)
      getLCP(onPerfEntry);
      
      // Time to First Byte (TTFB)
      getTTFB(onPerfEntry);
    });
  }
};

// Funksjon for å formatere og logge ytelsesdata
export const formatWebVitalsForAnalytics = (metric) => {
  // Navn, ID og verdi er nødvendige felter
  const { name, id, value } = metric;
  
  // Konverter verdier til heltall for enklere lesing
  const roundedValue = Math.round(name === 'CLS' ? value * 1000 : value);
  
  // Vurder ytelsen basert på Googles anbefalte terskelverdier
  let rating = 'good';
  
  if (name === 'FCP') {
    if (value > 1800) rating = 'poor';
    else if (value > 1000) rating = 'needs-improvement';
  } else if (name === 'LCP') {
    if (value > 2500) rating = 'poor';
    else if (value > 1800) rating = 'needs-improvement';
  } else if (name === 'FID') {
    if (value > 100) rating = 'poor';
    else if (value > 50) rating = 'needs-improvement';
  } else if (name === 'CLS') {
    if (value > 0.25) rating = 'poor';
    else if (value > 0.1) rating = 'needs-improvement';
  } else if (name === 'TTFB') {
    if (value > 600) rating = 'poor';
    else if (value > 300) rating = 'needs-improvement';
  }
  
  // Returner formatert objekt for logging eller analyse
  return {
    name,
    id,
    value: roundedValue,
    rating,
    delta: Math.round(metric.delta || 0),
    navigationType: metric.navigationType || 'navigate'
  };
};

// Funksjon for å sende ytelsesdata til en analyseplattform
export const sendToAnalytics = (metric) => {
  const formattedMetric = formatWebVitalsForAnalytics(metric);
  
  // I produksjon ville dette sendt data til en faktisk analyseplattform
  // For eksempel:
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formattedMetric)
  // });
  
  // For utviklingsmiljø, bare logg til konsollen
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', formattedMetric);
  }
};

export default reportWebVitals;