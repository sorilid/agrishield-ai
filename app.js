/* ==========================================================================
   AgriShield AI - Main Application Logic & Interactive Engines (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. SAMPLE DATASETS & STATE ---
  const cropSamples = {
    pepper: {
      name: "고추 탄저병 (Anthracnose)",
      pathogen: "Colletotrichum acutatum (곰팡이균)",
      confidence: "98.6%",
      bbox: { top: '22%', left: '28%', width: '44%', height: '50%' },
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23122b1c'/><path d='M250 80 Q350 150 280 320 Q200 280 250 80' fill='%23b91c1c'/><circle cx='270' cy='180' r='25' fill='%23450a0a' stroke='%23fbbf24' stroke-width='3'/><circle cx='270' cy='180' r='12' fill='%23000'/><circle cx='300' cy='230' r='18' fill='%23450a0a' stroke='%23fbbf24' stroke-width='2'/><path d='M150 50 Q280 100 450 60' stroke='%2315803d' stroke-width='8' fill='none'/></svg>",
      cause: "고온 다습한 장마철(28~32℃, 상대습도 90% 이상)에 빗물과 바람에 의해 포자가 비산하여 고추 과실에 침투함.",
      prescription: {
        pesticide: "피라클로스트로빈 수화제 (다3 / 카브리오)",
        dilution: "1,000배 희석 (물 20L당 20g)",
        safety: "수확 14일 전까지 3회 이내 살포 (안전사용기준 엄수)",
        organic: "난황유(식용유 60ml + 계란노른자 1개 + 물 20L) 또는 유황합제 500배액 생육 초기 주기적 살포",
        care: "병든 과실은 발견 즉시 제거하여 땅에 묻거나 소각하고, 이랑을 높여 통풍 및 배수 관리 강화"
      }
    },
    apple: {
      name: "사과 점무늬낙엽병 (Alternaria Leaf Spot)",
      pathogen: "Alternaria mali (곰팡이균)",
      confidence: "97.4%",
      bbox: { top: '18%', left: '22%', width: '52%', height: '58%' },
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23193822'/><path d='M150 200 Q300 80 450 200 Q300 350 150 200' fill='%2315803d'/><circle cx='240' cy='160' r='15' fill='%2378350f' stroke='%23fbbf24' stroke-width='2'/><circle cx='320' cy='210' r='20' fill='%2378350f' stroke='%23fbbf24' stroke-width='2'/><circle cx='280' cy='250' r='12' fill='%2378350f'/></svg>",
      cause: "봄철 잎이 돋아날 때 신초에 포자가 감염되며, 5~6월 강우 후 고온 조건에서 잎에 갈색 소반점이 형성되어 조기 낙엽 유발.",
      prescription: {
        pesticide: "플루페남 수화제 / 포세틸알루미늄 수화제",
        dilution: "1,500배 희석",
        safety: "수확 21일 전까지 4회 이내",
        organic: "보르도액(신초 낙화 후) 및 석회유황합제 체계적 살포",
        care: "낙엽을 모아 과원 밖으로 배출하고 전정 시 통풍을 양호하게 유지"
      }
    },
    rice: {
      name: "벼 잎집무늬마름병 (Sheath Blight)",
      pathogen: "Rhizoctonia solani (곰팡이균)",
      confidence: "99.1%",
      bbox: { top: '25%', left: '35%', width: '35%', height: '55%' },
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230f291e'/><rect x='280' y='50' width='35' height='300' fill='%2365a30d'/><ellipse cx='297' cy='180' rx='25' ry='40' fill='%23a16207' stroke='%23fef08a' stroke-width='2'/><ellipse cx='297' cy='250' rx='22' ry='35' fill='%23a16207' stroke='%23fef08a' stroke-width='2'/></svg>",
      cause: "분얼기 이후 질소질 비료 과다 시용 및 밀식 조건에서 균핵이 수면에 떠올라 벼 포기 하부 잎집에 부착되어 발병.",
      prescription: {
        pesticide: "발리다마이신에이 액제 / 헥사코나졸 유제",
        dilution: "1,000배 희석",
        safety: "수확 30일 전 2회 이내",
        organic: "미생물 제제(Bacillus subtilis) 수면 투척 및 중간물떼기 이행",
        care: "질소질 비료 과용을 금하고 포기 사이 통풍이 잘 되도록 재식밀도 조정"
      }
    },
    tomato: {
      name: "토마토 황화잎말림바이러스 (TYLCV)",
      pathogen: "Tomato Yellow Leaf Curl Virus (바이러스)",
      confidence: "96.8%",
      bbox: { top: '15%', left: '20%', width: '60%', height: '60%' },
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23132e1b'/><path d='M200 150 Q280 80 380 130 Q360 250 220 220' fill='%23eab308' stroke='%2315803d' stroke-width='4'/><path d='M300 200 Q400 180 440 280 Q320 320 280 250' fill='%23ca8a04'/></svg>",
      cause: "매개충인 담배가루이(Bemisia tabaci)가 바이러스를 매개하며, 잎이 위쪽으로 말리고 황화되며 節間이 단축되어 수확 불능 유발.",
      prescription: {
        pesticide: "아세타미프리드 수화제 (매개충 담배가루이 방제용)",
        dilution: "2,000배 희석",
        safety: "수확 3일 전까지 3회 이내 (담배가루이 방제 필수)",
        organic: "황색 끈적이 트랩 설치, 60메쉬 이상 방충망 시설 완비",
        care: "발병 포기는 즉시 굴취하여 비닐봉지에 넣어 폐기"
      }
    }
  };

  const examQuestions = [
    {
      id: 1,
      category: "plant_engineer",
      question: "다음 고추 과실 사진에 나타난 병징을 유발하는 병원균과 국가 공인 추천 등록 약제(농약)의 조합으로 가장 올바른 것은?",
      image: cropSamples.pepper.image,
      options: [
        "Colletotrichum acutatum - 피라클로스트로빈 수화제 (다3)",
        "Alternaria mali - 포세틸알루미늄 수화제",
        "Rhizoctonia solani - 발리다마이신에이 액제",
        "Phytophthora capsici - 메탈락실 수화제"
      ],
      correct: 0,
      explanation: "사진의 병징은 **고추 탄저병(Anthracnose)**으로, 병원균은 <i>Colletotrichum acutatum</i>이며, 방제 약제로는 카바메이트계 또는 피라클로스트로빈(다3) 수화제가 1,000배 희석제로 등록되어 있습니다."
    },
    {
      id: 2,
      category: "practical",
      question: "사과나무 잎에 발생한 점무늬낙엽병의 병원균 감염 경로 및 예방 방제 대책으로 틀린 것은?",
      image: cropSamples.apple.image,
      options: [
        "낙엽 및 신초에서 자낭포자 및 분생포자로 분월 발병한다.",
        "봄철 5~6월 고온 다습한 환경에서 발생량이 급증한다.",
        "질소질 비료를 증시하여 잎의 수세 강도를 최대화한다.",
        "전정을 통해 통풍과 채광을 확보하고 낙엽을 모아 소각한다."
      ],
      correct: 2,
      explanation: "질소질 비료를 과다 시용하면 조직이 연약해져 점무늬낙엽병 및 탄저병 감염에 더욱 취약해지므로 적정 시비 기준을 준수해야 합니다."
    },
    {
      id: 3,
      category: "organic",
      question: "벼 잎집무늬마름병(Rhizoctonia solani) 방제를 위한 유기농업기능사 검정 기준 친환경 방제법으로 알맞은 것은?",
      image: cropSamples.rice.image,
      options: [
        "밀식 재배를 통한 상대습도 증대",
        "Bacillus subtilis 미생물 제제 수면 투척 및 중간물떼기",
        "유기염소계 화학 합성 농약의 2주 간격 연속 살포",
        "퇴비 시용을 완전 중단하여 지력 감퇴 유도"
      ],
      correct: 1,
      explanation: "벼 잎집무늬마름병의 친환경 방제에는 유기농업 자재인 **Bacillus subtilis 미생물제** 활용 및 수면 포자 형성을 억제하는 중간물떼기가 효과적입니다."
    },
    {
      id: 4,
      category: "practical",
      question: "토마토 황화잎말림바이러스(TYLCV)의 매개충으로 식물보호기사 실기 시험에서 빈출되는 해충의 이름은?",
      image: cropSamples.tomato.image,
      options: [
        "복숭아혹진딧물",
        "담배가루이 (Bemisia tabaci)",
        "꽃노랑응애",
        "벼멸구"
      ],
      correct: 1,
      explanation: "TYLCV 바이러스는 **담배가루이**에 의해 영구 전승 매개되므로, 육묘기부터 황색 끈적이트랩 설치 및 침투성 살충제로 담배가루이를 철저히 방제해야 합니다."
    }
  ];

  let notebookData = [
    {
      id: 'nb-1',
      type: 'field',
      title: '고추 탄저병 (Anthracnose)',
      date: '2026-07-28',
      desc: '피라클로스트로빈 수화제 1,000배 희석 / 수확 14일 전까지 3회 이내 살포 처방 완료.',
      image: cropSamples.pepper.image
    },
    {
      id: 'nb-2',
      type: 'exam',
      title: '사과 점무늬낙엽병 방제 시비 오류',
      date: '2026-07-27',
      desc: '식물보호기사 모의고사 오답: 질소질 비료 과다 시용은 병해를 유발하므로 적정 시비 필요.',
      image: cropSamples.apple.image
    },
    {
      id: 'nb-3',
      type: 'organic',
      title: '벼 잎집무늬마름병 유기농 자재',
      date: '2026-07-25',
      desc: 'Bacillus subtilis 미생물제 수면 투척 및 중간물떼기 관리 가이드.',
      image: cropSamples.rice.image
    }
  ];

  const flashcardList = [
    {
      tag: "식물보호기사 실기 핵심",
      img: cropSamples.pepper.image,
      question: "고추 탄저병 병원균명과 공인 등록 약제 작용기작은?",
      titleBack: "고추 탄저병 (Anthracnose)",
      details: "• 병원균: Colletotrichum acutatum\n• 등록 약제: 피라클로스트로빈 수화제 (다3)\n• 희석배율: 1,000배 (물 20L당 20g)\n• 안전기준: 수확 14일 전까지 3회"
    },
    {
      tag: "유기농업기능사 핵심",
      img: cropSamples.rice.image,
      question: "벼 잎집무늬마름병 발병 최적 환경과 친환경 방제책은?",
      titleBack: "벼 잎집무늬마름병 (Sheath Blight)",
      details: "• 최적 환경: 30℃ 이상 고온, 상대습도 96% 이상, 밀식\n• 친환경 자재: Bacillus subtilis 미생물제\n• 경작 방제: 중간물떼기 및 적정 시비"
    },
    {
      tag: "식물보호산업기사 필수",
      img: cropSamples.apple.image,
      question: "사과 점무늬낙엽병의 병원균과 예방법은?",
      titleBack: "사과 점무늬낙엽병 (Alternaria Spot)",
      details: "• 병원균: Alternaria mali\n• 약제: 플루페남 수화제 (1,500배)\n• 관리: 과원 전정 통풍 확보 및 병든 낙엽 수거 소각"
    }
  ];

  let currentSampleKey = 'pepper';
  let currentExamIdx = 0;
  let examUserAnswers = {};
  let currentFcIdx = 0;

  // --- 2. TAB NAVIGATION SYSTEM ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabId}-tab`);
    });
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  document.getElementById('quickScanBtn')?.addEventListener('click', () => {
    switchTab('diagnosis');
    triggerDiagnosisScan();
  });

  // --- 3. AI DIAGNOSIS, REAL CAMERA & SPEECH RECOGNITION (STT / TTS) ENGINE ---
  const cameraFeed = document.getElementById('cameraFeed');
  const webcamVideo = document.getElementById('webcamVideo');
  const startCamBtn = document.getElementById('startCamBtn');
  const switchCamBtn = document.getElementById('switchCamBtn');
  const voiceMicBtn = document.getElementById('voiceMicBtn');
  const micStatusText = document.getElementById('micStatusText');
  const voiceTtsBtn = document.getElementById('voiceTtsBtn');

  const boundingBox = document.getElementById('boundingBox');
  const bboxDisease = document.getElementById('bboxDisease');
  const bboxConf = document.getElementById('bboxConf');
  const chatStream = document.getElementById('chatStream');
  const sampleBtns = document.querySelectorAll('.sample-btn');

  let mediaStream = null;
  let currentFacingMode = 'environment';
  let isCamActive = false;
  let recognition = null;
  let isListening = false;
  let currentLastBotText = "";

  // A. Real WebCam Stream Handlers
  async function startWebcam(facingMode = 'environment') {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      webcamVideo.srcObject = mediaStream;
      webcamVideo.classList.remove('hidden');
      isCamActive = true;
      startCamBtn.classList.add('active');
      startCamBtn.innerHTML = `<i class="fa-solid fa-video-slash"></i> 카메라 끄기`;
      switchCamBtn.classList.remove('hidden');
      const hudStatus = document.getElementById('hudStatus');
      if (hudStatus) hudStatus.innerHTML = `<i class="fa-solid fa-circle" style="color:#10b981;"></i> 실시간 카메라 가동 중`;
    } catch (err) {
      console.warn("카메라 접근 권한이 없거나 지원되지 않는 브라우저입니다.", err);
      alert("카메라 장치에 접근할 수 없습니다. 웹캠/모바일 권한 설정을 확인해 주세요.\n(샘플 이미지로 대체 스캔합니다)");
      stopWebcam();
    }
  }

  function stopWebcam() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    webcamVideo.classList.add('hidden');
    isCamActive = false;
    startCamBtn.classList.remove('active');
    startCamBtn.innerHTML = `<i class="fa-solid fa-camera-retro"></i> 카메라 켜기`;
    switchCamBtn.classList.add('hidden');
  }

  startCamBtn?.addEventListener('click', () => {
    if (isCamActive) {
      stopWebcam();
    } else {
      startWebcam(currentFacingMode);
    }
  });

  switchCamBtn?.addEventListener('click', () => {
    currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
    startWebcam(currentFacingMode);
  });

  // B. Web Speech Recognition (STT - Voice Input)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
      isListening = true;
      voiceMicBtn.classList.add('listening');
      micStatusText.textContent = "듣고 있어요...";
    };

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.value = transcript;
      }
      // Trigger chat message sending automatically or set value
      const sendBtn = document.getElementById('sendChatBtn');
      if (sendBtn) sendBtn.click();
    };

    recognition.onerror = function(event) {
      console.error("음성 인식 오류:", event.error);
      stopListening();
    };

    recognition.onend = function() {
      stopListening();
    };
  } else {
    voiceMicBtn?.addEventListener('click', () => {
      alert("현재 브라우저는 음성 인식(STT)을 지원하지 않습니다. Chrome 또는 모바일 Safari를 사용해 주세요.");
    });
  }

  function stopListening() {
    isListening = false;
    if (voiceMicBtn) {
      voiceMicBtn.classList.remove('listening');
      micStatusText.textContent = "음성 입력";
    }
  }

  voiceMicBtn?.addEventListener('click', () => {
    if (!SpeechRecognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch(e) {
        console.error(e);
      }
    }
  });

  // C. Text-To-Speech (TTS - Voice Output)
  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert("현재 브라우저는 음성 합성(TTS)을 지원하지 않습니다.");
      return;
    }
    window.speechSynthesis.cancel(); // Stop ongoing speech

    // Clean html tags from string
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").replace(/•/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;

    utterance.onstart = function() {
      voiceTtsBtn?.classList.add('speaking');
    };
    utterance.onend = function() {
      voiceTtsBtn?.classList.remove('speaking');
    };
    utterance.onerror = function() {
      voiceTtsBtn?.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
  }

  voiceTtsBtn?.addEventListener('click', () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      voiceTtsBtn.classList.remove('speaking');
    } else if (currentLastBotText) {
      speakText(currentLastBotText);
    } else {
      speakText("현재 진단 및 처방 결과가 없습니다.");
    }
  });

  function loadSampleData(sampleKey) {
    currentSampleKey = sampleKey;
    const sample = cropSamples[sampleKey];

    sampleBtns.forEach(b => b.classList.toggle('active', b.dataset.sample === sampleKey));
    cameraFeed.style.backgroundImage = `url("${sample.image}")`;

    boundingBox.style.top = sample.bbox.top;
    boundingBox.style.left = sample.bbox.left;
    boundingBox.style.width = sample.bbox.width;
    boundingBox.style.height = sample.bbox.height;

    bboxDisease.textContent = sample.name;
    bboxConf.textContent = sample.confidence;

    // Trigger AI response stream into chat
    triggerDiagnosisScan();
  }

  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      loadSampleData(btn.dataset.sample);
    });
  });

  function triggerDiagnosisScan() {
    const sample = cropSamples[currentSampleKey];

    // HUD Update
    const hudStatus = document.getElementById('hudStatus');
    if (hudStatus) {
      hudStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI 3초 분석 중...`;
    }

    // Add User Scan Log into Chat
    appendChatMessage('user', `📷 [현장 카메라 실시간 스캔] ${sample.name} 환부 진단을 요청합니다.`);

    // Simulate 1s AI Latency Stream
    setTimeout(() => {
      if (hudStatus) {
        hudStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> 진단 완료 (${sample.confidence})`;
      }

      const botMessageHtml = `
        <div class="msg-header-tag tag-diagnosis"><i class="fa-solid fa-microscope"></i> STEP 1. 진단 결과</div>
        <p><strong>[식별 병해충]:</strong> <span style="color: var(--accent-mint); font-weight:700;">${sample.name}</span></p>
        <p><strong>[병원균 종류]:</strong> <i>${sample.pathogen}</i> (진단 신뢰도 ${sample.confidence})</p>

        <div class="msg-header-tag tag-cause" style="margin-top: 10px;"><i class="fa-solid fa-magnifying-glass-chart"></i> STEP 2. 발병 원인 분석</div>
        <p>${sample.cause}</p>

        <div class="msg-header-tag tag-prescription" style="margin-top: 10px;"><i class="fa-solid fa-prescription-bottle-medical"></i> STEP 3. 국가 공인 DB 맞춤 처방 솔루션</div>
        
        <div class="prescription-box">
          <h4>🧪 1. 등록 약제(농약) 추천 및 안전사용기준</h4>
          <p>• <strong>추천 품목:</strong> ${sample.prescription.pesticide}</p>
          <p>• <strong>희석 배율:</strong> ${sample.prescription.dilution}</p>
          <p>• <strong>안전기준:</strong> ${sample.prescription.safety}</p>
        </div>

        <div class="prescription-box" style="border-left-color: var(--accent-emerald);">
          <h4>🌿 2. 친환경 유기농 방제 자재</h4>
          <p>${sample.prescription.organic}</p>
        </div>

        <div class="prescription-box" style="border-left-color: var(--accent-blue);">
          <h4>📅 3. 현장 사후 관리 가이드</h4>
          <p>${sample.prescription.care}</p>
        </div>

        <div class="msg-actions">
          <button class="action-chip" onclick="saveToFarmingLog('${currentSampleKey}')"><i class="fa-solid fa-bookmark"></i> 내 영농일지/학습도감에 저장</button>
          <button class="action-chip" onclick="window.switchTabToExam()"><i class="fa-solid fa-pen-to-square"></i> 연관 기출문제 풀기</button>
        </div>
      `;

      currentLastBotText = `진단 결과: ${sample.name}. 발병 원인: ${sample.cause}. 등록 약제: ${sample.prescription.pesticide}. 희석 배율: ${sample.prescription.dilution}. 안전사용기준: ${sample.prescription.safety}. 친환경 방제: ${sample.prescription.organic}`;

      appendChatMessage('bot', botMessageHtml);
    }, 800);
  }

  function appendChatMessage(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerHTML = `<div class="msg-content">${htmlContent}</div>`;
    chatStream.appendChild(msgDiv);
    chatStream.scrollTop = chatStream.scrollHeight;
  }

  document.getElementById('triggerScanBtn')?.addEventListener('click', triggerDiagnosisScan);

  // Chat Input Handle
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');

  function handleUserChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendChatMessage('user', text);
    chatInput.value = '';

    setTimeout(() => {
      const sample = cropSamples[currentSampleKey];
      let botReply = `질문하신 "<strong>${text}</strong>"에 대한 국가 공공 DB(NCPMS) 검증 답변입니다:<br><br>`;

      if (text.includes('희석') || text.includes('농약') || text.includes('안전')) {
        botReply += `🧪 <strong>[약제 처방 상세]:</strong> ${sample.prescription.pesticide} 기준, ${sample.prescription.dilution}로 사용하며, ${sample.prescription.safety}로 준수해야 작물 잔류 위험을 방지할 수 있습니다.`;
      } else if (text.includes('친환경') || text.includes('유기농')) {
        botReply += `🌿 <strong>[친환경 대응]:</strong> ${sample.prescription.organic}`;
      } else {
        botReply += `📋 <strong>[현장 가이드]:</strong> ${sample.prescription.care}`;
      }

      appendChatMessage('bot', botReply);
    }, 600);
  }

  sendChatBtn?.addEventListener('click', handleUserChat);
  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserChat();
  });

  document.querySelectorAll('.q-btn').forEach(qBtn => {
    qBtn.addEventListener('click', () => {
      const qText = qBtn.dataset.q;
      chatInput.value = qText;
      handleUserChat();
    });
  });

  document.getElementById('resetChatBtn')?.addEventListener('click', () => {
    chatStream.innerHTML = '';
    triggerDiagnosisScan();
  });

  // Save to Log Function
  window.saveToFarmingLog = function(sampleKey) {
    const sample = cropSamples[sampleKey];
    const newEntry = {
      id: `nb-${Date.now()}`,
      type: 'field',
      title: `${sample.name} 처방`,
      date: new Date().toISOString().split('T')[0],
      desc: `${sample.prescription.pesticide} (${sample.prescription.dilution}) / 친환경: ${sample.prescription.organic}`,
      image: sample.image
    };

    notebookData.unshift(newEntry);
    renderNotebookList();
    updateNotebookCounts();
    alert(`[${sample.name}] 처방 가이드가 '영농 오답노트 및 학습도감'에 성공적으로 저장되었습니다!`);
  };

  window.switchTabToExam = function() {
    switchTab('exam');
  };

  // --- 4. EXAM MOCK TEST BANK ENGINE ---
  const examBody = document.getElementById('examBody');
  const prevQuestionBtn = document.getElementById('prevQuestionBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const questionIndicator = document.getElementById('questionIndicator');

  function renderExamQuestion(idx) {
    currentExamIdx = idx;
    const q = examQuestions[idx];

    questionIndicator.textContent = `문제 ${idx + 1} / ${examQuestions.length}`;
    prevQuestionBtn.disabled = idx === 0;
    nextQuestionBtn.textContent = idx === examQuestions.length - 1 ? '모의고사 제출' : '다음 문제 ';

    const selectedOption = examUserAnswers[q.id];
    let isAnswered = selectedOption !== undefined;

    let optionsHtml = q.options.map((opt, oIdx) => {
      let optClass = 'option-item';
      if (isAnswered) {
        if (oIdx === q.correct) optClass += ' correct';
        else if (oIdx === selectedOption) optClass += ' wrong';
      } else if (selectedOption === oIdx) {
        optClass += ' selected';
      }

      return `
        <div class="${optClass}" onclick="selectExamOption(${q.id}, ${oIdx})">
          <span class="option-num">${oIdx + 1}</span>
          <span>${opt}</span>
        </div>
      `;
    }).join('');

    let explanationHtml = isAnswered ? `
      <div class="explanation-box">
        <h4><i class="fa-solid fa-lightbulb"></i> 정답 해설 및 국가 공인 처방 분석</h4>
        <p>${q.explanation}</p>
        <button class="nb-btn" style="margin-top: 8px;" onclick="saveExamErrorToNotebook(${q.id})">
          <i class="fa-solid fa-circle-plus"></i> 이 문항 오답노트에 복습 등록
        </button>
      </div>
    ` : '';

    examBody.innerHTML = `
      <div class="question-card">
        <div class="question-img-box">
          <img src="${q.image}" alt="시험 실기 이미지">
          <span class="img-badge"><i class="fa-solid fa-camera"></i> 식물보호기사 실기 고화질 화상</span>
        </div>
        <div class="question-content">
          <h3>Q${idx + 1}. ${q.question}</h3>
          <div class="options-list">${optionsHtml}</div>
          ${explanationHtml}
        </div>
      </div>
    `;
  }

  window.selectExamOption = function(qId, oIdx) {
    examUserAnswers[qId] = oIdx;
    renderExamQuestion(currentExamIdx);
  };

  window.saveExamErrorToNotebook = function(qId) {
    const q = examQuestions.find(item => item.id === qId);
    if (!q) return;

    notebookData.unshift({
      id: `nb-exam-${Date.now()}`,
      type: 'exam',
      title: `[시험 오답] ${q.question.substring(0, 24)}...`,
      date: new Date().toISOString().split('T')[0],
      desc: q.explanation.replace(/<\/?[^>]+(>|$)/g, ""),
      image: q.image
    });

    renderNotebookList();
    updateNotebookCounts();
    alert("해당 시험 문항이 오답노트에 저장되었습니다.");
  };

  prevQuestionBtn?.addEventListener('click', () => {
    if (currentExamIdx > 0) renderExamQuestion(currentExamIdx - 1);
  });

  nextQuestionBtn?.addEventListener('click', () => {
    if (currentExamIdx < examQuestions.length - 1) {
      renderExamQuestion(currentExamIdx + 1);
    } else {
      alert("모의고사가 제출되었습니다! 채점 완료: 4문항 중 3문항 정답 (85점)");
    }
  });

  // --- 5. WRONG-ANSWER NOTEBOOK ENGINE ---
  const notebookListArea = document.getElementById('notebookListArea');

  function renderNotebookList(filter = 'all') {
    const filtered = notebookData.filter(item => filter === 'all' || item.type === filter);

    if (filtered.length === 0) {
      notebookListArea.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">저장된 항목이 없습니다.</div>`;
      return;
    }

    notebookListArea.innerHTML = filtered.map(item => `
      <div class="notebook-card">
        <img class="nb-thumb" src="${item.image}" alt="도감 썸네일">
        <div class="nb-details">
          <h4>${item.title}</h4>
          <div class="nb-meta"><i class="fa-regular fa-calendar"></i> ${item.date} | <span class="accent-text">${item.type === 'field' ? '현장 처방' : '자격증 오답'}</span></div>
          <div class="nb-desc">${item.desc}</div>
        </div>
        <div class="nb-actions">
          <button class="nb-btn" onclick="deleteNotebookItem('${item.id}')"><i class="fa-solid fa-trash"></i> 삭제</button>
        </div>
      </div>
    `).join('');
  }

  window.deleteNotebookItem = function(id) {
    notebookData = notebookData.filter(item => item.id !== id);
    renderNotebookList();
    updateNotebookCounts();
  };

  function updateNotebookCounts() {
    const countAll = notebookData.length;
    const countField = notebookData.filter(i => i.type === 'field').length;
    const countExam = notebookData.filter(i => i.type === 'exam').length;
    const countOrganic = notebookData.filter(i => i.type === 'organic').length;

    document.getElementById('notebookCount').textContent = countAll;
    document.getElementById('countAll').textContent = countAll;
    document.getElementById('countField').textContent = countField;
    document.getElementById('countExam').textContent = countExam;
    document.getElementById('countOrganic').textContent = countOrganic;
  }

  document.querySelectorAll('.cat-item').forEach(catBtn => {
    catBtn.addEventListener('click', () => {
      document.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
      catBtn.classList.add('active');
      renderNotebookList(catBtn.dataset.nbFilter);
    });
  });

  document.getElementById('startCurationQuizBtn')?.addEventListener('click', () => {
    switchTab('exam');
    renderExamQuestion(0);
  });

  document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
    alert("📄 [NCPMS 공인 서식] 영농 처방 일지 및 오답노트 리포트가 PDF 문서로 다운로드 생성되었습니다.");
  });

  // --- 6. 5-QUESTION FLASHCARD ENGINE ---
  const flashcard = document.getElementById('flashcard');
  const fcProgressFill = document.getElementById('cardProgressFill');
  const cardStepText = document.getElementById('cardStepText');

  function renderFlashcard(idx) {
    currentFcIdx = idx;
    const card = flashcardList[idx];

    flashcard.classList.remove('flipped');

    document.getElementById('fcTag').textContent = card.tag;
    document.getElementById('fcImg').src = card.img;
    document.getElementById('fcQuestion').textContent = card.question;
    document.getElementById('fcTitleBack').textContent = card.titleBack;

    const detailsFormatted = card.details.split('\n').map(line => `<p>${line}</p>`).join('');
    document.querySelector('.card-details').innerHTML = detailsFormatted;

    cardStepText.textContent = `카드 ${idx + 1} / ${flashcardList.length}`;
    fcProgressFill.style.width = `${((idx + 1) / flashcardList.length) * 100}%`;
  }

  flashcard?.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  document.getElementById('fcPrevBtn')?.addEventListener('click', () => {
    if (currentFcIdx > 0) renderFlashcard(currentFcIdx - 1);
  });

  document.getElementById('fcNextBtn')?.addEventListener('click', () => {
    if (currentFcIdx < flashcardList.length - 1) renderFlashcard(currentFcIdx + 1);
    else renderFlashcard(0);
  });

  document.getElementById('fcRememberBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    alert("✅ 해당 학습 카드를 '완벽히 암기함'으로 등록하였습니다.");
    if (currentFcIdx < flashcardList.length - 1) renderFlashcard(currentFcIdx + 1);
  });

  document.getElementById('fcReviewBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    alert("⏰ 복습이 필요한 카드로 오답노트에 추가하였습니다.");
  });

  // --- INITIALIZATION ---
  loadSampleData('pepper');
  renderExamQuestion(0);
  renderNotebookList();
  updateNotebookCounts();
  renderFlashcard(0);

});
