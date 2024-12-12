document.addEventListener('DOMContentLoaded', function() {
  const exportBtn = document.getElementById('exportBtn');
  const status = document.getElementById('status');

  // Initially disable export button
  exportBtn.disabled = true;

  // Check if we're on Claude's website
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    if (!tab.url?.includes('anthropic.com')) {
      status.innerHTML = '<p style="color: #dc2626;">Please navigate to Claude to use this extension</p>';
      return;
    }

    // Enable export button and set up click handler
    exportBtn.disabled = false;
    exportBtn.addEventListener('click', function() {
      chrome.tabs.sendMessage(tab.id, {action: "export"}, function(response) {
        if (response?.success) {
          status.innerHTML = '<p style="color: #059669;">Export successful!</p>';
        } else {
          status.innerHTML = '<p style="color: #dc2626;">Export failed. Please try again.</p>';
        }
      });
    });
  });
});