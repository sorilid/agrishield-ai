/* ==========================================================================
   AgriShield AI - Floating Chatbot Widget (chatbot.js)
   Powered by Upstage Solar AI (solar-pro)
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    API_URL: 'https://api.upstage.ai/v1/chat/completions',
    MODEL: 'solar-pro',
    SYSTEM_PROMPT: '당신은 AgriShield AI 플랫폼의 전문 농업 AI 어시스턴트입니다.\n국가 공공 병해충 진단 포털(NCPMS) 데이터와 농업 전문 지식을 바탕으로 다음 분야에 대해 정확하고 실용적인 답변을 제공합니다:\n\n1. 🌾 농작물 병해충 진단 및 식별\n2. 💊 등록 농약 및 방제 처방 (희석배율, 안전사용기준 포함)\n3. 🌿 친환경/유기농 방제 방법\n4. 📚 식물보호기사 자격증 시험 관련 정보\n5. 🔬 병해충 발병 원인 분석 및 예방법\n\n답변 시 다음 형식을 지켜주세요:\n- 전문적이지만 농업인이 이해하기 쉬운 언어로 설명\n- 구체적인 수치(희석배율, 사용 횟수, 수확 전 사용 금지 일수 등)를 명시\n- 안전사용기준은 반드시 강조하여 언급\n- 친환경 대안이 있으면 함께 제시\n- 한국어로만 답변',
    MAX_HISTORY: 20
  };

  var apiKey = '';
  var isOpen = false;
  var isLoading = false;
  var messageHistory = [];

  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'cb-styles';
    style.textContent = '\
.cb-launcher{position:fixed;bottom:28px;right:28px;width:62px;height:62px;background:linear-gradient(135deg,#10b981,#059669);border:2px solid rgba(52,211,153,0.5);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:9999;box-shadow:0 6px 30px rgba(16,185,129,0.45);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);animation:cb-pulse 3s infinite;font-family:sans-serif;}\
.cb-launcher:hover{transform:scale(1.1) translateY(-3px);box-shadow:0 10px 40px rgba(16,185,129,0.6);}\
.cb-launcher.is-open{background:linear-gradient(135deg,#374151,#1f2937);border-color:rgba(156,163,175,0.3);animation:none;}\
@keyframes cb-pulse{0%,100%{box-shadow:0 6px 30px rgba(16,185,129,0.45),0 0 0 0 rgba(52,211,153,0.4);}50%{box-shadow:0 6px 30px rgba(16,185,129,0.45),0 0 0 14px rgba(52,211,153,0);}}\
.cb-launcher-icon{position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;}\
.cb-icon-bot,.cb-icon-close{position:absolute;transition:all 0.3s ease;}\
.cb-icon-close{opacity:0;transform:rotate(90deg) scale(0.5);}\
.cb-launcher.is-open .cb-icon-bot{opacity:0;transform:rotate(-90deg) scale(0.5);}\
.cb-launcher.is-open .cb-icon-close{opacity:1;transform:rotate(0deg) scale(1);}\
.cb-launcher-badge{position:absolute;top:-4px;right:-4px;background:#fbbf24;color:#0f172a;font-size:9px;font-weight:800;padding:2px 5px;border-radius:8px;border:2px solid #0b1311;transition:opacity 0.3s;}\
.cb-launcher.is-open .cb-launcher-badge{opacity:0;pointer-events:none;}\
.cb-window{position:fixed;bottom:106px;right:28px;width:400px;height:620px;background:#0f1e1a;border:1px solid rgba(64,160,130,0.3);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;z-index:9998;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(16,185,129,0.15);transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);transform-origin:bottom right;transform:scale(0.85) translateY(20px);opacity:0;pointer-events:none;font-family:"Noto Sans KR",sans-serif;}\
.cb-window.is-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}\
.cb-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:rgba(0,0,0,0.4);border-bottom:1px solid rgba(64,160,130,0.2);flex-shrink:0;box-sizing:border-box;}\
.cb-header-left{display:flex;align-items:center;gap:10px;}\
.cb-avatar{position:relative;width:36px;height:36px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex-shrink:0;}\
.cb-avatar-pulse{position:absolute;inset:-3px;border:2px solid #34d399;border-radius:50%;animation:cb-av-pulse 2.5s infinite;opacity:0.5;}\
@keyframes cb-av-pulse{0%,100%{transform:scale(1);opacity:0.5;}50%{transform:scale(1.15);opacity:0.2;}}\
.cb-title{display:block;font-size:13px;font-weight:700;color:#f1f5f9;}\
.cb-subtitle{display:block;font-size:11px;color:#34d399;margin-top:1px;}\
.cb-subtitle i{font-size:7px;animation:cb-blink 1.5s infinite alternate;}\
@keyframes cb-blink{from{opacity:0.4;}to{opacity:1;}}\
.cb-header-actions{display:flex;align-items:center;gap:4px;}\
.cb-header-btn{width:30px;height:30px;background:transparent;border:none;border-radius:8px;color:#64748b;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}\
.cb-header-btn:hover{background:rgba(255,255,255,0.08);color:#f1f5f9;}\
.cb-setup-screen{display:flex;align-items:center;justify-content:center;padding:24px;flex:1;background:linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(15,30,26,0.95) 100%);box-sizing:border-box;}\
.cb-setup-screen.hidden{display:none;}\
.cb-setup-content{width:100%;text-align:center;}\
.cb-setup-icon{width:60px;height:60px;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05));border:1px solid rgba(52,211,153,0.3);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#34d399;font-size:26px;}\
.cb-setup-content h3{font-size:16px;font-weight:700;color:#f1f5f9;margin-bottom:10px;}\
.cb-setup-content p{font-size:12.5px;color:#94a3b8;line-height:1.6;margin-bottom:20px;}\
.cb-setup-input-group{position:relative;display:flex;align-items:center;margin-bottom:12px;}\
.cb-setup-input-group input{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(64,160,130,0.3);border-radius:10px;padding:11px 44px 11px 14px;color:#f1f5f9;font-size:13px;outline:none;font-family:monospace;box-sizing:border-box;}\
.cb-setup-input-group input:focus{border-color:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,0.15);}\
.cb-toggle-btn{position:absolute;right:10px;background:transparent;border:none;color:#64748b;cursor:pointer;padding:4px;font-size:13px;}\
.cb-setup-btn{width:100%;padding:12px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px;box-shadow:0 4px 14px rgba(16,185,129,0.35);box-sizing:border-box;}\
.cb-setup-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#34d399;text-decoration:none;opacity:0.8;}\
.cb-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;background:rgba(0,0,0,0.15);box-sizing:border-box;}\
.cb-messages.hidden{display:none;}\
.cb-messages::-webkit-scrollbar{width:4px;}\
.cb-messages::-webkit-scrollbar-thumb{background:rgba(52,211,153,0.2);border-radius:2px;}\
.cb-msg{display:flex;flex-direction:column;animation:cb-pop 0.3s ease-out;}\
@keyframes cb-pop{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}\
.cb-msg.user{align-items:flex-end;}\
.cb-msg.bot{align-items:flex-start;}\
.cb-msg-content{max-width:88%;padding:11px 14px;border-radius:16px;font-size:13px;line-height:1.65;word-break:break-word;}\
.cb-msg.user .cb-msg-content{background:linear-gradient(135deg,#047857,#065f46);color:#fff;border-radius:16px 16px 4px 16px;}\
.cb-msg.bot .cb-msg-content{background:#1a2a26;border:1px solid rgba(64,160,130,0.25);color:#e2e8f0;border-radius:4px 16px 16px 16px;}\
.cb-msg-time{font-size:10px;color:#475569;margin-top:4px;padding:0 4px;}\
.cb-typing{display:flex;align-items:flex-start;gap:8px;animation:cb-pop 0.3s ease-out;}\
.cb-typing-avatar{width:26px;height:26px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;flex-shrink:0;}\
.cb-typing-bubble{background:#1a2a26;border:1px solid rgba(64,160,130,0.25);border-radius:4px 16px 16px 16px;padding:12px 16px;display:flex;align-items:center;gap:5px;}\
.cb-typing-dot{width:7px;height:7px;background:#34d399;border-radius:50%;animation:cb-bounce 1.2s infinite;}\
.cb-typing-dot:nth-child(2){animation-delay:0.2s;}\
.cb-typing-dot:nth-child(3){animation-delay:0.4s;}\
@keyframes cb-bounce{0%,60%,100%{transform:translateY(0);opacity:0.6;}30%{transform:translateY(-6px);opacity:1;}}\
.cb-welcome{text-align:center;padding:16px 8px;}\
.cb-welcome-icon{font-size:40px;margin-bottom:10px;display:block;}\
.cb-welcome h4{font-size:14px;font-weight:700;color:#34d399;margin-bottom:6px;}\
.cb-welcome p{font-size:12.5px;color:#64748b;line-height:1.6;}\
.cb-suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:10px 16px;border-top:1px solid rgba(64,160,130,0.12);flex-shrink:0;background:rgba(0,0,0,0.2);box-sizing:border-box;}\
.cb-suggestions.hidden{display:none;}\
.cb-suggestion-btn{background:rgba(16,185,129,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:20px;color:#94a3b8;font-size:11px;padding:5px 10px;cursor:pointer;white-space:nowrap;transition:all 0.2s;}\
.cb-suggestion-btn:hover{background:rgba(16,185,129,0.2);border-color:#34d399;color:#34d399;}\
.cb-input-area{padding:12px 14px 14px;border-top:1px solid rgba(64,160,130,0.2);background:rgba(0,0,0,0.35);flex-shrink:0;box-sizing:border-box;}\
.cb-input-area.hidden{display:none;}\
.cb-input-wrapper{display:flex;align-items:flex-end;gap:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(64,160,130,0.3);border-radius:14px;padding:8px 8px 8px 14px;margin-bottom:8px;box-sizing:border-box;}\
.cb-input-wrapper:focus-within{border-color:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,0.12);}\
.cb-input{flex:1;background:transparent;border:none;outline:none;color:#f1f5f9;font-size:13px;line-height:1.5;resize:none;max-height:100px;overflow-y:auto;font-family:"Noto Sans KR",sans-serif;}\
.cb-input::placeholder{color:#475569;}\
.cb-send-btn{width:36px;height:36px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:10px;color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;box-shadow:0 2px 8px rgba(16,185,129,0.3);}\
.cb-send-btn:hover:not(:disabled){transform:scale(1.08);}\
.cb-send-btn:disabled{background:linear-gradient(135deg,#1e3a2f,#162e24);color:#2d6b4f;cursor:not-allowed;box-shadow:none;}\
.cb-footer-info{display:flex;justify-content:space-between;font-size:10.5px;color:#334155;}\
.cb-footer-info strong{color:#10b981;}\
.cb-error-toast{background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:10px;padding:10px 14px;color:#fca5a5;font-size:12px;display:flex;align-items:center;gap:8px;animation:cb-pop 0.3s ease-out;align-self:stretch;}\
@media(max-width:480px){.cb-window{width:calc(100vw - 24px);right:12px;bottom:90px;height:calc(100dvh - 110px);max-height:620px;}.cb-launcher{right:16px;bottom:16px;}}';
    document.head.appendChild(style);
  }

  function createHTML() {
    return '<button id="cb-launcher" class="cb-launcher" aria-label="챗봇 열기">' +
      '<div class="cb-launcher-icon"><i class="fa-solid fa-robot cb-icon-bot"></i><i class="fa-solid fa-xmark cb-icon-close"></i></div>' +
      '<span class="cb-launcher-badge">AI</span>' +
    '</button>' +
    '<div id="cb-window" class="cb-window" role="dialog" aria-hidden="true">' +
      '<div class="cb-header">' +
        '<div class="cb-header-left">' +
          '<div class="cb-avatar"><i class="fa-solid fa-leaf"></i><span class="cb-avatar-pulse"></span></div>' +
          '<div><span class="cb-title">AgriShield AI 어시스턴트</span>' +
          '<span class="cb-subtitle" id="cbStatus"><i class="fa-solid fa-circle"></i> Upstage Solar AI 연동 중</span></div>' +
        '</div>' +
        '<div class="cb-header-actions">' +
          '<button class="cb-header-btn" id="cbClearBtn" title="대화 초기화"><i class="fa-solid fa-rotate-right"></i></button>' +
          '<button class="cb-header-btn" id="cbSettingsBtn" title="API Key 설정"><i class="fa-solid fa-gear"></i></button>' +
          '<button class="cb-header-btn" id="cbCloseBtn" title="닫기"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="cb-setup-screen" id="cbSetupScreen">' +
        '<div class="cb-setup-content">' +
          '<div class="cb-setup-icon"><i class="fa-solid fa-key"></i></div>' +
          '<h3>Upstage API Key 설정</h3>' +
          '<p>AgriShield AI 챗봇을 사용하려면 Upstage API Key가 필요합니다.<br>키는 브라우저 로컬 스토리지에만 저장됩니다.</p>' +
          '<div class="cb-setup-input-group">' +
            '<input type="password" id="cbApiKeyInput" placeholder="up_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" autocomplete="off">' +
            '<button id="cbApiKeyToggle" class="cb-toggle-btn"><i class="fa-solid fa-eye"></i></button>' +
          '</div>' +
          '<button id="cbApiKeySubmit" class="cb-setup-btn"><i class="fa-solid fa-unlock"></i> 연결 시작</button>' +
          '<a href="https://console.upstage.ai" target="_blank" rel="noopener" class="cb-setup-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Upstage Console에서 API Key 발급</a>' +
        '</div>' +
      '</div>' +
      '<div class="cb-messages hidden" id="cbMessages" role="log" aria-live="polite"></div>' +
      '<div class="cb-suggestions hidden" id="cbSuggestions">' +
        '<button class="cb-suggestion-btn" data-q="고추 탄저병 방제 방법과 추천 농약을 알려줘">🌶️ 고추 탄저병 방제법</button>' +
        '<button class="cb-suggestion-btn" data-q="벼 잎집무늬마름병 친환경 방제 방법은?">🌾 벼 친환경 방제</button>' +
        '<button class="cb-suggestion-btn" data-q="식물보호기사 자격증 시험 과목과 합격 기준은?">📚 식물보호기사 정보</button>' +
        '<button class="cb-suggestion-btn" data-q="농약 안전사용기준이 왜 중요한지 설명해줘">💊 농약 안전기준</button>' +
      '</div>' +
      '<div class="cb-input-area hidden" id="cbInputArea">' +
        '<div class="cb-input-wrapper">' +
          '<textarea id="cbInput" class="cb-input" placeholder="병해충 진단, 농약 처방, 자격증 시험 질문을 해보세요..." rows="1" maxlength="2000"></textarea>' +
          '<button id="cbSendBtn" class="cb-send-btn" disabled><i class="fa-solid fa-paper-plane"></i></button>' +
        '</div>' +
        '<div class="cb-footer-info"><span>Powered by <strong>Upstage Solar AI</strong></span><span id="cbCharCount">0 / 2000</span></div>' +
      '</div>' +
    '</div>';
  }

  function mount() {
    var w = document.createElement('div');
    w.id = 'cb-root';
    w.innerHTML = createHTML();
    document.body.appendChild(w);
  }

  function getTime() {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmtText(t) {
    return escHtml(t)
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`(.+?)`/g,'<code style="background:rgba(16,185,129,0.15);padding:1px 5px;border-radius:4px;font-size:12px;color:#34d399;">$1</code>')
      .replace(/^### (.+)$/gm,'<h4 style="color:#34d399;margin:8px 0 4px;font-size:13px;">$1</h4>')
      .replace(/^## (.+)$/gm,'<h3 style="color:#34d399;margin:8px 0 4px;font-size:14px;">$1</h3>')
      .replace(/^# (.+)$/gm,'<h2 style="color:#34d399;margin:8px 0 4px;font-size:15px;">$1</h2>')
      .replace(/^- (.+)$/gm,'<div style="display:flex;gap:6px;margin:3px 0;"><span style="color:#34d399;">•</span><span>$1</span></div>')
      .replace(/\n\n/g,'<br><br>')
      .replace(/\n/g,'<br>');
  }

  function scrollBot() {
    var m = document.getElementById('cbMessages');
    if (m) m.scrollTop = m.scrollHeight;
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  function showSetup() {
    document.getElementById('cbSetupScreen').classList.remove('hidden');
    document.getElementById('cbMessages').classList.add('hidden');
    document.getElementById('cbSuggestions').classList.add('hidden');
    document.getElementById('cbInputArea').classList.add('hidden');
    document.getElementById('cbStatus').innerHTML = '<i class="fa-solid fa-circle" style="color:#f87171;"></i> API Key 미설정';
  }

  function showChat() {
    document.getElementById('cbSetupScreen').classList.add('hidden');
    document.getElementById('cbMessages').classList.remove('hidden');
    document.getElementById('cbSuggestions').classList.remove('hidden');
    document.getElementById('cbInputArea').classList.remove('hidden');
    document.getElementById('cbStatus').innerHTML = '<i class="fa-solid fa-circle"></i> Upstage Solar AI 연동 중';
    showWelcome();
  }

  function showWelcome() {
    var m = document.getElementById('cbMessages');
    if (!m) return;
    m.innerHTML = '<div class="cb-welcome"><span class="cb-welcome-icon">🌾</span><h4>AgriShield AI 어시스턴트</h4><p>안녕하세요! 농업 병해충 진단, 농약 처방, 친환경 방제법,<br>식물보호기사 자격증 관련 질문에 답변드립니다.</p></div>';
    document.getElementById('cbSuggestions').classList.remove('hidden');
  }

  function appendMsg(role, text, isError) {
    var m = document.getElementById('cbMessages');
    var w = m.querySelector('.cb-welcome');
    if (w) w.remove();
    var d = document.createElement('div');
    d.className = 'cb-msg ' + role;
    if (isError) {
      d.innerHTML = '<div class="cb-error-toast"><i class="fa-solid fa-triangle-exclamation" style="color:#f87171;"></i><span>' + escHtml(text) + '</span></div>';
    } else {
      d.innerHTML = '<div class="cb-msg-content">' + fmtText(text) + '</div><span class="cb-msg-time">' + getTime() + '</span>';
    }
    m.appendChild(d);
    scrollBot();
  }

  function showTyping() {
    var m = document.getElementById('cbMessages');
    var d = document.createElement('div');
    d.className = 'cb-typing'; d.id = 'cb-typing';
    d.innerHTML = '<div class="cb-typing-avatar"><i class="fa-solid fa-leaf"></i></div><div class="cb-typing-bubble"><div class="cb-typing-dot"></div><div class="cb-typing-dot"></div><div class="cb-typing-dot"></div></div>';
    m.appendChild(d); scrollBot();
  }

  function rmTyping() { var t = document.getElementById('cb-typing'); if (t) t.remove(); }

  async function callAPI(msg) {
    if (!apiKey) throw new Error('API Key가 설정되지 않았습니다.');
    messageHistory.push({ role: 'user', content: msg });
    if (messageHistory.length > CONFIG.MAX_HISTORY * 2) messageHistory = messageHistory.slice(-CONFIG.MAX_HISTORY * 2);
    var body = { model: CONFIG.MODEL, messages: [{ role: 'system', content: CONFIG.SYSTEM_PROMPT }].concat(messageHistory), stream: false, temperature: 0.7, max_tokens: 1500 };
    var res = await fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }, body: JSON.stringify(body) });
    if (!res.ok) { var e = await res.json().catch(function(){return{};}); if (res.status===401||res.status===403) throw new Error('API Key가 유효하지 않습니다.'); throw new Error((e.error&&e.error.message)||'요청 실패 ('+res.status+')'); }
    var data = await res.json();
    var reply = (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||'응답 없음';
    messageHistory.push({ role: 'assistant', content: reply });
    return reply;
  }

  async function sendMsg(text) {
    if (!text || isLoading) return;
    if (!apiKey) { showSetup(); return; }
    var inp = document.getElementById('cbInput');
    var btn = document.getElementById('cbSendBtn');
    var sug = document.getElementById('cbSuggestions');
    isLoading = true;
    if (inp) { inp.value = ''; inp.style.height = 'auto'; }
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
    sug.classList.add('hidden');
    appendMsg('user', text);
    showTyping();
    try {
      var reply = await callAPI(text);
      rmTyping(); appendMsg('bot', reply);
    } catch(e) {
      rmTyping(); appendMsg('bot', e.message||'오류가 발생했습니다.', true);
      if (e.message&&e.message.includes('유효하지 않')) { apiKey=''; localStorage.removeItem('cb_agrishield_key'); setTimeout(showSetup,2000); }
    } finally {
      isLoading = false;
      if (btn) { btn.disabled=true; btn.innerHTML='<i class="fa-solid fa-paper-plane"></i>'; }
      var cc = document.getElementById('cbCharCount'); if (cc) cc.textContent='0 / 2000';
    }
  }

  async function handleKeySubmit() {
    var inpEl = document.getElementById('cbApiKeyInput');
    var subBtn = document.getElementById('cbApiKeySubmit');
    var key = inpEl ? inpEl.value.trim() : '';
    if (!key) { if(inpEl) inpEl.focus(); return; }
    if (!key.startsWith('up_')) { showSetupErr('유효한 Upstage API Key는 "up_"으로 시작해야 합니다.'); return; }
    subBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 확인 중...'; subBtn.disabled = true;
    try {
      var res = await fetch(CONFIG.API_URL, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+key}, body:JSON.stringify({model:CONFIG.MODEL,messages:[{role:'user',content:'hi'}],max_tokens:5}) });
      if (res.status===401||res.status===403) throw new Error('유효하지 않은 API Key입니다.');
      apiKey = key; localStorage.setItem('cb_agrishield_key', key); showChat();
    } catch(e) { showSetupErr(e.message||'API Key 검증에 실패했습니다.'); }
    finally { subBtn.innerHTML='<i class="fa-solid fa-unlock"></i> 연결 시작'; subBtn.disabled=false; }
  }

  function showSetupErr(msg) {
    var c = document.querySelector('.cb-setup-content');
    var old = document.getElementById('cb-setup-err'); if(old) old.remove();
    var d = document.createElement('div'); d.id = 'cb-setup-err';
    d.style.cssText = 'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.35);border-radius:8px;padding:9px 12px;color:#fca5a5;font-size:12px;margin-top:10px;display:flex;align-items:center;gap:7px;';
    d.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#f87171;"></i><span>'+escHtml(msg)+'</span>';
    if(c) c.appendChild(d);
    setTimeout(function(){if(d.parentNode)d.remove();},5000);
  }

  function bindEvents() {
    document.getElementById('cb-launcher').addEventListener('click', function() {
      isOpen = !isOpen;
      document.getElementById('cb-window').classList.toggle('is-open', isOpen);
      document.getElementById('cb-launcher').classList.toggle('is-open', isOpen);
      document.getElementById('cb-window').setAttribute('aria-hidden', String(!isOpen));
      if (isOpen && !apiKey) showSetup();
      else if (isOpen) setTimeout(function(){var i=document.getElementById('cbInput');if(i)i.focus();},350);
    });

    document.getElementById('cbCloseBtn').addEventListener('click', function() {
      isOpen=false;
      document.getElementById('cb-window').classList.remove('is-open');
      document.getElementById('cb-launcher').classList.remove('is-open');
      document.getElementById('cb-window').setAttribute('aria-hidden','true');
    });

    document.getElementById('cbApiKeyToggle').addEventListener('click', function() {
      var i=document.getElementById('cbApiKeyInput'), b=document.getElementById('cbApiKeyToggle');
      if(i.type==='password'){i.type='text';b.innerHTML='<i class="fa-solid fa-eye-slash"></i>';}
      else{i.type='password';b.innerHTML='<i class="fa-solid fa-eye"></i>';}
    });

    document.getElementById('cbApiKeySubmit').addEventListener('click', handleKeySubmit);
    document.getElementById('cbApiKeyInput').addEventListener('keypress',function(e){if(e.key==='Enter')handleKeySubmit();});

    document.getElementById('cbSettingsBtn').addEventListener('click',function(){
      showSetup();
      var ki=document.getElementById('cbApiKeyInput'); if(ki) ki.value=apiKey;
    });

    document.getElementById('cbClearBtn').addEventListener('click',function(){
      messageHistory=[]; showWelcome();
    });

    var inp=document.getElementById('cbInput'), btn=document.getElementById('cbSendBtn');
    inp.addEventListener('input',function(){
      autoResize(inp);
      btn.disabled=!inp.value.trim()||isLoading;
      var cc=document.getElementById('cbCharCount'); if(cc)cc.textContent=inp.value.length+' / 2000';
    });
    inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!btn.disabled)sendMsg(inp.value.trim());}});
    btn.addEventListener('click',function(){if(!btn.disabled)sendMsg(inp.value.trim());});

    document.querySelectorAll('.cb-suggestion-btn').forEach(function(b){
      b.addEventListener('click',function(){var q=b.getAttribute('data-q');if(q)sendMsg(q);});
    });
  }

  function init() {
    injectStyles();
    mount();
    bindEvents();
    var saved = localStorage.getItem('cb_agrishield_key');
    if (saved && saved.startsWith('up_')) apiKey = saved;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
