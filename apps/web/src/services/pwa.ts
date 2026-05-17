import { initializeApp } from 'firebase/app';
import { Workbox } from 'workbox-window';

export let wb: Workbox | null = null;

export function initServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  wb = new Workbox('/sw.js');

  wb.addEventListener('controlling', () => {
    console.log('Service Worker now controlling the page');
  });

  wb.addEventListener('externalwaiting', () => {
    console.log('New service worker available');
  });

  wb.register().catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}

export async function checkForUpdates() {
  if (!wb) return;
  try {
    await wb.update();
  } catch (error) {
    console.error('Update check failed:', error);
  }
}
