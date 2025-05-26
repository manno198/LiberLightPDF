// Background service worker for Ducky PDF Editor
console.log('Ducky PDF Editor background service worker loaded');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pdfDetected') {
    console.log(`PDF detected on page: ${sender.tab?.url}, count: ${request.count}`);
    // Update extension icon or badge to indicate PDF presence
    if (sender.tab?.id) {
      chrome.action.setBadgeText({
        text: request.count.toString(),
        tabId: sender.tab.id
      });
    }
  }
  return true;
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Ducky PDF Editor installed');
    // Initialize extension storage or perform first-time setup
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
}); 