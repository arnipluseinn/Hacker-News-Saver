// This service worker can be used for future background tasks.
// For now, it just confirms installation.
chrome.runtime.onInstalled.addListener(() => {
  console.log('Hacker News Saver extension installed/updated.');
});
