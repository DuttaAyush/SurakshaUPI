/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SurakshaUPI: Rule-based Scam Detection & Clarification Engine
 * Specially designed for Class 9 School Science & Cyber Safety Project
 */

export type ScamCategory =
  | 'QR_CODE_RECEIVE'
  | 'COLLECT_REQUEST'
  | 'FAKE_CUSTOMER_CARE'
  | 'SCREEN_SHARING'
  | 'DIGITAL_ARREST'
  | 'FAKE_REWARDS'
  | 'WRONG_TRANSFER'
  | 'GENERAL_SUSPICIOUS'
  | 'SAFE_PRACTICE';

export interface FollowUpQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    isHighRisk: boolean;
  }[];
}

export interface ScamAnalysisResult {
  category: ScamCategory;
  scamName: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  riskScore: number; // 0 to 100
  verdictTitle: string;
  verdictSummary: string;
  redFlags: string[];
  safeActions: string[];
  goldenRule: string;
  detectedKeywords: string[];
  isScam: boolean;
}

export interface DemoScenario {
  id: string;
  title: string;
  icon: string;
  shortTag: string;
  userPrompt: string;
  category: ScamCategory;
  defaultAnswers?: Record<string, string>;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'qr-code',
    title: 'Fake QR Code Scam',
    icon: 'QrCode',
    shortTag: 'QR Code to Receive',
    userPrompt: 'Someone on OLX wants to buy my study table. He sent me a QR code on WhatsApp and said "Scan this QR code and approve on PhonePe to receive ₹4,500 advance payment".',
    category: 'QR_CODE_RECEIVE',
    defaultAnswers: {
      ask_pin: 'yes_pin',
      intent: 'receive_money'
    }
  },
  {
    id: 'collect-request',
    title: 'Collect-Request Fraud',
    icon: 'ArrowDownLeft',
    shortTag: 'Reverse Payment',
    userPrompt: 'A stranger called claiming he has sent me ₹2,000 for school festival sponsorship. Then I received a notification on Google Pay saying "Pay ₹2,000 to user". He says "Click Pay and enter PIN to accept money".',
    category: 'COLLECT_REQUEST',
    defaultAnswers: {
      ask_pin: 'yes_pin',
      request_type: 'collect_request'
    }
  },
  {
    id: 'fake-customer-care',
    title: 'Fake Customer Care / KYC',
    icon: 'PhoneCall',
    shortTag: 'Urgent KYC Block',
    userPrompt: 'I got an SMS saying: "Dear Customer, your Bank account / SIM card will be deactivated within 12 hours due to pending KYC. Call 9831xxxxxx immediately to update KYC".',
    category: 'FAKE_CUSTOMER_CARE',
    defaultAnswers: {
      urgency: 'high_urgency',
      install_app: 'asked_otp'
    }
  },
  {
    id: 'screen-sharing',
    title: 'Screen-Sharing Scam',
    icon: 'MonitorSmartphone',
    shortTag: 'AnyDesk / TeamViewer',
    userPrompt: 'I tried to book movie tickets and money got deducted twice. I found a helpline on Google. The executive asked me to install AnyDesk / QuickSupport from Play Store so he can process my refund.',
    category: 'SCREEN_SHARING',
    defaultAnswers: {
      remote_app: 'installed_or_asked',
      otp_pin: 'asked_pin_on_screen'
    }
  },
  {
    id: 'digital-arrest',
    title: 'Digital Arrest Scam',
    icon: 'ShieldAlert',
    shortTag: 'Fake CBI / Police Video',
    userPrompt: 'Someone called in police uniform on WhatsApp video call claiming to be from Mumbai Cyber Police and CBI. He said a FedEx courier in my name has illegal drugs and passport, and I am under "Digital Arrest". He demands ₹50,000 security deposit on UPI for clearance.',
    category: 'DIGITAL_ARREST',
    defaultAnswers: {
      video_arrest: 'yes_uniform_threat',
      deposit_demand: 'yes_upi_deposit'
    }
  },
  {
    id: 'fake-rewards',
    title: 'Fake Rewards / Cashback',
    icon: 'Gift',
    shortTag: 'Lottery & Scratch Card',
    userPrompt: 'I opened a link from WhatsApp saying "Congratulations! You won ₹15,000 Navratri Festive Cashback on Google Pay. Click below to claim into bank account". When I clicked, it opened UPI app asking for my UPI PIN.',
    category: 'FAKE_REWARDS',
    defaultAnswers: {
      ask_pin: 'yes_pin',
      source: 'random_link'
    }
  }
];

/**
 * Keyword dictionaries with student-relatable terms
 */
const KEYWORD_MAP: Record<ScamCategory, string[]> = {
  QR_CODE_RECEIVE: [
    'qr', 'qr code', 'scan', 'scan qr', 'receive payment', 'receive money',
    'advance payment', 'olx', 'quikr', 'facebook marketplace', 'receive cashback'
  ],
  COLLECT_REQUEST: [
    'collect', 'collect request', 'request money', 'click pay', 'approve request',
    'accept payment', 'pay request', 'mandate', 'autopay', 'pending payment'
  ],
  FAKE_CUSTOMER_CARE: [
    'customer care', 'bank executive', 'kyc', 'kyc update', 'pan card update',
    'account blocked', 'sim blocked', 'electricity bill', 'power cut', 'deactivated',
    'helpline', 'toll free', 'update aadhaar'
  ],
  SCREEN_SHARING: [
    'anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share',
    'remote access', 'screen share app', 'refund executive', 'install app'
  ],
  DIGITAL_ARREST: [
    'digital arrest', 'cbi', 'police', 'customs', 'fedex', 'dhl', 'narcotics',
    'drugs', 'skype call', 'whatsapp video call', 'arrest warrant', 'money laundering',
    'court order', 'police uniform', 'supreme court', 'security deposit'
  ],
  FAKE_REWARDS: [
    'lottery', 'scratch card', 'cashback', 'won', 'winner', 'flipkart prize',
    'telegram task', 'part time job', 'daily 5000', 'crypto profit', 'free gift', 'spin the wheel'
  ],
  WRONG_TRANSFER: [
    'sent by mistake', 'wrong transfer', 'send back', 'accidental transfer', 'refund me',
    'transferred wrongly', 'my child sent'
  ],
  SAFE_PRACTICE: [
    'paying shopkeeper', 'grocery bill', 'sent money to friend', 'recharged phone',
    'paying school fees', 'merchant qr code', 'verified store'
  ],
  GENERAL_SUSPICIOUS: [
    'pin', 'upi pin', 'otp', 'password', 'urgent', 'immediately', 'link', 'apk'
  ]
};

/**
 * Detect the scam category based on text input
 */
export function detectScamCategory(userInput: string): {
  category: ScamCategory;
  matchedKeywords: string[];
} {
  const normalized = userInput.toLowerCase();
  const matchedKeywords: string[] = [];

  // 1. Digital Arrest has very distinct dangerous flags
  for (const kw of KEYWORD_MAP.DIGITAL_ARREST) {
    if (normalized.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }
  if (matchedKeywords.length >= 2 || normalized.includes('digital arrest') || (normalized.includes('cbi') || normalized.includes('police')) && normalized.includes('deposit')) {
    return { category: 'DIGITAL_ARREST', matchedKeywords };
  }

  // 2. Screen sharing
  for (const kw of KEYWORD_MAP.SCREEN_SHARING) {
    if (normalized.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }
  if (normalized.includes('anydesk') || normalized.includes('teamviewer') || normalized.includes('rustdesk') || normalized.includes('quicksupport') || normalized.includes('screen share')) {
    return { category: 'SCREEN_SHARING', matchedKeywords };
  }

  // 3. QR code scam to receive money
  const qrMatches: string[] = [];
  for (const kw of KEYWORD_MAP.QR_CODE_RECEIVE) {
    if (normalized.includes(kw)) {
      qrMatches.push(kw);
    }
  }
  if (qrMatches.length > 0 && (normalized.includes('qr') || normalized.includes('scan'))) {
    return { category: 'QR_CODE_RECEIVE', matchedKeywords: qrMatches };
  }

  // 4. Collect request / Reverse payment
  const collectMatches: string[] = [];
  for (const kw of KEYWORD_MAP.COLLECT_REQUEST) {
    if (normalized.includes(kw)) {
      collectMatches.push(kw);
    }
  }
  if (collectMatches.length > 0 && (normalized.includes('collect') || normalized.includes('request') || normalized.includes('approve'))) {
    return { category: 'COLLECT_REQUEST', matchedKeywords: collectMatches };
  }

  // 5. Fake rewards / lottery
  const rewardMatches: string[] = [];
  for (const kw of KEYWORD_MAP.FAKE_REWARDS) {
    if (normalized.includes(kw)) {
      rewardMatches.push(kw);
    }
  }
  if (rewardMatches.length > 0) {
    return { category: 'FAKE_REWARDS', matchedKeywords: rewardMatches };
  }

  // 6. Fake customer care / KYC / Electricity bill
  const kycMatches: string[] = [];
  for (const kw of KEYWORD_MAP.FAKE_CUSTOMER_CARE) {
    if (normalized.includes(kw)) {
      kycMatches.push(kw);
    }
  }
  if (kycMatches.length > 0) {
    return { category: 'FAKE_CUSTOMER_CARE', matchedKeywords: kycMatches };
  }

  // 7. Wrong transfer scam
  for (const kw of KEYWORD_MAP.WRONG_TRANSFER) {
    if (normalized.includes(kw)) {
      return { category: 'WRONG_TRANSFER', matchedKeywords: [kw] };
    }
  }

  // 8. Safe practice test
  for (const kw of KEYWORD_MAP.SAFE_PRACTICE) {
    if (normalized.includes(kw) && !normalized.includes('unknown') && !normalized.includes('stranger') && !normalized.includes('link')) {
      return { category: 'SAFE_PRACTICE', matchedKeywords: [kw] };
    }
  }

  // General check
  const generalMatches: string[] = [];
  for (const kw of KEYWORD_MAP.GENERAL_SUSPICIOUS) {
    if (normalized.includes(kw)) {
      generalMatches.push(kw);
    }
  }

  return {
    category: generalMatches.length > 0 ? 'GENERAL_SUSPICIOUS' : 'GENERAL_SUSPICIOUS',
    matchedKeywords: generalMatches
  };
}

/**
 * Returns 1-2 targeted follow-up questions tailored to the category
 */
export function getFollowUpQuestions(category: ScamCategory): FollowUpQuestion[] {
  switch (category) {
    case 'QR_CODE_RECEIVE':
      return [
        {
          id: 'ask_pin',
          question: 'Question 1: Are you scanning this QR code to RECEIVE money into your account or pay for an item?',
          options: [
            { label: 'To RECEIVE money (Advance / Cashback / Sale)', value: 'receive_money', isHighRisk: true },
            { label: 'To PAY a genuine shopkeeper or merchant', value: 'pay_merchant', isHighRisk: false }
          ]
        },
        {
          id: 'pin_prompt',
          question: 'Question 2: Does the UPI app prompt you to enter your 4 or 6-digit Secret UPI PIN?',
          options: [
            { label: 'Yes, it asks for my Secret UPI PIN', value: 'yes_pin', isHighRisk: true },
            { label: 'No PIN is asked at all', value: 'no_pin', isHighRisk: false }
          ]
        }
      ];

    case 'COLLECT_REQUEST':
      return [
        {
          id: 'request_direction',
          question: 'Question 1: Does the notification say "PAY" or "COLLECT REQUEST" from an unknown UPI handle?',
          options: [
            { label: 'Yes, it has a "Pay" button and asks for PIN', value: 'yes_collect', isHighRisk: true },
            { label: 'No, it says "Received from"', value: 'received_msg', isHighRisk: false }
          ]
        },
        {
          id: 'caller_instruction',
          question: 'Question 2: Is the other person telling you on call to press "Pay" to claim your money?',
          options: [
            { label: 'Yes! They say "Press Pay to receive"', value: 'teller_says_pay', isHighRisk: true },
            { label: 'No, this is a bill I knowingly created', value: 'my_bill', isHighRisk: false }
          ]
        }
      ];

    case 'FAKE_CUSTOMER_CARE':
      return [
        {
          id: 'urgency_threat',
          question: 'Question 1: Is the caller or SMS threatening that your account, SIM, or electricity will be blocked within hours?',
          options: [
            { label: 'Yes, creating extreme urgency / fear', value: 'high_urgency', isHighRisk: true },
            { label: 'No, just routine inquiry', value: 'no_urgency', isHighRisk: false }
          ]
        },
        {
          id: 'ask_otp_app',
          question: 'Question 2: Did they ask you to share an OTP, click a link, or send ₹10 to "verify" your bank?',
          options: [
            { label: 'Yes, asked for OTP / link / test payment', value: 'asked_secret', isHighRisk: true },
            { label: 'No, only general guidance', value: 'no_secret', isHighRisk: false }
          ]
        }
      ];

    case 'SCREEN_SHARING':
      return [
        {
          id: 'app_download',
          question: 'Question 1: Did the person ask you to install AnyDesk, TeamViewer, RustDesk, or QuickSupport?',
          options: [
            { label: 'Yes, they sent a link or instructed me to install it', value: 'yes_remote_app', isHighRisk: true },
            { label: 'No, no third-party app requested', value: 'no_app', isHighRisk: false }
          ]
        },
        {
          id: 'pin_visibility',
          question: 'Question 2: Did they ask you to open your UPI app (Google Pay/PhonePe/Paytm) while the screen is connected?',
          options: [
            { label: 'Yes, they told me to open UPI app and check balance', value: 'open_upi_on_screen', isHighRisk: true },
            { label: 'No, never opened financial apps', value: 'not_opened', isHighRisk: false }
          ]
        }
      ];

    case 'DIGITAL_ARREST':
      return [
        {
          id: 'video_threat',
          question: 'Question 1: Are they in police/CBI uniform on video call, forbidding you from disconnecting or telling anyone?',
          options: [
            { label: 'Yes! Claiming "Digital Arrest" under CBI/Narcotics', value: 'yes_fake_police', isHighRisk: true },
            { label: 'No, just normal official email/letter', value: 'official_notice', isHighRisk: false }
          ]
        },
        {
          id: 'money_demand',
          question: 'Question 2: Are they demanding you transfer money into a "safe RBI account" or "court verification" UPI ID?',
          options: [
            { label: 'Yes! Demanding UPI transfer for clearance', value: 'yes_money_demanded', isHighRisk: true },
            { label: 'No money demanded', value: 'no_money', isHighRisk: false }
          ]
        }
      ];

    case 'FAKE_REWARDS':
      return [
        {
          id: 'claim_condition',
          question: 'Question 1: Does the link claim you won free lottery/cashback, but asks for your UPI PIN to deposit it?',
          options: [
            { label: 'Yes! Asks for UPI PIN to "claim prize"', value: 'pin_for_prize', isHighRisk: true },
            { label: 'No PIN asked, just official store coupon code', value: 'normal_coupon', isHighRisk: false }
          ]
        },
        {
          id: 'source_link',
          question: 'Question 2: Did you receive this link from WhatsApp forward, unknown SMS, or Telegram group?',
          options: [
            { label: 'Yes, forwarded message or stranger on Telegram', value: 'suspicious_source', isHighRisk: true },
            { label: 'No, inside the official verified shopping app', value: 'verified_app', isHighRisk: false }
          ]
        }
      ];

    case 'WRONG_TRANSFER':
      return [
        {
          id: 'bank_check',
          question: 'Question 1: Did your actual bank balance increase, or did you only receive a fake SMS formatted like a bank alert?',
          options: [
            { label: 'Only got an SMS from a standard mobile number', value: 'fake_sms', isHighRisk: true },
            { label: 'Actual money arrived in bank statement', value: 'real_balance', isHighRisk: false }
          ]
        },
        {
          id: 'pressure',
          question: 'Question 2: Is the caller crying or shouting, demanding you immediately send money to a DIFFERENT UPI ID?',
          options: [
            { label: 'Yes, pressuring to send to another number urgently', value: 'high_pressure_diff_id', isHighRisk: true },
            { label: 'Polite, willing to let bank handle reverse', value: 'bank_route', isHighRisk: false }
          ]
        }
      ];

    case 'SAFE_PRACTICE':
      return [
        {
          id: 'known_recipient',
          question: 'Question: Is this a known friend, family member, or verified store counter where you scanned the standee?',
          options: [
            { label: 'Yes, physical store or known person', value: 'verified_friend', isHighRisk: false },
            { label: 'No, stranger on internet', value: 'unknown_stranger', isHighRisk: true }
          ]
        }
      ];

    case 'GENERAL_SUSPICIOUS':
    default:
      return [
        {
          id: 'any_pin_requested',
          question: 'Question 1: Did anyone ask you to enter your UPI PIN, share an OTP, or scan a code to RECEIVE money?',
          options: [
            { label: 'Yes, asked for PIN / OTP / scan', value: 'yes_secret_asked', isHighRisk: true },
            { label: 'No, no PIN or OTP asked', value: 'no_secret_asked', isHighRisk: false }
          ]
        },
        {
          id: 'stranger_contact',
          question: 'Question 2: Was this an unsolicited call, WhatsApp message from unknown number (+92, +1, or standard mobile)?',
          options: [
            { label: 'Yes, unknown number / stranger', value: 'stranger', isHighRisk: true },
            { label: 'No, official verified service', value: 'official', isHighRisk: false }
          ]
        }
      ];
  }
}

/**
 * Evaluate the overall scam diagnosis from initial input, matched category, and user's answers
 */
export function evaluateScam(
  userInput: string,
  category: ScamCategory,
  answers: Record<string, string>,
  matchedKeywords: string[]
): ScamAnalysisResult {
  const answerValues = Object.values(answers);
  const highRiskAnswersCount = answerValues.filter(val =>
    [
      'receive_money', 'yes_pin', 'yes_collect', 'teller_says_pay',
      'high_urgency', 'asked_secret', 'yes_remote_app', 'open_upi_on_screen',
      'yes_fake_police', 'yes_money_demanded', 'pin_for_prize', 'suspicious_source',
      'fake_sms', 'high_pressure_diff_id', 'unknown_stranger', 'yes_secret_asked',
      'stranger'
    ].includes(val)
  ).length;

  // Compute risk score (0-100)
  let baseScore = 40;
  if (['DIGITAL_ARREST', 'SCREEN_SHARING'].includes(category)) {
    baseScore = 75;
  } else if (['QR_CODE_RECEIVE', 'COLLECT_REQUEST', 'FAKE_REWARDS'].includes(category)) {
    baseScore = 60;
  } else if (category === 'SAFE_PRACTICE') {
    baseScore = 15;
  }

  const riskScore = Math.min(100, Math.max(5, baseScore + (highRiskAnswersCount * 20)));

  // Determine risk level
  let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' = 'HIGH';
  if (riskScore >= 85) riskLevel = 'CRITICAL';
  else if (riskScore >= 65) riskLevel = 'HIGH';
  else if (riskScore >= 45) riskLevel = 'MEDIUM';
  else if (riskScore >= 25) riskLevel = 'LOW';
  else riskLevel = 'SAFE';

  // Build specific diagnostic report
  switch (category) {
    case 'QR_CODE_RECEIVE':
      return {
        category,
        scamName: 'Fake QR Code Reverse Scam (OLX / Marketplace Fraud)',
        riskLevel,
        riskScore,
        verdictTitle: '🚨 DANGER: 100% CONFIRMED UPI SCAM',
        verdictSummary: 'Scanning a QR code or entering your UPI PIN will DEDUCT money from your account, NOT credit it! The scammer is abusing the QR payment protocol.',
        redFlags: [
          'Scammer claims scanning a QR code is required to RECEIVE advance payment.',
          'UPI PIN screen appears. Entering your PIN authorizes money deduction only.',
          'Commonly seen when selling items on OLX, Quikr, or Facebook Marketplace.',
          'Scammer often poses as an Army Officer or Police Officer to build false trust.'
        ],
        safeActions: [
          'DO NOT scan the QR code or enter your UPI PIN under any circumstances.',
          'Disconnect the call and block the scammer\'s number immediately.',
          'Remember: You ONLY need to share your mobile number or UPI ID (VPA) to receive money.',
          'Report the fraud phone number on the Chakshu portal (sancharsaathi.gov.in).'
        ],
        goldenRule: 'QR Codes are ONLY used for SENDING money. You NEVER need to scan a QR code to receive money!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'COLLECT_REQUEST':
      return {
        category,
        scamName: 'Collect-Request Reverse Payment Fraud',
        riskLevel,
        riskScore,
        verdictTitle: '🚨 HIGH RISK: DECEPTIVE PAYMENT REQUEST',
        verdictSummary: 'The scammer sent a "Collect Request" to your UPI app. Clicking "Pay" and typing your PIN transfers YOUR money to the scammer!',
        redFlags: [
          'Notification or popup says "Pay ₹..." instead of "Money Received".',
          'Caller insists on phone: "Sir, click accept and type PIN so the server releases your funds".',
          'Fake transaction descriptions like "Cashback_Approved_4999" or "Refund_Release".',
          'They create fake confusion to make you approve before reading the button name.'
        ],
        safeActions: [
          'Click "DECLINE" or "REJECT" on the UPI collect request immediately.',
          'Block and mark the UPI ID as fraud directly inside your UPI app (GPay / PhonePe / Paytm).',
          'Never enter your PIN to claim any prize or refund.',
          'If money was deducted, immediately dial National Cyber Helpline 1930.'
        ],
        goldenRule: 'Entering your UPI PIN ALWAYS means money is LEAVING your bank account!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'FAKE_CUSTOMER_CARE':
      return {
        category,
        scamName: 'Fake Customer Care & Urgency KYC / Electricity Scam',
        riskLevel,
        riskScore,
        verdictTitle: '⚠️ FRAUD ALERT: FAKE EXECUTIVE IMPERSONATION',
        verdictSummary: 'Banks, telecom operators, and electricity boards NEVER send SMS from 10-digit mobile numbers demanding instant UPI payments to prevent blockage.',
        redFlags: [
          'SMS comes from an ordinary mobile number (+91-9xxxxxxxxx) instead of an official SMS header like VM-HDFCBK or AD-AIRTEL.',
          'Extreme urgency created: "Account will be permanently blocked in 2 hours".',
          'Asking you to make a ₹10 "verification payment" or click an unverified .apk file.',
          'Fake numbers posted on Google Maps search results pretending to be customer care.'
        ],
        safeActions: [
          'Do NOT call back on numbers sent in unsolicited SMS.',
          'Only use customer care numbers listed on the back of your debit card or verified official website.',
          'Never install APK files sent on WhatsApp or SMS.',
          'Delete the message and report on National Cyber Crime Portal (1930).'
        ],
        goldenRule: 'No bank or electricity company blocks services in 2 hours via WhatsApp or SMS!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'SCREEN_SHARING':
      return {
        category,
        scamName: 'Screen-Sharing & Remote Control Takeover Scam',
        riskLevel: 'CRITICAL',
        riskScore: Math.max(90, riskScore),
        verdictTitle: '🛑 CRITICAL DANGER: DEVICE TAKEOVER ATTEMPT',
        verdictSummary: 'Installing AnyDesk, TeamViewer, RustDesk, or QuickSupport gives the scammer full remote visibility and control of your smartphone screen, OTPs, and passwords!',
        redFlags: [
          'Caller asked you to download AnyDesk / TeamViewer / QuickSupport / RustDesk.',
          'They asked for the 9-digit remote access code displayed on the app.',
          'They instructed you to open your banking or UPI app while the connection is live.',
          'They can read your incoming OTP messages directly from your shared screen.'
        ],
        safeActions: [
          'IMMEDIATELY UNINSTALL the remote desktop app (AnyDesk, TeamViewer, etc.) right now!',
          'Turn off your Wi-Fi and Mobile Data immediately to sever their connection.',
          'Change your UPI PIN and Net Banking passwords from another secure device.',
          'Check your bank statement; if unauthorized deductions occurred, call 1930 instantly.'
        ],
        goldenRule: 'NEVER install remote access or screen-sharing apps on instructions from unknown callers!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'DIGITAL_ARREST':
      return {
        category,
        scamName: 'Digital Arrest / Fake Law Enforcement Cyber Extortion',
        riskLevel: 'CRITICAL',
        riskScore: 100,
        verdictTitle: '⛔ CRITICAL EXTORTION: FAKE DIGITAL ARREST',
        verdictSummary: 'There is NO SUCH LEGAL CONCEPT as "Digital Arrest" under Indian Law! Indian Police, CBI, ED, and Supreme Court NEVER conduct video trials or demand money on UPI.',
        redFlags: [
          'Video call on WhatsApp / Skype showing fake police station background and uniforms.',
          'Claims your Aadhaar was used in illegal parcels (drugs, passports, money laundering).',
          'Threatens immediate arrest if you cut the call or inform parents/family ("Confidential Investigation").',
          'Orders you to transfer funds to a "Government Verification Escrow Account" via UPI/RTGS.'
        ],
        safeActions: [
          'DISCONNECT THE CALL IMMEDIATELY. You are completely safe; it is an organized syndicate.',
          'Talk to your parents, school teachers, or trusted elders right away. Do not stay silent.',
          'Call Cyber Crime Helpline 1930 immediately or visit your nearest local police station.',
          'Report the scammer\'s WhatsApp/Skype account and phone number on cybercrime.gov.in.'
        ],
        goldenRule: 'Indian Law has NO "Digital Arrest". Real Police NEVER demand UPI money transfers!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'FAKE_REWARDS':
      return {
        category,
        scamName: 'Fake Lottery, Cashback & Task Fraud',
        riskLevel,
        riskScore,
        verdictTitle: '🎁 BOGUS PRIZE ALERT: LOTTERY / CASHBACK SCAM',
        verdictSummary: 'This is a clickbait trap. Scammers use attractive banners promising ₹10,000+ cashback to trick you into entering your UPI PIN on a phishing page.',
        redFlags: [
          'Promising huge rewards or cashback for doing nothing or for a random contest you never entered.',
          'Requires you to enter your UPI PIN to "deposit reward".',
          'Links with strange domain names (e.g. gpay-reward-2025.xyz, win-cashback.club).',
          'Telegram channels asking for small deposits (₹500 to get ₹5000) for "rating hotels/tasks".'
        ],
        safeActions: [
          'Close the browser tab immediately and clear your browser cache.',
          'Never type your UPI PIN on web links outside the official UPI application.',
          'Genuine scratch cards inside Google Pay/PhonePe credit automatically without your PIN.',
          'Warn friends and family not to forward such lottery links.'
        ],
        goldenRule: 'Genuine cashbacks credit AUTOMATICALLY. They NEVER require entering a UPI PIN!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'WRONG_TRANSFER':
      return {
        category,
        scamName: 'Accidental Money Sent / Fake SMS Refund Trap',
        riskLevel,
        riskScore,
        verdictTitle: '⚠️ CAUTION: FAKE SMS & WRONG CREDIT SCAM',
        verdictSummary: 'Scammers send a fake SMS looking like a bank credit alert, then call in panic begging for refund, or send money from a stolen account to launder it.',
        redFlags: [
          'SMS comes from an unknown phone number, NOT your bank\'s registered sender ID.',
          'Bank balance in your actual mobile banking app did NOT increase.',
          'Caller demands immediate payment to a different UPI ID without waiting for bank verification.'
        ],
        safeActions: [
          'Open your official mobile banking app and verify your PASSBOOK / ACCOUNT STATEMENT first.',
          'If money did actually arrive, tell the caller: "Please raise an official reversal request through your bank."',
          'Never send money back to a different UPI ID without bank authorization.',
          'Report the caller to your bank branch if they harass you.'
        ],
        goldenRule: 'Always verify bank passbook before believing SMS alerts!',
        detectedKeywords: matchedKeywords,
        isScam: true
      };

    case 'SAFE_PRACTICE':
      return {
        category,
        scamName: 'Standard Verified UPI Payment',
        riskLevel: 'SAFE',
        riskScore: 15,
        verdictTitle: '✅ LOOKS SAFE (STANDARD UPI PAYMENT)',
        verdictSummary: 'Scanning a physical merchant QR standee at a verified retail shop to PAY for goods is the intended, standard use of UPI.',
        redFlags: [
          'No red flags detected based on your input.'
        ],
        safeActions: [
          'Verify the merchant name displayed on the screen before entering your UPI PIN.',
          'Ensure the QR sticker has not been tampered with or pasted over another code.',
          'Never share your UPI PIN with anyone, even the shopkeeper.'
        ],
        goldenRule: 'Entering your UPI PIN is safe ONLY when YOU are actively PAYING at a trusted merchant.',
        detectedKeywords: matchedKeywords,
        isScam: false
      };

    case 'GENERAL_SUSPICIOUS':
    default:
      const looksLikeScam = riskScore >= 50 || highRiskAnswersCount > 0;
      return {
        category: 'GENERAL_SUSPICIOUS',
        scamName: 'Suspicious UPI Payment / Information Request',
        riskLevel: looksLikeScam ? 'HIGH' : 'MEDIUM',
        riskScore: looksLikeScam ? 75 : 45,
        verdictTitle: looksLikeScam ? '🚨 SUSPICIOUS UPI SITUATION DETECTED' : '⚠️ PROCEED WITH CAUTION',
        verdictSummary: looksLikeScam
          ? 'Multiple warning signs detected. Any request where a stranger asks for your PIN, OTP, or remote screen share is almost always fraudulent.'
          : 'Exercise caution. Double-check recipient details before approving any transaction.',
        redFlags: [
          'Unsolicited communication from unknown numbers or links.',
          'Request involving secret credentials like OTP, UPI PIN, or passwords.',
          'High urgency or emotional manipulation.'
        ],
        safeActions: [
          'STOP and verify with an adult, teacher, or your bank before taking action.',
          'Never enter your UPI PIN unless YOU are intentionally paying money.',
          'Keep National Cyber Helpline 1930 saved in your phone.',
          'When in doubt, decline the request.'
        ],
        goldenRule: 'When in doubt, STOP. Think before you PIN!',
        detectedKeywords: matchedKeywords,
        isScam: looksLikeScam
      };
  }
}
