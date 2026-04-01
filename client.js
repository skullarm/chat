//***!!FILE MUST BE EXECUTABLE VIA JAVASCRIPTS'S eval() FUNCTION. I AM AWARE OF CONCERNS WITH IT.!!***
//This client app sits behind repressive network restrictions that allow no http(s) requests except to .cloudflare.com domains. only websocket connections are permitted//

// Globals
let d=document,w,u,h=[],n=new TextDecoder(),p=new Map(),a=0,si=0,dl=!!0,dld=!!0,c=!!0,svrInd=0,atmps=4,vdld=!!0,adld=!!0,ge=i=>d.getElementById(i),pdfdl=!!0,getwkr=!!0,mp4boxLoaded=!!0,mp4box,isFading=!!0,firstLoad=!!1,cnclFade=!!0,showBase='https://archive.org/download/',archiveBase='https://archive.org/details/',pdfjsLib=null,dimmed=!!0,audList=[],linkText='',currentFadeEl=null,audPlayer=null,nxtClickTmr=null,playClickTmr=null,prevClickTmr=null,playerVis=!!0,currentMediaIndex=-1,keyList=[],domCache=new Map(),isAnimating=!!0,sliderActive=!!0,sliderLongPressTimer=null,sliderIsDragging=!!0,LONG_PRESS_DURATION=500;

//css variable to attach
const cssStyles = `
.drag-handle{font-size:2.5em;font-family:sans-serif;margin:1px 3px 1px 3px}
.track-num{vertical-align:middle;font-size:0.6em}
button{user-select:none}
.custom-cb{display:flex;align-items:center;cursor:pointer;user-select:none;border 1px solid #665;padding:12px 16px;border-radius:8px;transform:translateY(3px)}
.custom-cb input{display:none}
.checkmark{background-color:#1a1a1a;width:24px;height:24px;border:2px solid #555;border-radius:6px;margin-right:11px;margin-left:-8px;position:relative;transition:all 0.3s ease}
.checkmark::after{content:"";position:absolute;display:none;left:6px;top:2px;width:8px;height:13px;border:solid white;border-width:0 2px 2px 0;transform:rotate(45deg)}
.custom-cb input:checked + .checkmark{background-color:#4a9eff;border-color:#4a9eff;box-shadow:0 0 12px rgba(74,148,255,0.6)}
.custom-cb input:checked + .checkmark::after{display:block}
.custom-cb input:checked ~ span{color:#fff}

.msg-container{display: flex; justify-content: space-between;align-items: flex-start; width:100%;padding: 10px 15px;box-sizing: border-box}
.player-wrapper{display:none;font-size:15px;flex-direction:column;align-items:center;gap:2px;position:relative;transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.68,-0.55,0.27,1.55);opacity:0;transform:translateX(100%);}
.player-wrapper.is-visible{opacity:1;transform:translateX(0);display:flex;}

.track-marquee{width:100%;overflow:hidden;position:relative;height:18px;border-radius:4px;display:flex;align-items:center;flex-shrink:0}
.marquee-content{position:absolute;display:inline-block;white-space:nowrap;padding-left:100%;user-select:none;animation:marqueeScroll 18s linear infinite;padding-left:100%/* animation applied only to playlist items that are playing */}
@keyframes marqueeScroll{0%{transform:translateX(0);} 100%{transform:translateX(-100%);}}

/* playlist-specific marquee behavior */
.playlist-item .marquee-content{animation:none !important;padding-left:0%}
.playlist-item.playing .marquee-content{padding-left:100%;animation: marqueeScroll 18s linear infinite !important;}

/* visual indicator when dragging over an item */
.playlist-item.dragover{border-top:2px solid #4a9eff;}

.col, .col ul {list-style-type: none;padding-left:10px;}
.col li{padding: 5px}
.toggle{padding:12px;}
.toggle::before{display:inline-block;width:17px;content:'➕ ';}
.toggle.show::before{content:'➖ ';}
.col ul{display:none;}
.toggle.show + ul{display:block;}
.sidebar {position: fixed; left: -300px; top: 0; height: 100%; width: 300px; background: #2a2a2a; padding: 3px; transition: left 0.5s ease; z-index: 100000100;color:#eee; display:flex;flex-direction:column;}
.sidebar.open { left: 0; }
#sidebar-options { padding:4px;margin: 10px; border:1px solid #fff}
#sidebar-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sidebar-tab{flex:1;display:none;overflow:auto}
.sidebar-tab.active{display:block}
#sidebar-treeview { flex:1;padding:3px;margin:5px;color: #eee; max-height:100vh;overflow-y:auto;overflow-x:auto} 
#sidebar-tabs{display:flex;justify-content:space-around;padding:4px;background:#1a1a1a;border-top:1px solid #444}
.tab-btn{flex:1;padding:8px 0;background:transparent;;border:none;cursor:pointer;font-size:14px;color:#555}
.tab-btn.active{border:1px solid #4a9eff;background:rgba(0,0,0,0.8);color:#eee;box-shadow:0 0 10px 2px rgba(74,158,255,0.4);transform:scale(1.03)}
#sidebar-playlist ul{list-style:none;padding-left:10px;margin:0}
.playlist-item{display:flex;align-items:center;gap:4px;padding:4px 2px;cursor:pointer}
.playlist-item .text-wrapper{flex:1;overflow:hidden;position:relative;height:18px}
.playlist-item .text-wrapper .marquee-content{position:absolute;display:inline-block;white-space:nowrap;/* animation handled by playing state */}
.remove-btn{margin-left:4px;color:#f88;cursor:pointer}
.remove-after{margin-left:4px}
.playlist-item.playing{box-shadow:0 0 7px 2px rgba(74,148,255,0.4);background:#1a1a1a;border-radius:3px}

#btnCls {position: absolute; top: 15px; right: 15px; padding: 10px 15px; background: #444; color: #fff; border: 1px solid #665; border-radius: 4px; cursor: pointer; display: none;}
.sidebar.open #btnCls {display: inline-block;}
.sidebar.open #btnOpn {display: none;}
#overlay {display:none;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.7);z-index:100000999;font-family:system-ui,sans-serif;align-items:center;justify-content:center;pointer-events: none}
#overlay span{background:#222;color:#eee;padding:2em;border-radius:8px;text-align:center;max-width:500px;border: 1px solid #665}
#pl {background:#1a1a1a;background-color:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;width:100%;height:0vh;overflow:hidden;align-self:center}
.sticky-header {position:sticky;top:0;z-index:100000099;background:#2a2a2a;color:#eee;padding:8px;font-family:system-ui,sans-serif;border-bottom:1px solid #444;}
.sticky-header div {display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.sticky-header button, .sticky-header input {padding:6px 12px;background:#444;color:#fff;border:1px solid #665;border-radius:4px;cursor:pointer}
.sticky-header button:active, span:active{transform:scale(0.95)}
.sticky-header #iu {flex:1;min-width:200px;background:#1a1a1a;color:#eee;font-family:monospace;font-size:12px}
.sticky-header #sv {width:80px;padding:4px;background:#1a1a1a;color:#eee;font-size:11px;text-align:center}
.sticky-header #icon{font-size:1.75em;background:transparent;cursor:pointer;display:none}
.sticky-header label {cursor:pointer;font-size:12px}
#msgs {position: relative;width:100%;margin-top:8px;padding:8px;background:#1a1a1a;border-radius:4px;font-size:12px}
#pg {font-family:monospace;top:0;left:4px;z-index:2;font-weight: bold;font-sizes:15px}
#pb {position: absolute;bottom:0;left:0;height:10px;background:linear-gradient(to right,#1a1a1a 0%, green 100%);width:0%;transition: width 0.3s ease;z-index:1}
#ct {display:block;font-family:system-ui,sans-serif;color:#eee;background:#1a1a1a;width:100vw;height:100vh;overflow:auto}
#ct  div{background:#1a1a1a;flex:1;width:100%;height:100%;overflow:auto}
#ct img, #ct video {max-width:100%;height:auto;margin:8px 0;border-radius:4px}
#ct a {color:#4a9eff;text-decoration:none;}
#ct a:hover {text-decoration:underline}
#ct h1, #ct h2, #ct h3 {color:#fff;margin:16px 0 8px}
#ct pre {background:#111;padding:12px;overflow:auto;border-left:3px solid #4a9eff;margin:8px 0}
#ct button {padding:6px 12px;background:#4a9eff;color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:bold}
#ct button:hover {background:#5ba4ff}
.media-content{opacity:0;position:absolute;top:0;left:0;width:100%;height:100%;opacity;0;transition:transform 0.4s ease-in-out;display:flex;justify-content:center;align-items:center;z-index:1;border:1px solid #444;border-radius:4px}
.media-content.active{opacity:1;transform:translateX(0);z-index:2}
.slide-left{transform:translateX(-100%);}
.slide-right{transform:translateX(100%);}
.animating{transition:transform 0.4s ease-in-out,opacity 0.4s;}
.media-close-btn{
 opacity:1;
 position:absolute;
 top:10px;right:10px;z-index:100;background:rgba(255,0,0,0.7);color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:bold;}
#prev-media.fade-out,#next-media.fade-out {opacity:0}
#prev-media,#next-media{
 opacity:1;
 position:absolute;
 top:50%;
 transform:translateY(-50%);
 background:rgba(255,255,255,0.2);
 border:1px solid rgba(255,255,255,0.5);
 padding:8px;
 cursor:pointer;
 font-size:28px;
 z-index:11}
.md-nav{transition: opacity 0.6s ease-out;will-change:opacity}
.md-nav.fade-out{opacity:0}
#prev-media{left:10px}
#next-media{right:10px}
.collapse-button{position:absolute;top:-3px;left:0px;transform:scale(1.75);transform-origin:top left;border:none;background-color:transparent}
.seek-slider-container{position:fixed;bottom:0;left:0;right:0;height:0;background:#1a1a1a;border-top:2px solid #4a9eff;opacity:0;transform:translateY(100%);transition:opacity 0.2s ease,transform 0.2s ease;z-index:100001000;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0}
.seek-slider-container.active{height:140px;opacity:1;transform:translateY(0);pointer-events:all;padding:12px}
.seek-slider-wrapper{width:90%;display:flex;flex-direction:column;align-items:center;gap:10px}
.seek-slider-label{color:#eee;font-size:13px;text-align:center;white-space:nowrap;font-family:system-ui,sans-serif}
.slider-track{width:100%;height:8px;background:#444;border-radius:4px;position:relative;cursor:pointer;box-shadow:0 0 6px 2px rgba(74,158,255,0.7)}
.slider-fill{height:100%;background:#4a9eff;border-radius:4px;pointer-events:none}
.slider-handle{position:absolute;top:50%;right:0;transform:translate(50%,-50%);width:32px;height:32px;background:#4a9eff;border-radius:50%;box-shadow:0 2px 8px rgba(74,158,255,0.6);cursor:grab;pointer-events:all}
.slider-handle:active{cursor:grabbing;box-shadow:0 4px 12px rgba(74,158,255,0.8)}
.seek-slider-time{color:#4a9eff;font-size:14px;font-weight:bold;font-family:monospace;text-align:center}
`;
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
        <optgroup label="Fast & Lightweight">
          <option value="@cf/meta/llama-3.2-1b-instruct">Llama 3.2 1B (Fastest)</option>
          <option value="@cf/meta/llama-3.2-3b-instruct">Llama 3.2 3B (Balanced)</option>
        </optgroup>
        <optgroup label="Powerful">
          <option value="@cf/meta/llama-3.1-8b-instruct-fast">Llama 3.1 8B (Fast)</option>
          <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B (Most Capable)</option>
        </optgroup>
        <optgroup label="Other Options">
          <option value="@cf/baichuan-inc/Baichuan2-13B-Chat">Baichuan2 13B</option>
          <option value="@cf/microsoft/phi-2">Microsoft Phi-2</option>
        </optgroup>
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
    const serverName = sv.value || svrs[0];
    aiWs = new WebSocket(`wss://${serverName}.paytel.workers.dev`);
    
    aiWs.onopen = () => {
      aiWs.send(JSON.stringify({
        u: 'ai_chat',
        q: O(),
        au: P(),
        prompt: message,
        model: model,
        history: chatHistory
      }));
    };
    
    aiWs.onmessage = (m) => {
      const data = JSON.parse(m.data);
      
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


// Constants
const svrs=['osric','wit','bilboes','phone','call','text','kazak','argos','sv1','skip','trace','alice','harley','turbo','truth','uwtb','light','dark'];
const segOptions={nbSamples:250},
 MP4_MSE_THRESHOLD=380*1024*1024,//files (made into blobs/objectURLs) cause my browser to crash so cutt-off at this point. Will try to fragment mp4's larger than this in the browser as chunks arrive using mp4box.js, then feed segments to mse source buffer that can be trimmed to prevent memory overload. Range requests can pull chunks of large mp4's down and feed through a mp4box.js to mse pipeline, so long as I have initSegs/moov info. Not currently able to do so.
  SEG_QUEUE_LIMIT=30;//related to mp4box and mse pipeline. Trying to prevent swamping buffer. Not currently used of fully understood

const mediaExts = ['.mp4', '.webm', '.ogv','.mp3','.flac'];

const CLICK_DELAY=450,//double vs single click delay
  MAX_MSG_LNGTH=100;

// HTML setup for client
d.body.innerHTML=`
<div id='overlay'><span id='dimmsg'><h2>Double-Tap Anywhere</h2><p><h3>To Turn Dimmer Off</h3></span></div>
<div id='pl'>
 <button class='md-nav'  id='prev-media'>↩</button>
 <button class='md-nav'  id='next-media'>↪</button>
</div>
<div class='sticky-header'>
<div>
<button id='btnOpn'>🌫</button>
<button id='bck'>🔙 BCK</button>
<button id='rf'>🔄 RF</button>
<input id='iu' placeholder='https://...' /><span id='icon'>🎶</span>
<input id='sv' placeholder='SVR' readOnly />
<label class='custom-cb'>
<input id='cb' type='checkbox'/><!-- <label for='cb'>Auto</label>-->
<span class='checkmark'></span>
<span>Auto</span>
</label>
<input id='bs' type='button' />
<button id='hide'>💡</button>
</div>
<div id='msgs' class='msg-container'>
 
 <span id='pg' class='msg-text'></span>
 <div id='pb'></div>
<div id='aud-wrapper' class='player-wrapper' style='display:none'>
 <!--<div id='collapseButton' class='collapse-button'>➖</div>-->
  <div class='duration-wrapper'>
   <div id='trackTimeDetail'>0:00:00</div>
  </div>
 <div class='aud-controls' style='display:flex;justify-content:space-between'>
  <button id='btn-prev'>⏮</button>
  <button id='btn-play'>▶</button>
  <button id='btn-next'>⏭</button> | <button id='btn-close-player' styles='justify-content:space-between'>✖</button>
 </div>
 <div id='marqueeContainer' class='track-marquee'>
  <div id='marqueeContent' class='marquee-content'>
   Test CntentHere...
  </div>
 </div>
</div>
</div>
<div id='seekSliderContainer' class='seek-slider-container'>
 <div class='seek-slider-wrapper'>
  <div class='seek-slider-label'>Slide to seek</div>
  <div class='slider-track'>
   <div class='slider-fill' id='sliderFill'></div>
   <div class='slider-handle' id='sliderHandle'></div>
  </div>
  <div class='seek-slider-time'><span id='sliderTime'>0:00</span> / <span id='sliderDuration'>0:00</span></div>
 </div>
</div>
</div>
<div id='ct'></div>
<div id='sidebar' class='sidebar'>
<button id='btnCls'style='display:none'> ✖ </button>
🍿 Clandestine Entertainment  🎵
<div id="sidebar-content">
  <div id="tab-shows" class="sidebar-tab active">
    <div id="sidebar-treeview">LOADING...</div>
  </div>
  <div id="tab-music" class="sidebar-tab">
    <div id="sidebar-playlist" style="padding:10px;color:#ccc">No music added</div>
  </div>
</div>
<div id="sidebar-tabs">
  <button id="tab-btn-shows" class="tab-btn active">Shows</button>
  <button id="tab-btn-music" class="tab-btn">Music</button>
</div>
</div>
`;

const originalURL=globalThis.URL;//for adding parse to URL class

// Element refs
let bck=ge('bck'),iu=ge('iu'),rf=ge('rf'),sv=ge('sv'),cb=ge('cb'),hide=ge('hide'),pg=ge('pg'),overlay=ge('overlay'),bs=ge('bs'),pl=ge('pl'),ct=ge('ct'),msgs=ge('msgs'),pb=ge('pb'),sidebar=ge('sidebar'),tree=ge('sidebar-treeview'),trackDetails=ge('trackDetails'),prev=ge('btn-prev'),next=ge('btn-next'),close=ge('btn-close-player'),play=ge('btn-play'),audDiv=ge('aud-wrapper'),prevMedia=ge('prev-media'),nextMedia=ge('next-media'),mediaContainer=ge('pl'),trackTimeDetail=ge('trackTimeDetail'),seekSliderContainer=ge('seekSliderContainer'),sliderHandle=ge('sliderHandle'),sliderFill=ge('sliderFill'),sliderTrack=ge('sliderTrack')||ge('slider-track'),sliderTime=ge('sliderTime'),sliderDuration=ge('sliderDuration'),sliderTrackEl=d.querySelector('.slider-track');

// Shadow DOM
let sd=ct.attachShadow({mode:'open'});
sd.innerHTML='<style>:host{all:initial}*{box-sizing:border-box};</style>';

//to put pdf's in and out of 'dark' mode
let toggleInvert=root=>{
 let el=root.getElementById('cvspdf');
 if(el.style.filter.includes('invert')){
  el.style.filter='none';
 }else{
   el.style.filter='invert(1) grayscale(20%)';
 }
};

//html for my simple pdf viewer
let pdfHTMLStr=`
<DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PDF Viewer</title>
</head>
<body>
<div style='background-color:#2a2a2a'>
<span style='font-size:17'>Page <input type="number"  id="pg" min="1" value=1 style="width:4%; font-size:17"> of <span id="pgcnt" style="font-size:17">-1</span></span>   <button id='tgl'>Mode</button>
</div>
<canvas id="cvspdf" style="filter: invert(1) grayscale(20%)"></canvas>
</body>
`;
// Some Utils
let U=(i,el=pg)=>new Promise((res)=>{ el.style.display='block';el.textContent=i;res(el);}),//Update msgs, etc
ic=(e,i)=>e.includes(i),//includes
sw=(e,i)=>e.startsWith(i),//startsWith
rm=(e,i)=>e.removeChild(i),//remove
J=(e,i)=>e.appendChild(i),//appendChild (J for JoinTo)
W=(e,i)=>e.innerHTML=i,//write an elements innerHTML
getRandom=(max=100)=>Math.floor(Math.random()*max),

//show or hide mediaDivc at top of app
toggleMediaDiv=(show=!!1)=>{if(show)pl.style.height='100vh';else pl.style.height='0vh';},

//show or hide little custom audio player front-end
togglePlayerVisible=()=>{
 playerVis=!playerVis;
 if(playerVis){
  audDiv.style.display='flex';
  void audDiv.offsetWidth;//hack to reset css animation
  audDiv.classList.add('is-visible');
 }else{
   audDiv.classList.remove('is-visible');
   setTimeout(()=>{
    audDiv.style.display='none';
   },501);
}
},

//format time into suitable string for display for audio tracks
formatTime=secs=>{
 if(isNaN(secs))return '0:00';
 const totSec=Math.floor(secs);
 const hour=Math.floor(totSec/3600);
 const min=Math.floor((totSec %3600) / 60);
 const sec=totSec%60;
 const strM=min.toString().padStart(2,'0');
 const strS=sec.toString().padStart(2,'0');
 let rStr=hour>0 ? `${hour}:${strM}:${strS}` : `${strM}:${strS}`;
 return rStr;
},

//helper for loading scripts into app
loadScript=(url,isModule=false)=>{
 return new Promise((res,rej)=>{
  const sc=l('script');
   if(isModule)sc.type='module';
   sc.src=url;
   
   sc.onload=()=>res(window.pdfjsLib);
   sc.onerror=er=>rej(W(pl,`Failed to load ${url}`));
   J(d.head,sc);
 });
},

////Some pdf view functions///
prevPage=r=>{
 r.pageNum--;
 queueRenderPage(r);
},
nextPage=r=>{
 r.pageNum++;
 queueRenderPage(r);
},
setUpPDF=r=>{
r.scale=1.5;r.touchStartX=0;r.touchEndX=0;r.swipeThresh=50;r.pdfDoc=null;r.pageNum=1;r.isRendering=!!0;r.pending=null;r.html=new DOMParser().parseFromString(pdfHTMLStr,'text/html');W(sd,r.html.body.innerHTML);r.canvas=sd.getElementById('cvspdf');r.ctx=r.canvas.getContext('2d');r.pgInput=sd.getElementById('pg');r.cntSpan=sd.getElementById('pgcnt');
r.canvas.addEventListener('dblclick',e=>{
 e.stopPropagation();
 const {width,height,left,top}=r.canvas.getBoundingClientRect();
 const x=e.clientX-left;
 const y=e.clientY-top;
 if(x<width/3){prevPage(r);return;}
 if(x>(width*2)/3){nextPage(r);return;}
 if(y<height/3){r.scale+=0.2;}
 else if(y>(height*2)/3){r.scale=Math.max(0.3,r.scale-0.2)}
 else{r.scale=1.5}
 queueRenderPage(r);
});
r.pgInput.onkeydown=e=>{
 if(e.key==='Enter'){
  e.preventDefault();
  let num=parseInt(r.pgInput.value);
  
  if(!isNaN(num) && num>=1 && num<=r.pdfDoc.numPages){
   r.pageNum=num;
   queueRenderPage(r);
  }
 }
};
let el=sd.getElementById('tgl').onclick=()=>toggleInvert(sd);
},
////end pdf functions

// Server change to cycle server name to prevent triggering cloudflare useage restrictions (where my websocket proxy servers reside)
cngSvr=i=>{
  const svr=svrs[svrInd];
  sv.value=svr;
  DL();
  atmps--;
  if(atmps<=0){ svrInd=(svrInd+1)%svrs.length;atmps=4;}
},

//get shows json string.
getShows=()=>{
let ws=new WebSocket('wss://mitre.paytel.workers.dev');
ws.onopen=()=>{
 ws.send(JSON.stringify({u:'CMD_KV_GET?key=shows',au:P()}));
};
ws.onmessage=m=>{
 ws.close();ws='';
let showData=JSON.parse(m.data).d;
 try{treeSU(JSON.parse(showData))}catch(er){W(pl,er)};m='';
};
},

//set up tree for media content
treeSU=(data)=>{
  if(!data)return;
  const genres=Object.keys(data).sort();
  const sorted={};
  for(const genre of genres){
   const shows=data[genre].sort((a,b)=>{
     const titCmp= a.title.localeCompare(b.title);
    if(titCmp!==0)return titCmp;
    return a.ssn-b.ssn;
   });
   sorted[genre]=shows 
  }
   let ht=`<ul class='col'>`;
   for(const genre in sorted){
     ht+=`<li>${genre}`;
     ht+='<ul>';
     for(const show of sorted[genre]) {
       ht+=`<li>${show.title} (S${show.ssn} | ${show.lang} | ${show.src})`;
       ht+='<ul>';
      for(const ep of show.episodes){
      if(!show.isArchive){ ht+=`<li><a href="${showBase+show.path + ep.file+show.format}">Episode ${ep.num}</a></li>`;}
      else{ht+=`<li><a href="${archiveBase+show.path+ep.file}">Archive ${ep.num}</a></li>`;}
      }
    ht+='</ul></li>';
    }
   ht+='</ul></li>';
 }
 ht+='</ul>';
 W(tree,ht);
 Q(1,tree,'.col ul').forEach(itm=>{
  let tog=l('div');
  tog.innerHTML=itm.previousSibling.textContent;
  tog.className='toggle';
  tog.onclick=()=>tog.classList.toggle('show');
  itm.parentElement.removeChild(itm.previousSibling);
  itm.parentElement.insertBefore(tog,itm);
 });L();
},

// Set input URL
Su=i=>{
  i='';
  if(ic(u.protocol,'p:'))i='http://';
  iu.value=i+u.hostname+u.pathname+u.search+u.hash;
  if(ic(iu.value,'RU=https://')){let val=iu.value;val=val.split('RU=https://')[1].split('/RK=')[0];iu.value=val};
},

//Truncate long url strings to shorten displayed messages 
truncate=(str,limit=MAX_MSG_LNGTH)=>{
 if(str.length<=limit)return str;
 const cntLen=limit-3;
 const half = Math.floor(cntLen/2);
 const start=str.slice(0,half);
 const end=str.slice(str.length-half);
 return `${start}...${end}`;
},

//Load jszip.js Since .cloudflare.com domains are allowed, get jszip.js directly from cdnjs. This library is needed for pdfjs
ldJSZip=()=>{
 let sc=l('script');
 sc.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
 sc.onload=()=>{ldEpubJS()};
 J(d.head,sc);
},

//Load epub.js. Will use to render epubs. Get from allowed cdnjs
ldEpubJS=()=>{
 let sc=l('script');
 sc.src='https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.2.15/epub.min.js';
 J(d. head,sc);
},

// Load pdf.js and worker from allowed domains
ldpdfJS=async()=>{
   pdfjsLib=await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs',!!1);
   pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';
},

//load jsmediatags for getting meta from audio files
loadJSLib=(url,isModule=false)=>{
   let svr=svrs[getRandom(svrs.length)];
   let ws=new WebSocket(`wss://${svr}.paytel.workers.dev`);
   ws.onopen=()=>{
    let msg={u:url,au:P()};
     ws.send(JSON.stringify(msg));
    };
  ws.onmessage=m=>{
   ws.close();
   ws='';
   let resp=JSON.parse(m.data);
   if(ic(resp.c,'/javascript')){
     let sc=l('script');
     if(isModule)sc.type='module';
     sc.textContent=resp.d;
     sc.onload=()=>U('Loaded jsm');
     sc.onerror=er=>W(sd,er);
     J(d.head,sc);
   }
 m='';
  };
  //loadScript('https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js')
},

loadPdfJS=url=>{
  let svr=svrs[getRandom(svrs.length)];
  let ws=new WebSocket(`wss://${svr}.paytel.workers.dev`);
  ws.onopen=()=>{
    let msg={u:url,au:P()};
    ws.send(JSON.parse(msg));
  };
  ws.onmessage=async m=>{
    ws.close();
    ws='';
    let resp=JSON.parse(m.data);U(resp);
    if(ic(resp.c,'/javascript')){
     const b=new Blob([resp.d],{type:resp.c});
     const oUrl = URL.createObjectURL(b);
     pdfjsLib = await import(oUrl);
     loadPdfJSWorker();
     URL.revokeObjectURL(oUrl);
    }
   };
 m='';
},

loadPdfJSWorker=()=>{
 let svr=svrs[getRandom(svrs.length)];
 let ws=new WebSocket(`wss://${svr}.paytel.workers.dev`);
 const msg={u:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs',au:P()};
 ws.onopen=()=>w.send(JSON.stringify(msg));
 ws.onmessage=async m=>{
  ws.close();w='';
  let resp=JSON.parse(m.data);
  if(ic(resp.c,'/javascript')){
     const b=new Blob([resp.d],{type: resp.c});
     const oUrl=URL.createObjectURL(b);
     pdfjsLib.GlobalWorkerOptions.workerSrc=await import(oUrl);
    URL.revokeObjectURL(oUrl);
  }
 };
},

// Load mp4box via proxy. Not hosted on cdnjs (a cloudflare domain), so a copy is on my server. Get it via the proxy. This will eventually be (with MSE) used to affect playback of mp4 videos larger than 350 mb.
ldmp4box=async i=>{
  if(mp4boxLoaded) return;
  try{
    let ws=new WebSocket('wss://mitre.paytel.workers.dev');
    ws.onopen=()=>{
      ws.send(JSON.stringify({u:'CMD_KV_GET?key=mp4box',au:P()}));
    };
    ws.onmessage=async m=>{
      ws.close();ws='';
      const b=new Blob([JSON.parse(m.data).d],{type:'application/javascript'});
      const url=URL.createObjectURL(b);
      const mod=await import(url);//import to use a modular script
      mp4box=mod;
      mp4boxLoaded=!!1;
    };
  }catch(er){mlog(`ldmp4box: ${er.message||er}`)}
},

// MSE threshold check
shouldUseMSE=r=>!!0,//r.tl>MP4_MSE_THRESHOLD,  False for now, as Mp4box and mse functionality is not working

// Media detection
isMedia=u=>mediaExts.some(ext=>u.pathname.toLowerCase().endsWith(ext)),

// WebSocket setup
C=i=>{
  w=new WebSocket(`wss://${sv.value}.paytel.workers.dev`);
  w.binaryType='arraybuffer';
  w.onclose=async i=>{
    c=!!0;
    S();
   //when a connection closee, see if there are any 'open' requests to try and continue to download
    for(let r of p.values()){
      if(r.o && !r.i && !r.overThreshold){
        if(cb.checked&&(vdld||adld)){cngSvr();await Rw();Z(r.u,r.q,!!0,r.b,r.method,null)}
        else{vdld=!!0;adld=!!0;
          let e=l('button'),ee=l('button');
          e.innerText='Play Partial?';
          e.style.margin='4px';
          e.onclick=a=>{vdld=!!1;W(sd,'');handleEndOfStream(r.q)};
          J(sd,e);
          ee.innerText='Continue Downloading?';
          ee.onclick=async a=>{await Rw();W(sd,`<h2>Continuing from ${r.b} of ${r.tl}</h2>`);Z(r.u,r.q,!!0,r.b,r.method,null)};
          J(sd,ee);
          break;
        }
      }
    }
  };
  w.onopen=i=>{
   c=!!1;S();
   if(firstLoad)joke()
  };
  w.onmessage=m=>{
    if(m.data instanceof ArrayBuffer)handleStream(m.data);//uint8Array data means streamed data
    if(typeof m.data==='string')handleResponse(m.data);
  };
  m=null;
},

// Connection status color
S=i=>{if(c){bs.style.backgroundColor='#4a9eff'}else{bs.style.backgroundColor='#ee4455'}},

// Proxy URL (handle specials);t is a boolean for 'track' meaning should we keep this request in history (true) or is it a background request like loading images, css etc (t=false)
Yy=async t=>{
  if(t)pg.style.opacity=1;
  if(!c)await Rw();
  let x='';
  if(ic(iu.value,'p:')){
    x=iu.value
  }else if(sw(iu.value,'?')){
    x=`https://search.aol.com/search?q=${iu.value.slice(1)}`
  }else if(sw(iu.value,'!')){
    x=`https://search.aol.com/search?q=archive.org ${iu.value.slice(1)}`
  }else if(sw(iu.value,'anysex.com')&&ic(iu.value,'/?br=')){
    x='https://'+iu.value.split('?br=')[0]+'?br=10000';
  }else if(sw(iu.value,'xcafe.com')&&ic(iu.value,'/?download=')){
    x='https://'+iu.value.split('?download=')[0]+'?br=10000';
  }else{
    x=`https://${iu.value}`
  }
  u=new URL(x);
 let method = 'GET';

  Z(u,'',t,0,method,'');
},

// Exec JS response
JS=async i=>{let e=l('script');e.textContent=i;try{J(document.body,e)}catch(er){U(er)}await Wt('',()=>pdfjsLib,0);if(getwkr){let src=window.URL.createObjectURL(new Blob([i],{type:'application/javascript'}));try{pdfjsLib.GlobalWorkerOptions.workerSrc=src;getwkr=!!0}catch(er){U(er)}}},

// Handle string msgs
handleResponse=async i=> {
  //f=data from ws message (facts);t in this case is 'type' of response
  let f=JSON.parse(i),t=f.t;
  if(t==='s'){//type is Stream
    let r=p.get(f.q);//r is 'request' q is requestId
    if(!r)return;
    r.c=f.c;r.o=!!1;//r.c is request contentType. r.o is setting request to Open
    let meta=JSON.parse(f.d);
    if(!r.tl)r.tl=meta.totalLength||0;
    r.mb=(r.tl/1048576).toFixed(2);//convert to megabytes (1024*1024)
    if(sw(r.c,'video')){
      r.v=!!1;vdld=!!1;//request.video is true and vdld (video downloading)
    }
    if(sw(r.c,'audio')){r.a=!!1;adld=!!1}//request.audio is true and adld (audioDownloading)
    if(sw(r.c,'image')){r.i=!!1;r.img=l('img')}//request.image
    if(ic(r.c,'application/pdf')){r.pdf=!!1;/*setUpPDF(r)*/}
    if(ic(r.c,'epub'))r.epub=!!1;

    r.usesMSE=shouldUseMSE(r);

  //Give user feedback when media loaded
    if(r.v && !r.usesMSE){r.vid=l('video');r.vid.controls=!!1;r.vid.addEventListener('canplaythrough',loadDone)}
    if(r.a && !r.usesMSE){r.vid=l('video');r.vid.controls=!!1;r.vid.addEventListener('canplaythrough',loadDone)}
  }
  else if(t==='r'){
   if(ic(f.c,'/html')){H(f.d)}
 //  else if(ic(f.c,'/javascript')){JS(f.d)}
   else if(ic(f.c,'/css')){z(f.d)}
  else{W(sd,`<pre>${escapeHtml(f.d)}</pre>`)}
 }
  else if(t==='e'){handleEndOfStream(f.q)}
  else if(t==='er'){U(f.d);await Rw()}
  else if(t==='info'){U(f.d)}
},

//feedback that media has loaded
loadDone=r=>{
 r.target.removeEventListener('canplaythrough',loadDone);
 U(`${pg.innerText}..DONE!`);//Update message
 fade(pg);
},

// Handle binary chunks
handleStream=async buf=>{
  let x=new Uint8Array(buf),
   reqIdBytes = 9,
   reqIdStr = n.decode(x.subarray(0, reqIdBytes)).trim(),//get requestId
   r = p.get(reqIdStr),//get request from map
   payload = x.subarray(reqIdBytes);
   if(!r) return;
   r.f.push(payload);
   r.b += payload.length;
   let prct=((r.b/r.tl)*100).toFixed(2);
   if(!dld&&prct<=100){
    U(`Download Progress: ${(r.b/1048576).toFixed(2)} of ${r.mb} mb (${prct}%)`);
    pb.style.width=`${prct}%`;
  }

//close connection when over limit of size of mp4 browser can handle as a blob and call endOfStream
 if(r.b>MP4_MSE_THRESHOLD){
  r.overThreshold=!!1;
  w.close();
  handleEndOfStream(r.q);
 }
},

// End stream/chunk
handleEndOfStream=async q=>{
  const r = p.get(q);
  if (!r) return;
   r.blob=new Blob(r.f,{type: r.c});
    r.ou=window.URL.createObjectURL(r.blob);
    if(r.i){
      handleImages(Q('',sd,`img[data-pq="${q}"]`),r);//Q is querySelector.Looking for an img with matching requestId
     }
    else if(r.pdf){r.h=!!1;pb.style.width='0%';await U('Loading PDF...');setUpPDF(r);HPDF(r);}
    else if(r.epub){try{var book=ePub(r.ou).ready.then(function(){ var rend=book.renderTo("pl",{method:"default",width:"100%",height:"100%"}); var dis=rend.display()} );}catch(er){W(pl,er)}}
    else if(r.a){r.h=!!1;
     pl.scrollTo({top:0,behavior:'smooth'});
     pb.style.width='0%';
       if(audList.length===0&&r.a){//first audio file...inform we are setting it up
        await U('Loading Audio...');
        await DL(1000);
      }else if(audList.length>0 && r.a){//inform that it is being added to player queue
        await U('Adding to Playlist..');
        await DL(600);
       await U(`${pg.innerText}Done`);
       fade(pg)
    }
     handleAudio(r);
     adld=!!0;//done downloading
   }else if(r.v){
    pl.scrollTo({top:0,behavior:'smooth'});
     pb.style.width='0%';await U('Loading Video. Calm Your Tits...');await DL(250);vdld=!!0;
     handleVideo(r);
   }
},

// Media events
E=(e,r)=>{if(r.i){ e.onload=()=>V(r) }else{ e.onended=()=>r.o=!!0}e.onerror=()=>V(r)},

// Insert image
handleImages=(i,r)=>{//i is a reference to a img element if found with Q call in call to this fumctiom, r is request object
  if(r.k){//r.k means was the request a linK (i.e. user clicked a link, so keep track of it
   if(firstLoad){//for goofy images when app loads
     r.img.src=r.ou;E(r.img,r);J(sd,r.img);firstLoad=!!0;iu.value='';
    }else{ 
     if(keyList<=0)toggleMediaDiv();//first media element, so open media div
     if(!keyList.includes(r.q)){
      keyList.push(r.q);
      if(!domCache.has(r.q))createMediaContentDiv(r);//create mediaContentDiv and keep account of ot
      if(keyList[keyList.length-1]===r.q)showMedia(r.q,1);
     }
   }
    fade(pg)
   }else if(!r.k&&!i){V(r)//instances where perhaps server is still returning requested images, but iser has changed proxied page and no img element was!found. ReVoke the objectURL and move on
   }else{
    si--;E(i,r);i.src=r.ou;//si is a counter for requested images,as they arrive decrement it. Set the img's src
    if(si<=0)dld=!!0
   }
},

//clean up audio player stuff on close
closePlayer=async r=>{
 hideSeekSlider();
 audPlayer.pause();
 audPlayer.removeAttribute('src');
 audPlayer.load();
  if(r) V(r);
 for(const t of audList)V(t.data)//ReVoke urls
 audList=[];
 renderPlaylist();
 ge('icon').style.display='none';
 if(playerVis){togglePlayerVisible();await DL(600)}
ge('aud-wrapper').style.display='none';playerVis=!!0;
 audPlayer=null;
 next.removeEventListener('click',tryNext);
 next.removeEventListener('dblclick',seekForward);
 prev.removeEventListener('click',tryPrev);
 prev.removeEventListener('dblclick',seekBack);
 play.removeEventListener('click',togglePlay);

 // clear any pending timers just in case
 if(nxtClickTmr){ clearTimeout(nxtClickTmr); nxtClickTmr=null; }
 if(prevClickTmr){ clearTimeout(prevClickTmr); prevClickTmr=null; }
},

//mediaContent navigation
showNavBtns=()=>{Q(1,d,'.md-nav').forEach(btn=>{btn.classList.remove('fade-out');setTimeout(hideNavBtns,3500)})},
hideNavBtns=()=>Q(1,d,'.md-nav').forEach(btn=>btn.classList.add('fade-out')),

//basically a media card
createMediaContentDiv=r=>{
 const mediaDiv=l('div');
 mediaDiv.className='media-content';
 mediaDiv.id=`media-${r.q}`;
 // mediaDiv.addEventListener('click',()=>showNavBtns());
 let mediaEl;
 if(r.v){
   mediaEl=l('video');
   mediaEl.src=r.ou;
   mediaEl.controls=!!1;
   mediaEl.ontouchstart=()=>showNavBtns();
   mediaEl.addEventListener('canplaythrough',loadDone);
 }else if(r.i){ 
   mediaEl=l('img');
   mediaEl.src=r.ou;
  mediaEl.onclick=()=>showNavBtns();
 }
 E(mediaEl,r);
 mediaEl.style.width='100%';
 mediaEl.style.height='100%';
 mediaEl.style.objectFit='contain';//maybe should be 'cover'?
 const btnClose=l('button');
  btnClose.className='media-close-btn md-nav';
  btnClose.innerText='X';
  btnClose.onclick=()=>{r.h=!!0;closeMedia(r.q)};
  mediaDiv.appendChild(mediaEl);
  mediaDiv.appendChild(btnClose);
  mediaContainer.appendChild(mediaDiv);
  domCache.set(r.q,mediaDiv);
},


handleVideo=async r=>{
  r.h=!!1;//r.h is a flag.for 'holding' a request. Keeps objectURL from being revoked for videos. This allows user to proxy other pages without destroying video src's. Revoked when media element closed
   cb.checked=!!0;
    if(keyList.length<=0)toggleMediaDiv();
     if(!keyList.includes(r.q)){
         keyList.push(r.q);
        if(!domCache.has(r.q))createMediaContentDiv(r);
        if(keyList[keyList.length-1]===r.q)showMedia(r.q,1);
   }
},

//Time tracker for audio
updateTrackTimeDetail=(cur=audPlayer.currentTime,tot=audPlayer.duration)=>{
 if(!cur || !tot){
 trackTimeDetail.textContent='0:00:00';
}else{
 trackTimeDetail.textContent=`${formatTime(cur)} of ${formatTime(tot)}`;
}
},

//get audio player set up with eventListeners. 
handleAudio=async r=>{
 cb.checked=!!0;
    if(!audPlayer){
      audPlayer=l('audio');//the 'l' function is for eLement (i.e. createElement)
      audPlayer.controls=!!0;
      audPlayer.addEventListener('timeupdate',()=>{
     updateTrackTimeDetail();
    }); 
     //need wrapper to pass arg and keep ref for listener removal
      let closeWrapper=()=>{closePlayer(r);ge('btn-close-player').removeEventListener('click',closeWrapper);}
      close.addEventListener('click',closeWrapper);
      next.addEventListener('click',tryNext);
      next.addEventListener('dblclick',seekForward);
      prev.addEventListener('click',tryPrev);
      prev.addEventListener('dblclick',seekBack)
      play.addEventListener('click',togglePlay);
      initializeSliderEvents();
    }    
    audPlayer.addEventListener('canplaythrough',loadDone);
    let tags=await parseMediaTags(r)||{};

     let trackInfo={data: r, tags: tags, removeAfter:false};
     audList.push(trackInfo);
     renderPlaylist();
     if(audList.length===1){
       audPlayer.src=r.ou;
       ge('icon').style.display='inline-block';
       togglePlayerVisible();
       playTrack(0);
       audPlayer.onended=async()=>{
         // when a track finishes, check for auto-remove flag
         const curIdx=parseInt(audPlayer.dataset.trackIndex);
         if(audList[curIdx] && audList[curIdx].removeAfter){
           audList.splice(curIdx,1);
           renderPlaylist();
           if(audList.length===0){closePlayer();return;}
         }
         nextTrack();
       };
    }
},

//display image or video in media content div
showMedia=(key,dir)=>{
  if(isAnimating)return;
  const index=keyList.indexOf(key);
   if(index===-1)return;
   const currentEl=currentMediaIndex>-1 ? domCache.get(keyList[currentMediaIndex]) : null;
   const nextEl=domCache.get(key);
   if(!nextEl)return;
   if(currentMediaIndex===index){
    nextEl.classList.add('active');
   currentMediaIndex=index;
   return;
   }
  isAnimating=!!1;
  const outClass=dir===1 ? 'slide-right' : 'slide-left';
  const inClass='active';
  nextEl.classList.add(inClass);
  nextEl.classList.remove('slide-right','slide-left');
  if(currentEl){
   currentEl.classList.remove('active');
   currentEl.classList.add(outClass);
  }

  setTimeout(()=>{
   if(currentEl){
    currentEl.classList.remove(outClass);
    currentEl.classList.remove('active');
   }
  currentMediaIndex=index;
  isAnimating=false;
  },401);
hideNavBtns();
},

closeMedia=key=>{try{
  if(isAnimating)return;
  const index=keyList.indexOf(key);
  if(index===-1)return;
  const data=p.get(key);
  if(data)V(data);
  const el=domCache.get(key);
  if(el){
   el.remove();
   domCache.delete(key);
  }
 keyList.splice(index,1);
 if(index<currentMediaIndex){
 }else if(index===currentMediaIndex){
   if(keyList.length>0){
    const nextKey=keyList[0];
    showMedia(nextKey,1);
   }else{
    currentMediaIndex=-1;
    toggleMediaDiv(!!0);
  }
 }}catch(er){W(pl,er)}
},

// helper that moves the audio a few seconds (positive or negative)
seekAudio=(secs)=>{
  if(!audPlayer) return;
  let t = audPlayer.currentTime + secs;
  if(t < 0) t = 0;
  if(audPlayer.duration && t > audPlayer.duration) t = 0;
  audPlayer.currentTime = t;
},

//Show the seek slider with nice animation
showSeekSlider=()=>{
  if(!audPlayer||!audPlayer.duration)return;
  sliderActive=!!1;
  seekSliderContainer.classList.add('active');
  updateSliderDisplay();
  sliderIsDragging=!!0;//reset dragging state
},

//Hide the seek slider
hideSeekSlider=()=>{
  sliderActive=!!0;
  sliderIsDragging=!!0;
  seekSliderContainer.classList.remove('active');
  if(sliderLongPressTimer){
    clearTimeout(sliderLongPressTimer);
    sliderLongPressTimer=null;
  }
},

//Update slider visual position and time display
updateSliderDisplay=()=>{
  if(!audPlayer||!audPlayer.duration)return;
  const percent=(audPlayer.currentTime/audPlayer.duration)*100;
  sliderFill.style.width=`${percent}%`;
  sliderHandle.style.left=`${percent}%`;
  sliderTime.textContent=formatTime(audPlayer.currentTime);
  sliderDuration.textContent=formatTime(audPlayer.duration);
},

//Get slider position from mouse/touch event
getSliderPosition=e=>{
  if(!sliderTrackEl)return 0;
  const rect=sliderTrackEl.getBoundingClientRect();
  let clientX=e.clientX||e.touches?.[0].clientX||0;
  const pos=clientX-rect.left;
  return Math.max(0,Math.min(pos/rect.width,1));
},

//Handle slider drag for seeking
handleSliderDrag=e=>{
  if(!sliderIsDragging||!audPlayer||!audPlayer.duration)return;
  e.preventDefault();
  const percent=getSliderPosition(e);
  const newTime=percent*audPlayer.duration;
  audPlayer.currentTime=newTime;
  updateSliderDisplay();
},

//Handle slider drag start
handleSliderDragStart=e=>{
  if(!sliderActive||!audPlayer||!audPlayer.duration)return;
  e.preventDefault();
  sliderIsDragging=!!1;
  const percent=getSliderPosition(e);
  const newTime=percent*audPlayer.duration;
  audPlayer.currentTime=newTime;
  updateSliderDisplay();
},

//Handle slider drag end
handleSliderDragEnd=()=>{
  sliderIsDragging=!!0;
},

//Initialize slider event listeners
initializeSliderEvents=()=>{
  if(!trackTimeDetail)return;
  //Long-press detection on trackTimeDetail
  trackTimeDetail.addEventListener('touchstart',e=>{
    e.preventDefault();
    sliderLongPressTimer=setTimeout(()=>{
      showSeekSlider();
      sliderLongPressTimer=null;
    },LONG_PRESS_DURATION);
  });
  
  trackTimeDetail.addEventListener('touchend',()=>{
    if(sliderLongPressTimer){
      clearTimeout(sliderLongPressTimer);
      sliderLongPressTimer=null;
    }
  });

 /* trackTimeDetail.addEventListener('touchmove',()=>{
    if(sliderLongPressTimer){
      clearTimeout(sliderLongPressTimer);
      sliderLongPressTimer=null;
    }
  });*/

  //Slider interactions
  if(sliderHandle){
    sliderHandle.addEventListener('touchstart',handleSliderDragStart);
  //  sliderHandle.addEventListener('mousedown',handleSliderDragStart);
  }

  if(sliderTrackEl){
    sliderTrackEl.addEventListener('touchstart',handleSliderDragStart);
 //   sliderTrackEl.addEventListener('mousedown',handleSliderDragStart);
  }

  //Global drag handlers
  d.addEventListener('touchmove',handleSliderDrag);
 // d.addEventListener('mousemove',handleSliderDrag);

  //Drag end handlers
  d.addEventListener('touchend',handleSliderDragEnd);
 // d.addEventListener('mouseup',handleSliderDragEnd);

  //Close slider on outside tap
  /*d.addEventListener('touchstart',e=>{
   if(audDiv.contains(e.target))return;
    if(sliderActive&&!seekSliderContainer.contains(e.target)&&!trackTimeDetail.contains(e.target)){
      hideSeekSlider();
    }
  });*/

 /* d.addEventListener('click',e=>{if(audDiv.contains(e.target))return;
    if(sliderActive&&!seekSliderContainer.contains(e.target)&&!trackTimeDetail.contains(e.target)){
      hideSeekSlider();
    }
  });*/

  //Update slider display during playback
  audPlayer.addEventListener('timeupdate',()=>{
    if(sliderActive&&!sliderIsDragging){
      updateSliderDisplay();
    }
  });
},

adjustPlayRate=async ()=>{
 audPlayer.playbackRate+=0.25;
 if(audPlayer.playbackRate>2.0)audPlayer.playbackRate=1.0;
 await U(`Playback Speed: ${audPlayer.playbackRate}`);
 fade(pg);
},

seekForward=(e)=>{
   e.stopPropagation();
  // cancel any pending single-click timer (could be the first click of a dblclick)
  if(nxtClickTmr){
   clearTimeout(nxtClickTmr);
   nxtClickTmr=null;
  }
  seekAudio(10);
},

tryNext=()=>{
 // only schedule nextTrack if we don't already have a timer pending
 if(nxtClickTmr) return;
 nxtClickTmr=setTimeout(()=>{
  nextTrack();
  nxtClickTmr=null;
 },CLICK_DELAY);
},

nextTrack=()=>{
 if(audList.length<1)return;
 let cur=parseInt(audPlayer.dataset.trackIndex);
 // if current track marked remove-after, drop it before moving on
 if(audList[cur] && audList[cur].removeAfter){
   audList.splice(cur,1);
   renderPlaylist();
   if(audList.length===0){closePlayer();return;}
   if(cur>=audList.length) cur=0;
 }
 if(audList.length===1){playTrack(0);return;}
 let index=cur+1;
 if(index>=audList.length)index=0;
 playTrack(index);
},

playTrack=async index=>{

 //---To force css to restart by destroying and readding 
 let container=ge('marqueeContainer');
 let wrapper=ge('marqueeContent');
 rm(container,wrapper);
 let replace=l('div');
 replace.classList.add('marquee-content');
 replace.id='marqueeContent';
 J(container,replace);
//---
 let track=audList[index];
 let tags=track.tags;
 audPlayer.pause();
 audPlayer.removeAttribute('src');//just cleaning up for thoroughness
 audPlayer.load();
 audPlayer.src=track.data.ou;//data in this function is the r (request object) elsewhere. 'ou' is objectUrl
 audPlayer.dataset.trackIndex=index;
 try{
  let trackInfoStr=`${tags.title} (Artist: ${tags.artist} | Album: ${tags.album})`;
 replace.innerText=trackInfoStr;
 let el=await U(`Playing: ${trackInfoStr}`);await DL(800);fade(el);
 playState(!!1);}catch(er){U(er)}
 // update playlist highlight
 renderPlaylist();
},


tryPrev=(e)=>{
 if(prevClickTmr) return;
 prevClickTmr=setTimeout(()=>{
    prevTrack();
    prevClickTmr=null;
 },CLICK_DELAY);
},

prevTrack=async()=>{
 if(audList.length<1)return;
 if(audList.length===1){playTrack(0);return}
 let index=parseInt(audPlayer.dataset.trackIndex)-1;
 if(index<0)index=audList.length-1;
 playTrack(index);
},

seekBack=(e)=>{
   e.stopPropagation();//keep from passing dblclick event to parent div (which has its own dblclick events) when dblclicking prev or next audio btns for seeking
  if(prevClickTmr){
   clearTimeout(prevClickTmr);
   prevClickTmr=null;
  }
  seekAudio(-10);
},

playState=async (playIt)=>{
let el=ge('marqueeContent');
 if(playIt){
   let ind=el.textContent.lastIndexOf(' - PAUSED');
   let rslt=ind===-1 ? el.textContent : el.textContent.slice(0,ind);
   await U(rslt,el);
   audPlayer.play();
   ge('btn-play').textContent='⏸';
 }else{
   await U(`${el.textContent} - PAUSED`,el);
   audPlayer.pause();
   ge('btn-play').textContent='▶';
 }
},

togglePlay=()=>playState(audPlayer.paused),

//pdf render
queueRenderPage=r=>{
 if(r.isRendering)r.pending=r.pageNum;
 else renderPage(r);
},

renderPage=r=>{
 r.isRendering=!!1;
 r.pdfDoc.getPage(r.pageNum).then(pg=>{
   const scale=r.scale;
   const vp=pg.getViewport({scale: scale});
   r.canvas.height=vp.height;
   r.canvas.width=vp.width;
   const renderContext={canvasContext: r.ctx, viewport: vp};
   pg.render(renderContext).promise.then(()=>{
    r.isRendering=!!0;
    r.pgInput.value=r.pageNum;
   });
 });
},

// Render PDF
HPDF=r=>{
pdfjsLib.getDocument({url: r.ou}).promise.then(pdf=>{
 r.pdfDoc=pdf;
 r.cntSpan.textContent=r.pdfDoc.numPages;
 if(r.pagePending!==null){
   renderPage(r);
   r.pagePending=null;
 }fade(pg);
 }).catch(err=>{W(pl,err.message||err)});
},

// Set all open requests to false
So=i=>p.forEach(r=>r.o=!!0),

// Delay
DL=async(i=100)=>new Promise(x=>setTimeout(x,i)),

//timeout
timeout=ms=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('Timed Out')),ms)),

// Wait loop used for delaying in several places
Wt=async(f,t,j)=>{
  if(f)f();while(t()&&j<55){await DL();j++}
},

// Reconnect
Rw=async i=>{
  await Wt(()=>w.close(),()=>c,0);await Wt(C,()=>!c,0)
},

// Query selector
Q=(t,i,j)=>{if(t)return i.querySelectorAll(j);return i.querySelector(j)},

// Revoke non-hold/open
K=i=>p.forEach(r=>{ if(!r.h&&!r.o)V(r) }),

// Cleanup request
V=r=>{if(r.ou)window.URL.revokeObjectURL(r.ou);p.delete(r.q)},

// Handle HTML responses
H=i=>{U(`${pg.innerText}...DONE!`);a=0;si=0;dl=!!0;dld=!!0;bs.value='';let x=new DOMParser().parseFromString(i,'text/html');v(x);if(cb.checked)s(x);W(sd,x.body.innerHTML);L();Q(1,sd,'form').forEach(x=>addFormIntercept(x));fade(pg)},

// Inject styles
s=f=>Q(1,f,'style,link[rel="stylesheet"]').forEach(x=>{if(x.tagName.toLowerCase()==='link'){Z(y(x.href),'',!!0,0)}else{let e=l('style');e.textContent=x.textContent;J(sd,e)}}),

// Random ID ...rand-O
O=i=>Math.random().toString(36).substr(2,9),

// Auth token
P=f=>{
  let x=new Date(),t=x.getUTCFullYear(),i=x.getUTCMonth(),j=x.getUTCDate();return btoa(`${t}${i}${j}`);
},

//mediatags
parseMediaTags=r=>{
 let myTags={artist:'',title:'',album:'',year:'',image:''};

 if(!window.jsmediatags)return mTags;

 return new Promise((resolve,reject)=>{
  window.jsmediatags.read(r.blob,{
    onSuccess: function(rslt){
      let data,format,hasImage=!!0;
      let tags=rslt.tags;

      if(tags.picture){hasImage=!!1;({data,format}=tags.picture);}
     myTags={
       artist: tags.artist || 'Unknown', 
       title: tags.title || r.linkText || r.fileName || 'Unknown', 
       album: tags.album || 'Unknown', 
       year: tags.year||'', 
       image: hasImage
     };
     resolve(myTags);
   },
   onError: function(er){
     reject(er);
   }
 })
});
},

getImgB64String=(data,format)=>{
 let b64="";
 for(const i=0;i<data.length;i++){
  b64+=String.fromCharCode(data[i]);
  }
return b64;
},

// Get Unloaded images
g=j=>Array.from(Q(1,sd,'img')).filter(i=>!i.naturalWidth),

// URL transform
T=i=>i.split('my/learner_')[0].replace('https://learning.paytel.com',''),

// Create URL
y=i=>new window.URL(T(decodeURIComponent(i)),u.origin || 'https://archive.org'),

// Intercept links
L=f=>{
  Q(1,sd,'a').forEach(l=>l.onclick=e=>{e.preventDefault();linkText=l.textContent.replace('download','');u=y(l.href);Su();Yy(!!1)})
  Q(1,tree,'a').forEach(l=>l.onclick=e=>{e.preventDefault();sidebar.classList.remove('open');u=y(l.href);Su();if(isMedia(u))cb.checked=!!1;else cb.checked=!!0;Yy()})
},

// Inject CSS
z=i=>{
  let e=l('style');
  e.textContent=i,
  J(sd,e)
},

// Prep media in HTML
v=f=>Q(1,f,`${!cb.checked ? 'img,' : ''}video,embed,iframe,audio`).forEach(x=>{
  if(!ic(x.src,'data:')){
    let vs=x.src,j,h,e;
    if(!vs){ j=Q('',x,'source');if(j&&j.src)vs=j.src; }
    if(vs){e=l('a');h=l('h1');e.href=vs;e.innerText=x.tagName;J(h,e);J(x.parentNode,h) }
    x.dataset.pq=O();
    x.dataset.pu=x.src;
    x.src='';
  }
}),

// Batch images to prevent too many requests to prxy worker
k=async(x,j)=>{for(let i of x){if(!dl){return}dld=!!1;si++;Z(y(i.dataset.pu),i.dataset.pq,!!0,0);j++;if(!(j%7)){await Wt('',()=>si>0,0);si=0;await Rw()}}if(g().length&&a<5){a++;k(g(),0)}else{a=0;si=0;dl=!!0;bs.value=''}},

// Create elem
l=t=>d.createElement(t),

// Send proxy req
Z=(ur,q,t,b,method,oe=null)=>{
  let uu=y(ur.href||ur);
  if(t){u=uu;if(ic(u.href,'dash.clo')){window.location.href='https://jquery.com';return}else if(ic(u.href,'ai.clo')){window.location.href='https://paytel.com';return}
  if(h.length){if(h[h.length-1].href!==u.href)h.push(u)}else{h.push(u)}
  Su();W(sd,`<h2>${u}</h2>`);ct.scrollTo({top:0,behavior:'smooth'});
  }
  if(!q)q=O();
  if(!method)method='GET';
  if(!p.has(q))p.set(q,{q:q,u:uu,f:[],k:t,b:b,vid:'',aud:'',img:null,mp4boxFile:null,codec:null,trackId:null,usesMSE:!!0,method:method,firstMessage:true,isMedia:isMedia(uu),chunking:false,fileName:getFileName(uu),linkText:linkText||''});
 //  let key='clientCode';
  //  let val=encodeURIComponent(localStorage.getItem('a'))
 //  uu=`CMD_KV_PUT?key=${key}&val=${val}`;
  if(p.get(q).isMedia && ic(u.hostname,'archive.org') ){
  cb.checked=!!1;
  //setUpMp4();
  }
  let msg={u:uu.toString(),q:q,au:P(),os:b,method:method};
  if(oe!==null)msg.oe=oe;
  if(method!=='GET'){msg.body=''}
  w.send(JSON.stringify(msg));
  let strU=truncate(`${u.hostname}${u.pathname}${u.search}${u.hash}`,98);
  if(t)U(`Proxying: ${strU} | Request Id: ${q}..`);
},

//get file name
getFileName=url=>{
let file=decodeURIComponent(url.pathname.split('/').pop());
let extInd=file.lastIndexOf('.');
return extInd===-1 ? file : file.substr(0,extInd);
},

// Mute/pause
mute=i=>Q(1,pl,'video,audio').forEach(x=>{x.muted=i;if(i){x.pause()}else{x.play()}}),

// Sanitize HTML
escapeHtml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'),

// Form data to obj
extractFormData=frm=>{let fd=new FormData(frm),obj={};fd.forEach((v,k)=>{obj[k]=(obj[k]?Array.isArray(obj[k])?[...obj[k],v]:[obj[k],v]:v)});return obj},

// Intercept forms
addFormIntercept=el=>{
  if(el.tagName==='FORM'){
    el.onsubmit=async e=>{
      e.preventDefault();
      let method=(el.method||'GET').toUpperCase();
      let action=el.getAttribute('action');
      if(!action)action=u.pathname+u.search;
      u=new window.URL(action,u.origin);
      let body='';
      if(method!=='GET'){
        let fd=extractFormData(el);
        if(el.enctype==='application/json'){body=JSON.stringify(fd)}else{
          let sp=new URLSearchParams();for(let k in fd){sp.append(k,fd[k])};body=sp.toString()
        }
      }else{
        let fd=extractFormData(el);
        let sp=new URLSearchParams();for(let k in fd){sp.append(k,fd[k])};
        u=new window.URL(u.href.split('?')[0]+'?'+sp.toString());
      }
      Su();
      if(method==='GET'){Yy(!!1)}else{Z(u,'',!!1,0,method)}
    }
  }
},

// Log error since I don't have access to console
mlog=er=>{let dd=new Date();let cur=(localStorage.getItem('error')||'')+`\n${dd}-${JSON.stringify(er).slice(0,200)}`;localStorage.setItem('error',cur.slice(-10000))},

// Fade elem
fade=el=>{
 if(vdld||(isFading && el===currentFadeEl))return;
  currentFadeEl=el;
  pb.style.width='0%';
  isFading=!!1;
  var op=1;
  var fps=1000/60;
  function decrease(){
    op-=0.01;
    if(op<=0){
     if(el.id==='pg'){ So();K();U('');
      el.style.opacity=1;}else{el.style.display='none';el.style.opacity=1}
     isFading=!!0;
      return !!1;
    }
    el.style.opacity=op;
    if(window.requestAnimationFrame!=='undefined')window.requestAnimationFrame(decrease);
    else setTimeout(decrease,fps);
  }
  decrease();
};

// Events
iu.onkeyup=i=>{if(i.key==='Enter'){Yy(!!1);pb.style.width='0%'}};
iu.ondblclick=()=>fade(pg);
msgs.ondblclick=()=>{
 if(audPlayer){adjustPlayRate();
 }else{
  fade(pg);
 }
};
prevMedia.onclick=()=>{
 if(keyList.length===0)return;
 let pInd=currentMediaIndex-1;
  if(pInd<0)pInd=keyList.length-1;
 showMedia(keyList[pInd],-1);
};
nextMedia.onclick=()=>{
 if(keyList.length===0)return;
 let nInd=currentMediaIndex+1;
 if(nInd>=keyList.length)nInd=0;
 showMedia(keyList[nInd],1);
};
pg.ondblclick=()=>fade(pg);
bck.onclick=async i=>{if(h.length>1){cb.checked=!!0;for(let r of p.values()){if(r.pdf)r.h=!!0} if(!c)await Rw();h.pop();u=h[h.length-1];Su();Yy(!!1) }};
rf.onclick=i=>{fade(pg);let ckd=cb.checked;if(ckd)cb.checked=!!0;w.close();atmps=1;cngSvr();C();if(ckd)cb.checked=!!1};
bs.onclick=i=>{dl=!dl;if(dl){dld=!!1;bs.value='↓';k(g(),0)}else{dld=!!0;bs.value=''}};
sv.ondblclick=i=>{sv.readOnly=!sv.readOnly};
sv.onkeyup=i=>{if(i.key==='Enter'){sv.readOnly=!!1;C()}};
hide.onclick=async i=>{let el=ge('dimmsg');
 overlay.style.display='flex';dimmed=!!1;el.style.opacity=1;el.style.display='block';await DL(1500);fade(el);
};
d.body.ondblclick=i=>{
if(dimmed){if(i.target.id==='iu' || i.target.id==='sv')return; overlay.style.display='none';dimmed=!!0}
};

//allow zooming
Q('',d,'meta[name="viewport"]').setAttribute('content','user-scalable=yes');

//some init setup
svrInd=Math.floor(Math.random()*svrs.length);
const st=l('style');
st.textContent=cssStyles;
J(d.head,st);
ge('icon').onclick=()=>togglePlayerVisible();
ge('marqueeContent').onclick=()=>adjustPlayRate();

// Playlist and sidebar tabs helpers
function switchSidebarTab(tab){
  const btnShows=ge('tab-btn-shows');
  const btnMusic=ge('tab-btn-music');
  const contShows=ge('tab-shows');
  const contMusic=ge('tab-music');
  if(tab==='shows'){
    btnShows.classList.add('active');
    btnMusic.classList.remove('active');
    contShows.classList.add('active');
    contMusic.classList.remove('active');
  }else{
    btnMusic.classList.add('active');
    btnShows.classList.remove('active');
    contMusic.classList.add('active');
    contShows.classList.remove('active');
  }
}

function renderPlaylist(){
  const cont=ge('sidebar-playlist');
  if(!cont) return;
  if(audList.length===0){
    cont.innerHTML='<p style="padding:10px;color:#ccc">No tracks in playlist</p>';
    return;
  }
  let html='<ul class="col">';
  const curIdx=parseInt(audPlayer?.dataset.trackIndex||-1);
  let trackNum=1;
  audList.forEach((track,i)=>{
    const title=track.tags.title||'';
    const artist=track.tags.artist||'';
    const text=`${title}${artist? ' - '+artist : ''}`;
    const isPlaying = i===curIdx;
    html+=`<li class="playlist-item${isPlaying?' playing':''}" data-index="${i}" draggable="true">`+
          `<span class="drag-handle">${String.fromCharCode(0x22ee)}${String.fromCharCode(0x22ee)} <span class="track-num">${trackNum}.</span></span>`+
          `<div class="text-wrapper" style="margin-left:-5px"><div class="marquee-content">${text}</div></div>`+
          `<label class='custom-cb'><input type="checkbox" class="remove-after"/><span class='checkmark'></span></label>`+
          `<span class="remove-btn" style='margin-left:-20px;font-size:24px'>|   ✖</span>`+
          `</li>`;
   trackNum++;
  });
  html+='</ul>';
  cont.innerHTML=html;
  Array.from(cont.querySelectorAll('.playlist-item')).forEach(li=>{
    const idx=parseInt(li.dataset.index);
    li.querySelector('.text-wrapper').onclick=(e)=>{ e.stopPropagation();playTrack(idx); switchSidebarTab('music'); };
    li.querySelector('.remove-btn').onclick=e=>{ e.stopPropagation(); removeTrack(idx); };
    li.querySelector('.remove-after').onchange=e=>{ audList[idx].removeAfter = e.target.checked; };
 
    const dh=li.querySelector('.drag-handle');
    // drag-and-drop handlers for reordering
    dh.addEventListener('dragstart',e=>{
       e.dataTransfer.setData('text/plain', idx);
    });
    dh.addEventListener('dragover',e=>{
       e.preventDefault();
       li.classList.add('dragover');
    });
    dh.addEventListener('dragleave',e=>{
       li.classList.remove('dragover');
    });
    dh.addEventListener('drop',e=>{
       e.preventDefault();
       li.classList.remove('dragover');
       const from = parseInt(e.dataTransfer.getData('text/plain'));
       const to = parseInt(li.dataset.index);
       moveTrack(from,to);
    });

    // fallback for touch-based reordering: slide finger over another item to swap
    dh.addEventListener('touchstart',e=>{
       li._draggingIdx = idx;
    });
    dh.addEventListener('touchmove',e=>{
       e.preventDefault();
       const touch = e.touches[0];
       if(!touch) return;
       const target = document.elementFromPoint(touch.clientX, touch.clientY);
       const other = target && target.closest('.playlist-item');
       if(other && other !== li){
         const to = parseInt(other.dataset.index);
         moveTrack(li._draggingIdx, to);
         li._draggingIdx = to;
       }
    });
  });
}

function removeTrack(idx){
  if(idx<0||idx>=audList.length) return;
  const playingIdx=parseInt(audPlayer?.dataset.trackIndex||-1);
  audList.splice(idx,1);
  if(playingIdx===idx){
    if(audList.length>0){
      playTrack(playingIdx>=audList.length?0:playingIdx);
    } else {
      closePlayer(null);
    }
  } else if(playingIdx>idx){
    audPlayer.dataset.trackIndex = playingIdx-1;
  }
  renderPlaylist();
}

// move a track within the playlist and adjust current index if necessary
function moveTrack(from, to){
  if(from===to) return;
  const item = audList.splice(from,1)[0];
  audList.splice(to,0,item);
  if(audPlayer){
    let cur = parseInt(audPlayer.dataset.trackIndex);
    if(cur===from){
      audPlayer.dataset.trackIndex = to;
    } else if(cur > from && cur <= to){
      audPlayer.dataset.trackIndex = cur - 1;
    } else if(cur < from && cur >= to){
      audPlayer.dataset.trackIndex = cur + 1;
    }
  }
  renderPlaylist();
}

// wire up tab buttons after elements exist
ge('tab-btn-shows').onclick=()=>switchSidebarTab('shows');
ge('tab-btn-music').onclick=()=>switchSidebarTab('music');

// Sidebar toggle
ge('btnOpn').onclick = () => sidebar.classList.add('open');
ge('btnCls').onclick = () => sidebar.classList.remove('open');

// Initial setup
getShows();
// initialize playlist UI
renderPlaylist();
//ldpdfJS();
//try{loadPdfJS('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.14.149/pdf.min.mjs');}catch(er){U(er)}
loadJSLib('https://cdn.jsdelivr.net/npm/jsmediatags');
d.addEventListener('click',(ev)=>{
//close sidebar when clicking anywhere basically
const sbar=Q('',d,'.sidebar');
const btnO=ge('btnOpn');
if(ev.target===btnO||audDiv.contains(ev.target))return;
if(sliderActive&&!seekSliderContainer.contains(ev.target)&&!trackTimeDetail.contains(ev.target))hideSeekSlider();
if(!sbar.contains(ev.target)&&sbar.classList.contains('open')){
sbar.classList.remove('open');
}
});

//randomize server
cngSvr();
//sv.value='offal';

//function for loading one first load
let joke=()=>{
//cb.checked=!!1;
//et x='mindfulnessexercises.com/wp-content/uploads/2024/02/Seneca-Quotes.mp3';
 let x='burningforsuccess.com/wp-content/uploads/2024/07/Peter-Griffin.jpg';
//let quote=`Enjoy a minute or two audio of quotes from the Stoic <a href='https://en.wikipedia.org/wiki/Seneca_the_Younger'>Seneca the Younger</a>`;
  let quote=`You can download .pdf books/docs now from archive.org or whereever you find them. Just make sure to tap the download link that says .pdf on archive.<p>To turn pages: Double-tap right side of a document for Next page; the opposite for Previous page.<p>Zooming: Double-tap the upper-middle of the page to zoom in; the lower-middle to zoom out.<p>Example: <a href='https://bop.utah.gov/wp-content/uploads/Parole-Notifications-and-Conditions_Dec-2025.pdf'>Utah Parole Conditions</a>`;
 iu.value=x;Yy(!!1);
W(sd,`<h2>${quote}</h2>`);h.pop();L();
},
//need to iniect a parse fumction to URL for pdf.js to fumction
addURLParse=()=>{
if(typeof globalThis.URL==='undefined' || globalThis.URL.parse)return;
 globalThis.URL= class URL extends originalURL{ 
    constructor(url, base=undefined){
       let finalUrl=url;
       if(typeof url==='string' && url.startsWith('blob:')){
       finalUrl=url;
      }
   super(finalUrl, base);
  }
  static parse(url,base){
   try{return new URL(url,base);}catch{return null}
  }
 }
};
addURLParse();
//Start it all up
U('Patience is a virtue...').then(C());