// Content script for Ducky PDF Editor
console.log('Ducky PDF Editor content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processPDF') {
    // Handle PDF processing logic here
    console.log('Processing PDF:', request.data);
    sendResponse({ status: 'success' });
  }
  return true;
});

// Function to detect PDF elements on the page
function detectPDFs() {
  const pdfElements = document.querySelectorAll('embed[type="application/pdf"], object[type="application/pdf"]');
  if (pdfElements.length > 0) {
    chrome.runtime.sendMessage({
      action: 'pdfDetected',
      count: pdfElements.length
    });
  }
}

// Run PDF detection when the page loads
detectPDFs();

// Also run detection when the DOM changes
const observer = new MutationObserver(detectPDFs);
observer.observe(document.body, {
  childList: true,
  subtree: true
}); 