/**
 * Vercel Speed Insights for static HTML sites
 * 
 * This script initializes Vercel Speed Insights to track web performance metrics.
 * It uses the CDN-hosted version of @vercel/speed-insights.
 * 
 * Documentation: https://vercel.com/docs/speed-insights/quickstart
 */

(function() {
  'use strict';

  // Configuration for Speed Insights
  const speedInsightsConfig = {
    debug: false, // Set to true to see events in console during development
    // sampleRate: 1, // Default is 1 (100% of visitors)
  };

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Dynamically load and initialize Speed Insights from CDN
  function initSpeedInsights() {
    // Use ES module from jsdelivr CDN
    import('https://cdn.jsdelivr.net/npm/@vercel/speed-insights@2/dist/index.mjs')
      .then((module) => {
        if (module && module.injectSpeedInsights) {
          // Initialize Speed Insights
          module.injectSpeedInsights(speedInsightsConfig);
          console.log('Vercel Speed Insights initialized');
        }
      })
      .catch((error) => {
        console.warn('Failed to load Vercel Speed Insights:', error);
      });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpeedInsights);
  } else {
    initSpeedInsights();
  }
})();
