/**
 * SurakshaUPI - Class 9 UPI Fraud Awareness Chatbot
 * Pure Vanilla Script (Simple, transparent, matching upi_fraud_chatbot.py)
 * Zero JSX / Zero framework bloat - Pure HTML + CSS + Python Project
 */

// Knowledge Base (mirrors upi_fraud_chatbot.py)
const KEYWORD_MAP = {
  QR_CODE_RECEIVE: ['qr', 'qr code', 'scan', 'scan qr', 'receive payment', 'receive money', 'advance payment', 'olx', 'quikr', 'marketplace'],
  COLLECT_REQUEST: ['collect', 'collect request', 'request money', 'click pay', 'approve request', 'accept payment', 'pay request'],
  FAKE_CUSTOMER_CARE: ['customer care', 'bank executive', 'kyc', 'kyc update', 'account blocked', 'sim blocked', 'electricity bill', 'power cut', 'deactivated'],
  SCREEN_SHARING: ['anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share', 'remote access', 'install app'],
  DIGITAL_ARREST: ['digital arrest', 'cbi', 'police', 'customs', 'fedex', 'narcotics', 'drugs', 'skype call', 'whatsapp video call', 'arrest warrant', 'deposit'],
  FAKE_REWARDS: ['lottery', 'scratch card', 'cashback', 'won', 'winner', 'flipkart prize', 'telegram task', 'free gift', 'spin the wheel']
};

const DEMO_SCENARIOS = {
  'qr': {
    title: 'Fake QR Code Scam',
    prompt: 'Someone on OLX wants to buy my study table. He sent a QR code on WhatsApp and said: "Scan this QR code and approve on PhonePe to receive ₹4,500 advance payment".'
  },
  'collect': {
    title: 'Collect-Request Reverse Fraud',
    prompt: 'A caller claiming to be an event sponsor said he sent ₹2,000. Then Google Pay showed a notification saying "Pay ₹2,000". He says: "Click Pay and enter PIN to accept money".'
  },
  'kyc': {
    title: 'Fake Customer Care / KYC',
    prompt: 'Received an SMS from a 10-digit number: "Dear Customer, your electricity connection / SIM card will be deactivated in 2 hours due to pending KYC. Call 9831xxxxxx immediately".'
  },
  'screen': {
    title: 'Screen-Sharing (AnyDesk)',
    prompt: 'My movie ticket refund was pending. The customer care executive on Google asked me to install AnyDesk from Play Store so he can process my refund.'
  },
  'arrest': {
    title: 'Digital Arrest Scam',
    prompt: 'A man in police uniform on WhatsApp video call claiming to be CBI says an illegal courier with drugs and passport was found in my name. He put me under "Digital Arrest" and demands ₹50,000 on UPI.'
  },
  'reward': {
    title: 'Fake Rewards / Cashback',
    prompt: 'Got a link on WhatsApp: "Congratulations! You won ₹15,000 Festive Cashback on Google Pay. Click below to deposit into bank account". When I clicked, it opened UPI app asking for PIN.'
  }
};

let currentCategory = null;
let pendingQuestions = [];
let currentQuestionIndex = 0;
let highRiskCount = 0;
let currentUserQuery = '';

// DOM Elements
let chatMessagesEl;
let chatInputEl;
let typingIndicatorEl;

window.addEventListener('DOMContentLoaded', () => {
  chatMessagesEl = document.getElementById('chat-messages');
  chatInputEl = document.getElementById('chat-input');
  typingIndicatorEl = document.getElementById('typing-indicator');

  // Welcome message
  addBotMessage(
    "Namaste! I am Raksha, your Class 9 UPI Cyber Safety Assistant. 🛡️\n\n" +
    "Did someone send you a suspicious QR code, an unexpected 'Collect Request', a lottery link, or call pretending to be your bank or police?\n\n" +
    "Type what happened below or click one of the quick scenario buttons to test!"
  );
});

// Category detector
function detectCategory(text) {
  const t = text.toLowerCase();
  
  if (t.includes('digital arrest') || ((t.includes('cbi') || t.includes('police')) && (t.includes('deposit') || t.includes('narcotics') || t.includes('drugs')))) {
    return 'DIGITAL_ARREST';
  }
  if (['anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share'].some(app => t.includes(app))) {
    return 'SCREEN_SHARING';
  }
  if (KEYWORD_MAP.QR_CODE_RECEIVE.some(kw => t.includes(kw)) && (t.includes('qr') || t.includes('scan'))) {
    return 'QR_CODE_RECEIVE';
  }
  if (KEYWORD_MAP.COLLECT_REQUEST.some(kw => t.includes(kw))) {
    return 'COLLECT_REQUEST';
  }
  if (KEYWORD_MAP.FAKE_REWARDS.some(kw => t.includes(kw))) {
    return 'FAKE_REWARDS';
  }
  if (KEYWORD_MAP.FAKE_CUSTOMER_CARE.some(kw => t.includes(kw))) {
    return 'FAKE_CUSTOMER_CARE';
  }
  return 'GENERAL_SUSPICIOUS';
}

// Clarifying questions
function getQuestions(category) {
  const map = {
    QR_CODE_RECEIVE: [
      {
        text: "Question 1: Are you scanning this QR code to RECEIVE money into your account or pay someone?",
        options: [
          { label: "To RECEIVE money (Advance / Cashback / Sale)", isHighRisk: true },
          { label: "To PAY a genuine verified merchant", isHighRisk: false }
        ]
      },
      {
        text: "Question 2: Does your UPI app (GPay / PhonePe / Paytm) prompt you to enter your Secret UPI PIN?",
        options: [
          { label: "Yes, it asks for Secret UPI PIN", isHighRisk: true },
          { label: "No PIN requested", isHighRisk: false }
        ]
      }
    ],
    COLLECT_REQUEST: [
      {
        text: "Question 1: Does the notification say 'PAY' or 'COLLECT REQUEST' from an unknown person?",
        options: [
          { label: "Yes, it says 'Pay' and asks for PIN", isHighRisk: true },
          { label: "No, it says 'Money Received'", isHighRisk: false }
        ]
      },
      {
        text: "Question 2: Is the caller instructing you on call: 'Press Pay and enter PIN to receive money'?",
        options: [
          { label: "Yes, they claim pressing Pay will credit money", isHighRisk: true },
          { label: "No, this is my own bill payment", isHighRisk: false }
        ]
      }
    ],
    FAKE_CUSTOMER_CARE: [
      {
        text: "Question 1: Is the caller or SMS threatening that your bank, SIM, or electricity will be blocked within hours?",
        options: [
          { label: "Yes, creating panic and extreme urgency", isHighRisk: true },
          { label: "No urgency mentioned", isHighRisk: false }
        ]
      },
      {
        text: "Question 2: Did they ask for OTP, send an APK link, or ask for a ₹10 'verification payment'?",
        options: [
          { label: "Yes, asked for OTP / APK / test payment", isHighRisk: true },
          { label: "No secret credentials asked", isHighRisk: false }
        ]
      }
    ],
    SCREEN_SHARING: [
      {
        text: "Question 1: Did the person ask you to install AnyDesk, TeamViewer, RustDesk, or QuickSupport?",
        options: [
          { label: "Yes, instructed to install remote desktop app", isHighRisk: true },
          { label: "No remote app requested", isHighRisk: false }
        ]
      },
      {
        text: "Question 2: Did they ask you to open your UPI or mobile banking app while screen is shared?",
        options: [
          { label: "Yes, told me to open UPI app and check balance", isHighRisk: true },
          { label: "No banking app opened", isHighRisk: false }
        ]
      }
    ],
    DIGITAL_ARREST: [
      {
        text: "Question 1: Are they on video call in police uniform forbidding you from disconnecting or telling parents?",
        options: [
          { label: "Yes! Claiming Digital Arrest under CBI / Narcotics", isHighRisk: true },
          { label: "No, standard written notice", isHighRisk: false }
        ]
      },
      {
        text: "Question 2: Are they demanding a UPI transfer into a 'Court Escrow / RBI Verification' account?",
        options: [
          { label: "Yes! Demanding money transfer for clearance", isHighRisk: true },
          { label: "No money demanded", isHighRisk: false }
        ]
      }
    ],
    FAKE_REWARDS: [
      {
        text: "Question 1: Does the lottery or cashback page ask you to enter your Secret UPI PIN to claim?",
        options: [
          { label: "Yes, asks for UPI PIN to claim reward", isHighRisk: true },
          { label: "No PIN asked, normal store coupon", isHighRisk: false }
        ]
      },
      {
        text: "Question 2: Did you receive this link from WhatsApp forward, unknown SMS, or Telegram?",
        options: [
          { label: "Yes, forwarded link from unknown source", isHighRisk: true },
          { label: "No, inside official shopping app", isHighRisk: false }
        ]
      }
    ],
    GENERAL_SUSPICIOUS: [
      {
        text: "Did anyone ask for your Secret UPI PIN, OTP, or remote screen access?",
        options: [
          { label: "Yes, secret data or PIN requested", isHighRisk: true },
          { label: "No secret data asked", isHighRisk: false }
        ]
      }
    ]
  };

  return map[category] || map.GENERAL_SUSPICIOUS;
}

// Generate diagnosis report
function evaluateDiagnosis(category, count) {
  const baseScores = {
    DIGITAL_ARREST: 80,
    SCREEN_SHARING: 75,
    QR_CODE_RECEIVE: 60,
    COLLECT_REQUEST: 60,
    FAKE_REWARDS: 60,
    FAKE_CUSTOMER_CARE: 50,
    GENERAL_SUSPICIOUS: 40
  };

  const base = baseScores[category] || 40;
  const score = Math.min(100, base + (count * 20));
  const isDanger = score >= 65;

  const reports = {
    QR_CODE_RECEIVE: {
      name: "Fake QR Code Reverse Scam",
      title: "🚨 DANGER: 100% CONFIRMED UPI SCAM",
      summary: "Scanning a QR code or typing your UPI PIN will DEDUCT money from your account, NOT credit it! The scammer is abusing the QR payment protocol.",
      redFlags: [
        "Scammer claims scanning a QR code is required to RECEIVE advance payment.",
        "UPI PIN screen appears. Entering your PIN authorizes money deduction only.",
        "Commonly seen when selling items on OLX, Quikr, or Facebook Marketplace."
      ],
      safeActions: [
        "DO NOT scan the QR code or enter your Secret UPI PIN under any circumstances.",
        "Disconnect the call and block the scammer's number immediately.",
        "Remember: You only need to share your mobile number or UPI ID (VPA) to receive money."
      ],
      goldenRule: "QR Codes are ONLY used for SENDING money. You NEVER need to scan a QR code to receive money!"
    },
    COLLECT_REQUEST: {
      name: "Collect-Request Reverse Payment Fraud",
      title: "🚨 HIGH RISK: DECEPTIVE PAYMENT REQUEST",
      summary: "The scammer sent an incoming 'Collect Request' to your UPI app. Clicking 'Pay' and typing your PIN transfers YOUR money to the scammer!",
      redFlags: [
        "Notification says 'Pay ₹...' instead of 'Money Received'.",
        "Caller insists on phone: 'Press Pay and enter PIN to accept money into your account'.",
        "Fake transaction descriptions like 'Cashback_Release' or 'Refund_Approved'."
      ],
      safeActions: [
        "Click 'DECLINE' or 'REJECT' on the UPI collect request immediately.",
        "Block and report the scammer's UPI ID inside your UPI app.",
        "If money was deducted, immediately dial National Cyber Helpline 1930."
      ],
      goldenRule: "Entering your UPI PIN ALWAYS means money is LEAVING your bank account!"
    },
    FAKE_CUSTOMER_CARE: {
      name: "Fake Customer Care & Urgency KYC Scam",
      title: "⚠️ FRAUD ALERT: FAKE EXECUTIVE IMPERSONATION",
      summary: "Banks, electricity boards, and telecom operators NEVER send SMS from 10-digit mobile numbers demanding instant UPI payments to prevent blockage.",
      redFlags: [
        "SMS comes from an ordinary mobile number (+91-9xxxxxxxxx) instead of an official bank header.",
        "Extreme urgency created: 'Account will be permanently blocked in 2 hours'.",
        "Asking you to make a ₹10 test payment or click an unverified .apk file."
      ],
      safeActions: [
        "Do NOT call back on numbers sent in unsolicited SMS.",
        "Only use customer care numbers printed on the back of your debit card.",
        "Report the incident on National Cyber Crime Portal (1930)."
      ],
      goldenRule: "No bank or electricity company blocks services in 2 hours via WhatsApp or SMS!"
    },
    SCREEN_SHARING: {
      name: "Screen-Sharing Remote Access Scam",
      title: "🛑 CRITICAL DANGER: DEVICE TAKEOVER ATTEMPT",
      summary: "Installing AnyDesk, TeamViewer, RustDesk, or QuickSupport gives the scammer full remote visibility of your smartphone screen, passwords, and incoming OTPs!",
      redFlags: [
        "Caller asked you to download AnyDesk / TeamViewer / QuickSupport.",
        "They asked for the 9-digit remote connection code.",
        "They instructed you to open your UPI or mobile banking app while connected."
      ],
      safeActions: [
        "IMMEDIATELY UNINSTALL the remote desktop app (AnyDesk, TeamViewer) right now!",
        "Turn off Wi-Fi and Mobile Data immediately to cut the connection.",
        "Change your UPI PIN and NetBanking passwords from another secure device."
      ],
      goldenRule: "NEVER install remote access or screen-sharing apps on instructions from unknown callers!"
    },
    DIGITAL_ARREST: {
      name: "Digital Arrest / Fake Police Video Extortion",
      title: "⛔ CRITICAL EXTORTION: FAKE DIGITAL ARREST",
      summary: "There is NO SUCH LEGAL CONCEPT as 'Digital Arrest' under Indian Law! Indian Police, CBI, ED, and Supreme Court NEVER conduct video trials or demand money on UPI.",
      redFlags: [
        "Video call on WhatsApp / Skype showing fake police uniform and station backdrop.",
        "Claims your Aadhaar was found in illegal narcotics / money laundering parcels.",
        "Threatens immediate arrest if you disconnect or inform parents ('Confidential Case').",
        "Orders you to transfer funds to a 'Court Escrow / RBI Verification' UPI ID."
      ],
      safeActions: [
        "DISCONNECT THE CALL IMMEDIATELY. You are completely safe; it is an organized syndicate.",
        "Talk to your parents, school teachers, or trusted elders right away. Do not stay silent.",
        "Call Cyber Crime Helpline 1930 immediately or visit your nearest local police station."
      ],
      goldenRule: "Indian Law has NO 'Digital Arrest'. Real Police NEVER demand UPI money transfers!"
    },
    FAKE_REWARDS: {
      name: "Fake Lottery, Cashback & Scratch Card Scam",
      title: "🎁 BOGUS PRIZE ALERT: CASHBACK / LOTTERY TRAP",
      summary: "This is a clickbait trap. Scammers use attractive banners promising ₹10,000+ cashback to trick you into entering your UPI PIN on a phishing page.",
      redFlags: [
        "Promising huge cash prizes for a contest you never entered.",
        "Requires entering your Secret UPI PIN to 'deposit reward'.",
        "Unusual web links outside the official Google Pay / PhonePe app."
      ],
      safeActions: [
        "Close the browser tab immediately.",
        "Never enter your UPI PIN on any web link or scratch card page.",
        "Legitimate cashbacks credit AUTOMATICALLY without requiring your PIN."
      ],
      goldenRule: "Genuine cashbacks credit AUTOMATICALLY. They NEVER require entering a UPI PIN!"
    },
    GENERAL_SUSPICIOUS: {
      name: "Suspicious UPI Payment / Request",
      title: isDanger ? "🚨 HIGH RISK UPI SITUATION" : "⚠️ SUSPICIOUS ACTIVITY",
      summary: "Any unsolicited request where a stranger asks for your PIN, OTP, or remote screen share is almost always fraudulent.",
      redFlags: [
        "Unsolicited request involving money or secret credentials.",
        "Pressure or urgency applied by an unknown caller."
      ],
      safeActions: [
        "Never enter your UPI PIN to receive money.",
        "Consult parents or teachers before taking action.",
        "Call 1930 if money was debited."
      ],
      goldenRule: "When in doubt, STOP. Think before you PIN!"
    }
  };

  const report = reports[category] || reports.GENERAL_SUSPICIOUS;
  return {
    ...report,
    category,
    riskScore: score,
    riskLevel: score >= 85 ? "CRITICAL" : (score >= 65 ? "HIGH" : "MEDIUM")
  };
}

// User starts analysis
function startAnalysis(text) {
  if (!text || !text.trim()) return;
  const userText = text.trim();

  addUserMessage(userText);
  currentUserQuery = userText;
  if (chatInputEl) chatInputEl.value = '';

  showTyping(true);

  // Pattern matching
  const category = detectCategory(userText);
  currentCategory = category;
  pendingQuestions = getQuestions(category);
  currentQuestionIndex = 0;
  highRiskCount = 0;

  setTimeout(() => {
    showTyping(false);
    if (pendingQuestions.length > 0) {
      askQuestion(pendingQuestions[0]);
    } else {
      showVerdict(evaluateDiagnosis(category, 0));
    }
  }, 500);
}

// Ask question with clickable buttons
function askQuestion(q) {
  const container = document.createElement('div');
  container.className = 'bot-message question-card';

  const qText = document.createElement('div');
  qText.className = 'question-heading';
  qText.innerText = q.text;
  container.appendChild(qText);

  const optionsBox = document.createElement('div');
  optionsBox.className = 'question-options';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerText = opt.label;
    btn.onclick = () => {
      // Disable buttons
      const allBtns = optionsBox.querySelectorAll('button');
      allBtns.forEach(b => b.disabled = true);
      btn.classList.add('selected-option');

      addUserMessage(opt.label);
      if (opt.isHighRisk) highRiskCount++;
      currentQuestionIndex++;

      showTyping(true);
      setTimeout(() => {
        showTyping(false);
        if (currentQuestionIndex < pendingQuestions.length) {
          askQuestion(pendingQuestions[currentQuestionIndex]);
        } else {
          showVerdict(evaluateDiagnosis(currentCategory, highRiskCount));
        }
      }, 500);
    };
    optionsBox.appendChild(btn);
  });

  container.appendChild(optionsBox);
  appendMessageElement(container);
}

// Show final diagnosis card
function showVerdict(res) {
  const card = document.createElement('div');
  card.className = `diagnosis-card ${res.riskScore >= 65 ? 'danger-card' : 'warning-card'}`;

  const header = document.createElement('div');
  header.className = 'diagnosis-header';
  header.innerHTML = `
    <div>
      <div class="diag-title">${res.title}</div>
      <div class="diag-cat">Scam Category: ${res.name}</div>
    </div>
    <div class="diag-badge">${res.riskScore}% THREAT</div>
  `;
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'diagnosis-body';

  // Threat meter bar
  const meterWrap = document.createElement('div');
  meterWrap.className = 'meter-wrap';
  meterWrap.innerHTML = `
    <div class="meter-label">Threat Severity: <strong>${res.riskLevel} (${res.riskScore}/100)</strong></div>
    <div class="meter-bar-bg">
      <div class="meter-bar-fill" style="width: ${res.riskScore}%;"></div>
    </div>
  `;
  body.appendChild(meterWrap);

  // Summary
  const summaryBox = document.createElement('div');
  summaryBox.className = 'diag-summary';
  summaryBox.innerHTML = `<strong>Investigation Summary:</strong><p>${res.summary}</p>`;
  body.appendChild(summaryBox);

  // Red Flags
  const flagsBox = document.createElement('div');
  flagsBox.className = 'diag-flags';
  flagsBox.innerHTML = `<strong>🚩 Red Flags Identified:</strong><ul>${res.redFlags.map(f => `<li>${f}</li>`).join('')}</ul>`;
  body.appendChild(flagsBox);

  // Safe Actions
  const actionsBox = document.createElement('div');
  actionsBox.className = 'diag-actions';
  actionsBox.innerHTML = `<strong>🛡️ Recommended Safe Actions:</strong><ol>${res.safeActions.map(a => `<li>${a}</li>`).join('')}</ol>`;
  body.appendChild(actionsBox);

  // Golden Rule
  const ruleBox = document.createElement('div');
  ruleBox.className = 'diag-golden-rule';
  ruleBox.innerHTML = `<span class="rule-tag">💡 CLASS 9 GOLDEN RULE:</span><div class="rule-text">"${res.goldenRule}"</div>`;
  body.appendChild(ruleBox);

  // Action Buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'diag-btn-row';
  btnRow.innerHTML = `
    <button class="btn-report-diag" onclick="openReportModal()">🚨 Report to 1930 Helpline</button>
    <button class="btn-read-diag" onclick="readAloud('${res.title}. ${res.goldenRule}')">🔊 Listen Alert</button>
    <button class="btn-reset-diag" onclick="resetChat()">🔄 Test Another Situation</button>
  `;
  body.appendChild(btnRow);

  card.appendChild(body);
  appendMessageElement(card);
}

// Append chat messages
function addBotMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'bot-message';
  msg.innerHTML = `<div class="msg-author">🤖 Raksha (Cyber Safety Assistant)</div><div class="msg-content">${text.replace(/\n/g, '<br>')}</div>`;
  appendMessageElement(msg);
}

function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'user-message';
  msg.innerHTML = `<div class="msg-author">👤 You</div><div class="msg-content">${text}</div>`;
  appendMessageElement(msg);
}

function appendMessageElement(el) {
  if (chatMessagesEl) {
    chatMessagesEl.appendChild(el);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    setTimeout(() => {
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }, 50);
    setTimeout(() => {
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }, 250);
  }
}

function showTyping(show) {
  if (typingIndicatorEl) {
    typingIndicatorEl.style.display = show ? 'block' : 'none';
    if (chatMessagesEl) chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }
}

// User selects demo scenario
function selectScenario(scenarioKey) {
  const sc = DEMO_SCENARIOS[scenarioKey];
  if (sc) {
    startAnalysis(sc.prompt);
  }
}

// Reset Chat
function resetChat() {
  if (chatMessagesEl) {
    chatMessagesEl.innerHTML = '';
    addBotMessage(
      "Chat reset! Ready to check another UPI situation. Describe what happened or click a scenario button above."
    );
  }
  currentCategory = null;
  pendingQuestions = [];
  currentQuestionIndex = 0;
  highRiskCount = 0;
}

// Read Aloud using Web Speech API
function readAloud(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}

// Modal Handlers
function openSafetyRulesModal() {
  const el = document.getElementById('safety-rules-modal');
  if (el) el.style.display = 'flex';
}

function closeSafetyRulesModal() {
  const el = document.getElementById('safety-rules-modal');
  if (el) el.style.display = 'none';
}

function openReportModal() {
  const el = document.getElementById('report-fraud-modal');
  if (el) el.style.display = 'flex';
}

function closeReportModal() {
  const el = document.getElementById('report-fraud-modal');
  if (el) el.style.display = 'none';
}

function openPythonModal() {
  const el = document.getElementById('python-modal');
  if (el) el.style.display = 'flex';
}

function closePythonModal() {
  const el = document.getElementById('python-modal');
  if (el) el.style.display = 'none';
}

// Make functions globally available for HTML onclick attributes
window.startAnalysis = startAnalysis;
window.selectScenario = selectScenario;
window.resetChat = resetChat;
window.readAloud = readAloud;
window.openSafetyRulesModal = openSafetyRulesModal;
window.closeSafetyRulesModal = closeSafetyRulesModal;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;
window.openPythonModal = openPythonModal;
window.closePythonModal = closePythonModal;
