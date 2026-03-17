'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('[App] Service Worker registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(async () => {
            try {
              await registration.update();
            } catch (error) {
              console.error('[App] Error checking for updates:', error);
            }
          }, 60000); // Check every minute

          // Listen for controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[App] Service Worker controller changed');
            window.location.reload();
          });
        } catch (error) {
          console.error('[App] Service Worker registration failed:', error);
        }
      });

      // Cleanup SW on page unload (helps with hot reload in dev)
      return () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE',
          });
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything
}
