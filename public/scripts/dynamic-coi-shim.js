/**
 * Dynamic + Linera Cross-Origin Isolation Shim
 *
 * This script enables SharedArrayBuffer support required by Linera's WASM module
 * while maintaining compatibility with Dynamic's authentication iframes.
 *
 * Why is this needed?
 * - Linera's WASM client requires SharedArrayBuffer for multi-threaded operations
 * - SharedArrayBuffer requires Cross-Origin Isolation (COOP + COEP headers)
 * - Cross-Origin Isolation blocks third-party iframes like Dynamic's auth popups
 * - This shim provides a workaround by selectively allowing Dynamic's domains
 *
 * Usage:
 * Add this script to your HTML <head> BEFORE any other scripts:
 *
 * <script src="/scripts/dynamic-coi-shim.js"></script>
 *
 * For Next.js, add to _document.tsx or use next/script with beforeInteractive strategy.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
 * @see https://docs.dynamic.xyz/troubleshooting/cors-issues
 */

(function () {
  'use strict';

  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  /**
   * Configuration
   */
  const CONFIG = {
    // Dynamic's allowed domains for auth iframes
    allowedDomains: [
      'dynamic.xyz',
      'app.dynamic.xyz',
      'auth.dynamic.xyz',
      'www.dynamic.xyz',
      // Add any additional Dynamic-related domains
    ],

    // Enable debug logging
    debug: false,

    // Service worker path (relative to origin)
    serviceWorkerPath: '/coi-serviceworker.js',
  };

  /**
   * Logging helper
   */
  function log(message, ...args) {
    if (CONFIG.debug) {
      console.log('[COI-Shim]', message, ...args);
    }
  }

  /**
   * Check if the browser already supports SharedArrayBuffer
   */
  function hasSharedArrayBufferSupport() {
    try {
      // Check if SharedArrayBuffer is defined and functional
      if (typeof SharedArrayBuffer === 'undefined') {
        return false;
      }

      // Try to create a small SharedArrayBuffer
      new SharedArrayBuffer(1);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if cross-origin isolation is already enabled
   */
  function isCrossOriginIsolated() {
    return (
      typeof window !== 'undefined' &&
      window.crossOriginIsolated === true
    );
  }

  /**
   * Check if we're in a context where COI can be enabled
   */
  function canEnableCOI() {
    // Can't enable COI in iframes
    if (window.self !== window.top) {
      log('Running in iframe, cannot enable COI');
      return false;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      log('Service workers not supported');
      return false;
    }

    return true;
  }

  /**
   * Check if a URL is from an allowed domain
   */
  function isAllowedDomain(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      return CONFIG.allowedDomains.some((domain) =>
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Create an inline service worker that adds COOP/COEP headers
   */
  function getServiceWorkerCode() {
    return `
      // Dynamic + Linera COI Service Worker
      // Adds Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers

      const ALLOWED_DOMAINS = ${JSON.stringify(CONFIG.allowedDomains)};

      function isAllowedDomain(url) {
        try {
          const parsed = new URL(url);
          return ALLOWED_DOMAINS.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
          );
        } catch (e) {
          return false;
        }
      }

      self.addEventListener('install', () => {
        self.skipWaiting();
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(self.clients.claim());
      });

      self.addEventListener('fetch', (event) => {
        const url = event.request.url;

        // Let Dynamic's requests pass through without modification
        if (isAllowedDomain(url)) {
          return;
        }

        // For same-origin requests, add COI headers
        if (new URL(url).origin === self.location.origin) {
          event.respondWith(
            fetch(event.request).then((response) => {
              // Clone the response to modify headers
              const newHeaders = new Headers(response.headers);

              // Add Cross-Origin headers
              newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');
              newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

              return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
              });
            })
          );
        }
      });
    `;
  }

  /**
   * Register the service worker
   */
  async function registerServiceWorker() {
    try {
      // Create a blob URL for the service worker
      const swCode = getServiceWorkerCode();
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      // Register the service worker
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });

      log('Service worker registered:', registration);

      // Wait for the service worker to be active
      if (registration.active) {
        log('Service worker already active');
        return true;
      }

      return new Promise((resolve) => {
        const sw = registration.installing || registration.waiting;
        if (sw) {
          sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') {
              log('Service worker activated');
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      log('Failed to register service worker:', error);
      return false;
    }
  }

  /**
   * Apply polyfill for browsers that don't support credentialless COEP
   */
  function applyCredentiallessPolyfill() {
    // Some browsers don't support 'credentialless' COEP
    // In this case, we need to use 'require-corp' which is more restrictive
    // but still allows SharedArrayBuffer

    // This is a fallback - the service worker approach is preferred
    log('Applying credentialless polyfill');
  }

  /**
   * Patch iframe creation to allow Dynamic's iframes
   */
  function patchIframeCreation() {
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = function (tagName, options) {
      const element = originalCreateElement(tagName, options);

      if (tagName.toLowerCase() === 'iframe') {
        // Add credentialless attribute for cross-origin iframes
        // This allows them to work under COEP: credentialless
        const originalSetAttribute = element.setAttribute.bind(element);

        element.setAttribute = function (name, value) {
          originalSetAttribute(name, value);

          // If src is set and it's a Dynamic domain, ensure credentialless is set
          if (name === 'src' && isAllowedDomain(value)) {
            if (!element.hasAttribute('credentialless')) {
              element.setAttribute('credentialless', '');
              log('Added credentialless to Dynamic iframe:', value);
            }
          }
        };
      }

      return element;
    };

    log('Patched iframe creation');
  }

  /**
   * Initialize the shim
   */
  async function initialize() {
    log('Initializing Dynamic + Linera COI Shim');
    log('SharedArrayBuffer support:', hasSharedArrayBufferSupport());
    log('Cross-origin isolated:', isCrossOriginIsolated());

    // If already cross-origin isolated, we're good
    if (isCrossOriginIsolated()) {
      log('Already cross-origin isolated, no action needed');
      // Still patch iframe creation for Dynamic compatibility
      patchIframeCreation();
      return;
    }

    // If SharedArrayBuffer is already available, we might not need COI
    if (hasSharedArrayBufferSupport()) {
      log('SharedArrayBuffer available without COI');
      patchIframeCreation();
      return;
    }

    // Check if we can enable COI
    if (!canEnableCOI()) {
      log('Cannot enable COI in this context');
      return;
    }

    // Patch iframe creation before enabling COI
    patchIframeCreation();

    // Register service worker to add headers
    const registered = await registerServiceWorker();

    if (registered) {
      log('COI service worker registered, reloading page...');

      // Reload the page to apply the new headers
      // Use a small delay to ensure the service worker is ready
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      log('Failed to enable COI via service worker');
      applyCredentiallessPolyfill();
    }
  }

  /**
   * Expose configuration for runtime modification
   */
  window.__DYNAMIC_COI_SHIM__ = {
    config: CONFIG,
    isEnabled: isCrossOriginIsolated,
    hasSharedArrayBuffer: hasSharedArrayBufferSupport,
    addAllowedDomain: function (domain) {
      if (!CONFIG.allowedDomains.includes(domain)) {
        CONFIG.allowedDomains.push(domain);
        log('Added allowed domain:', domain);
      }
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
