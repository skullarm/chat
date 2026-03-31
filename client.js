// Add to your existing client code after the CSS styles

// AI Chat functionality
let chatHistory = [];
let aiWs = null;
let aiResponseTimeout = null;

// Add chat styles to cssStyles
const chatStyles = `
.chat-container {
  position: fixed;
  bottom: 160px;
  right: 20px;
  width: 380px;
  height: 500px;
  background: #1a1a1a;
  border: 1px solid #4a9eff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(74, 148, 255, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 100000998;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.chat-container.active {
  opacity: 1;
  transform: translateY(0);
}

.chat-header {
  background: #2a2a2a;
  padding: 12px 16px;
  border-bottom: 1px solid #4a9eff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.chat-header:hover {
  background: #333;
}

.chat-title {
  color: #4a9eff;
  font-weight: bold;
  font-size: 14px;
}

.chat-close {
  background: #4a9eff;
  border: none;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #0a0a0a;
}

.chat-message {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 8px;
  word-wrap: break-word;
}

.chat-message.user {
  align-self: flex-end;
  background: #4a9eff;
  color: #000;
}

.chat-message.ai {
  align-self: flex-start;
  background: #2a2a2a;
  color: #eee;
  border: 1px solid #444;
}

.chat-input-container {
  background: #2a2a2a;
  padding: 12px;
  border-top: 1px solid #4a9eff;
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #eee;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.chat-input:focus {
  outline: none;
  border-color: #4a9eff;
}

.chat-send {
  background: #4a9eff;
  border: none;
  color: #000;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.chat-send:hover {
  background: #5ba4ff;
}

.chat-send:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}

.chat-model-select {
  background: #1a1a1a;
  border: 1px solid #444;
  color: #eee;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.chat-loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #4a9eff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}`;

// Add to cssStyles string
cssStyles += chatStyles;

// Initialize AI Chat
function initAIChat() {
  if (ge('aiChatContainer')) return;
  const chatContainer = d.createElement('div');
  chatContainer.className = 'chat-container';
  chatContainer.id = 'aiChatContainer';
  chatContainer.innerHTML = `
    <div class="chat-header" onclick="toggleChat()">
      <span class="chat-title">🤖 AI Assistant</span>
      <button class="chat-close" onclick="closeChat(event)">✕</button>
    </div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-input-container">
      <select class="chat-model-select" id="chatModel">
        <option value="@cf/meta/llama-3.2-1b-instruct">Llama 3.2 1B (Fast)</option>
        <option value="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B (Balanced)</option>
        <option value="@cf/meta/llama-3.1-8b-instruct-fast">Llama 3.1 8B (Fast)</option>
        <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B (Powerful)</option>
      </select>
      <input type="text" class="chat-input" id="chatInput" placeholder="Ask AI..." />
      <button class="chat-send" id="chatSend">Send</button>
    </div>
  `;
  
  d.body.appendChild(chatContainer);
  
  // Event listeners
  ge('chatSend').onclick = sendAIChat;
  ge('chatInput').onkeypress = (e) => {
    if (e.key === 'Enter') sendAIChat();
  };
  
  // Show chat button
  const chatBtn = d.createElement('button');
  chatBtn.innerHTML = '🤖';
  chatBtn.id = 'chatBtn';
  chatBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #4a9eff;
    border: none;
    color: #000;
    font-size: 24px;
    cursor: pointer;
    z-index: 100000997;
    box-shadow: 0 2px 10px rgba(74, 148, 255, 0.5);
  `;
  chatBtn.onclick = toggleChat;
  d.body.appendChild(chatBtn);
}

function toggleChat() {
  const chatContainer = ge('aiChatContainer');
  if (chatContainer.classList.contains('active')) {
    chatContainer.classList.remove('active');
    ge('chatBtn').style.display = 'block';
  } else {
    chatContainer.classList.add('active');
    ge('chatBtn').style.display = 'none';
    ge('chatInput').focus();
  }
}

function closeChat(e) {
  e.stopPropagation();
  ge('aiChatContainer').classList.remove('active');
  ge('chatBtn').style.display = 'block';
}

async function sendAIChat() {
  const input = ge('chatInput');
  const message = input.value.trim();
  const model = ge('chatModel').value;
  
  if (!message) return;
  
  // Add user message to UI
  addChatMessage(message, 'user');
  input.value = '';
  
  // Add to history
  chatHistory.push({ role: 'user', content: message });
  
  // Show loading
  const messagesContainer = ge('chatMessages');
  const loadingDiv = d.createElement('div');
  loadingDiv.className = 'chat-message ai';
  loadingDiv.innerHTML = '<span class="chat-loading"></span>Thinking...';
  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Connect to AI chat endpoint
  if (!aiWs || aiWs.readyState !== WebSocket.OPEN) {
    const hostFromConfig = (typeof sv !== 'undefined' && sv?.value) || (typeof svrs !== 'undefined' && svrs?.[0]) || window.location.hostname;
    const endpointHost = hostFromConfig.includes('.') ? hostFromConfig : `${hostFromConfig}.paytel.workers.dev`;
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsScheme}://${endpointHost}`;
    aiWs = new WebSocket(wsUrl);
    
    aiWs.onopen = () => {
      aiWs.send(JSON.stringify({
        u: 'ai_chat',
        q: typeof O === 'function' ? O() : '',
        au: typeof P === 'function' ? P() : '',
        prompt: message,
        model: model,
        history: chatHistory
      }));
    };
    
    aiWs.onmessage = (m) => {
      let data;
      try {
        data = JSON.parse(m.data);
      } catch (err) {
        console.error('Invalid AI websocket message:', err, m.data);
        return;
      }
      
      if (data.t === 'ai_response') {
        // Remove loading
        if (loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv);
        }
        
        // Add AI response
        addChatMessage(data.d, 'ai');
        
        // Add to history
        chatHistory.push({ role: 'assistant', content: data.d });
      } else if (data.t === 'er') {
        if (loadingDiv.parentNode) {
          loadingDiv.parentNode.removeChild(loadingDiv);
        }
        addChatMessage(`Error: ${data.d}`, 'ai');
      }
    };
    
    aiWs.onclose = () => {
      aiWs = null;
    };
    
    aiWs.onerror = (e) => {
      console.error('AI Chat error:', e);
      if (loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv);
      }
      addChatMessage('Connection error. Please try again.', 'ai');
    };
  } else {
    // Already connected, send message
    aiWs.send(JSON.stringify({
      u: 'ai_chat',
      q: O(),
      au: P(),
      prompt: message,
      model: model,
      history: chatHistory
    }));
  }
}

function addChatMessage(text, type) {
  const messagesContainer = ge('chatMessages');
  const messageDiv = d.createElement('div');
  messageDiv.className = `chat-message ${type}`;
  messageDiv.textContent = text;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add to your existing initialization
initAIChat();
