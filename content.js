// Track selected conversations
let selectedConversations = new Set();

// Add checkboxes to conversations
function addCheckboxesToConversations() {
  const conversations = document.querySelectorAll('.relative.group\\/row');
  
  conversations.forEach(conv => {
    // Skip if checkbox already exists
    if (conv.querySelector('.conversation-checkbox')) return;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'conversation-checkbox';
    checkbox.style.position = 'absolute';
    checkbox.style.left = '-24px';
    checkbox.style.top = '50%';
    checkbox.style.transform = 'translateY(-50%)';
    checkbox.style.zIndex = '1000';

    const link = conv.querySelector('a');
    const conversationId = link?.getAttribute('href')?.split('/').pop();
    
    if (conversationId) {
      checkbox.dataset.conversationId = conversationId;
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedConversations.add(conversationId);
        } else {
          selectedConversations.delete(conversationId);
        }
        updateExportToolbar();
      });
      
      conv.style.position = 'relative';
      conv.insertBefore(checkbox, conv.firstChild);
    }
  });
}

// Create and update export toolbar
function createExportToolbar() {
  let toolbar = document.getElementById('export-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'export-toolbar';
    toolbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: none;
      z-index: 1000;
    `;
    document.body.appendChild(toolbar);
  }
  return toolbar;
}

function updateExportToolbar() {
  const toolbar = createExportToolbar();
  if (selectedConversations.size > 0) {
    toolbar.style.display = 'block';
    toolbar.innerHTML = `
      <span>${selectedConversations.size} conversation${selectedConversations.size > 1 ? 's' : ''} selected</span>
    `;
  } else {
    toolbar.style.display = 'none';
  }
}

// Extract conversation data
async function extractConversationData(conversationId) {
  // This is a placeholder for the actual extraction logic
  // In a real implementation, you would need to navigate to each conversation
  // and extract the messages
  return {
    id: conversationId,
    timestamp: new Date().toISOString(),
    messages: [
      {
        role: "user",
        content: "Sample message",
        timestamp: new Date().toISOString()
      }
    ]
  };
}

// Handle export request
async function exportConversations() {
  try {
    for (const conversationId of selectedConversations) {
      const data = await extractConversationData(conversationId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      chrome.runtime.sendMessage({
        action: "download",
        url: url,
        filename: `claude-conversation-${conversationId}.json`
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
}

// Initialize
function init() {
  // Add checkboxes to existing conversations
  addCheckboxesToConversations();
  
  // Observe DOM for new conversations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        addCheckboxesToConversations();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "export") {
    exportConversations().then(sendResponse);
    return true; // Will respond asynchronously
  }
});

// Start the extension
init();