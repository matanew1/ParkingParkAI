/**
 * CorsProxy.ts
 * 
 * Utility to handle CORS issues when calling external APIs directly from the browser.
 * This can be configured to use various CORS proxy services or your own proxy.
 */

// Available CORS proxy options
const CORS_PROXY_OPTIONS = {
  CORS_ANYWHERE: 'https://cors-anywhere.herokuapp.com/',
  ALLORIGINS: 'https://api.allorigins.win/raw?url=',
  CORSPROXY_IO: 'https://corsproxy.io/?',
  NONE: '', // Direct request (no proxy)
};

// Default proxy to use (can be changed via setActiveProxy)
let ACTIVE_PROXY = CORS_PROXY_OPTIONS.NONE;

/**
 * Set the active CORS proxy to use
 * @param proxyKey Key from CORS_PROXY_OPTIONS
 * @returns The proxy URL prefix
 */
export function setActiveProxy(proxyKey: keyof typeof CORS_PROXY_OPTIONS): string {
  ACTIVE_PROXY = CORS_PROXY_OPTIONS[proxyKey];
  return ACTIVE_PROXY;
}

/**
 * Get the currently active CORS proxy
 * @returns The current proxy URL prefix
 */
export function getActiveProxy(): string {
  return ACTIVE_PROXY;
}

/**
 * Add CORS proxy to a URL if needed
 * @param url The original URL to call
 * @returns URL with CORS proxy prefix if necessary
 */
export function proxyUrl(url: string): string {
  if (!ACTIVE_PROXY) {
    return url;
  }
  
  // Handle different proxy formats
  if (ACTIVE_PROXY === CORS_PROXY_OPTIONS.ALLORIGINS) {
    return `${ACTIVE_PROXY}${encodeURIComponent(url)}`;
  }
  
  return `${ACTIVE_PROXY}${url}`;
}

export default {
  proxyUrl,
  setActiveProxy,
  getActiveProxy,
  CORS_PROXY_OPTIONS,
};
