import { registerSW } from 'virtual:pwa-register';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New content is available. Reload the page to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App is ready to work offline.');
      },
    });
  }
};
