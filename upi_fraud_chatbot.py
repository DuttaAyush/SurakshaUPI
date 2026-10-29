#!/usr/bin/env python3
"""
================================================================================
SurakshaUPI: Class 9 UPI Fraud Awareness Chatbot
Author: Class 9 Computer Science / Cyber Safety Project
Language: Python 3.10+ (Standard Library only - No pip installs needed)
Description: A rule-based conversational chatbot designed to identify common
             UPI scams, ask clarifying questions, issue threat warnings,
             and guide victims to emergency helpline 1930.
================================================================================
"""

import sys
import json
import time

# ANSI Color Codes for terminal demonstration
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


KEYWORD_MAP = {
    'QR_CODE_RECEIVE': [
        'qr', 'qr code', 'scan', 'scan qr', 'receive payment', 'receive money',
        'advance payment', 'olx', 'quikr', 'facebook marketplace', 'receive cashback'
    ],
    'COLLECT_REQUEST': [
        'collect', 'collect request', 'request money', 'click pay', 'approve request',
        'accept payment', 'pay request', 'mandate', 'autopay', 'pending payment'
    ],
    'FAKE_CUSTOMER_CARE': [
        'customer care', 'bank executive', 'kyc', 'kyc update', 'pan card update',
        'account blocked', 'sim blocked', 'electricity bill', 'power cut', 'deactivated',
        'helpline', 'toll free', 'update aadhaar'
    ],
    'SCREEN_SHARING': [
        'anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share',
        'remote access', 'screen share app', 'refund executive', 'install app'
    ],
    'DIGITAL_ARREST': [
        'digital arrest', 'cbi', 'police', 'customs', 'fedex', 'dhl', 'narcotics',
        'drugs', 'skype call', 'whatsapp video call', 'arrest warrant', 'money laundering',
        'court order', 'police uniform', 'supreme court', 'security deposit'
    ],
    'FAKE_REWARDS': [
        'lottery', 'scratch card', 'cashback', 'won', 'winner', 'flipkart prize',
        'telegram task', 'part time job', 'daily 5000', 'crypto profit', 'free gift', 'spin the wheel'
    ],
    'WRONG_TRANSFER': [
        'sent by mistake', 'wrong transfer', 'send back', 'accidental transfer', 'refund me',
        'transferred wrongly', 'my child sent'
    ]
}


DEMO_SCENARIOS = [
    {
        "id": "1",
        "title": "Fake QR Code Scam (OLX / Marketplace)",
        "prompt": "Someone on OLX wants to buy my study table. He sent a QR code on WhatsApp saying 'Scan this QR code and approve on PhonePe to receive ₹4,500 advance payment'."
    },
    {
        "id": "2",
        "title": "Collect-Request Reverse Payment Fraud",
        "prompt": "A caller says he sent ₹2,000 sponsorship. Then Google Pay showed a notification saying 'Pay ₹2,000'. The caller insisted: 'Press Pay and enter UPI PIN to receive money'."
    },
    {
        "id": "3",
        "title": "Fake Customer Care / Urgency KYC / Electricity",
        "prompt": "Received an SMS from an unknown mobile number: 'Dear Customer, your electricity connection / SIM card will be blocked in 2 hours due to pending KYC. Call 9831xxxxxx immediately'."
    },
    {
        "id": "4",
        "title": "Screen-Sharing Remote Access Scam (AnyDesk)",
        "prompt": "Failed transaction refund pending. The helpline executive on Google asked me to install AnyDesk / QuickSupport from Play Store so he can process the refund."
    },
    {
        "id": "5",
        "title": "Fake Digital Arrest Cyber Extortion",
        "prompt": "Received a WhatsApp video call from a man in police uniform claiming to be CBI. He said my Aadhaar was found in a narcotics courier and I am under Digital Arrest unless I deposit ₹50,000 on UPI."
    },
    {
        "id": "6",
        "title": "Fake Rewards & Cashback Phishing",
        "prompt": "Received a WhatsApp link: 'Congratulations! You won ₹15,000 Navratri Festive Cashback. Click here to deposit into bank account'. The page asks for my Secret UPI PIN."
    }
]


def detect_scam_category(user_input: str):
    """Rule-based pattern matcher returning category and matched keywords."""
    text = user_input.lower()
    matched_keywords = []

    # 1. Digital arrest (Highest severity)
    for kw in KEYWORD_MAP['DIGITAL_ARREST']:
        if kw in text:
            matched_keywords.append(kw)
    if 'digital arrest' in text or (('cbi' in text or 'police' in text) and ('deposit' in text or 'narcotics' in text or 'drugs' in text)):
        return 'DIGITAL_ARREST', matched_keywords

    # 2. Screen sharing
    for kw in KEYWORD_MAP['SCREEN_SHARING']:
        if kw in text:
            matched_keywords.append(kw)
    if any(app in text for app in ['anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share']):
        return 'SCREEN_SHARING', matched_keywords

    # 3. QR code to receive money
    qr_matches = [kw for kw in KEYWORD_MAP['QR_CODE_RECEIVE'] if kw in text]
    if qr_matches and ('qr' in text or 'scan' in text):
        return 'QR_CODE_RECEIVE', qr_matches

    # 4. Collect request fraud
    collect_matches = [kw for kw in KEYWORD_MAP['COLLECT_REQUEST'] if kw in text]
    if collect_matches:
        return 'COLLECT_REQUEST', collect_matches

    # 5. Fake rewards & lottery
    reward_matches = [kw for kw in KEYWORD_MAP['FAKE_REWARDS'] if kw in text]
    if reward_matches:
        return 'FAKE_REWARDS', reward_matches

    # 6. Fake customer care
    kyc_matches = [kw for kw in KEYWORD_MAP['FAKE_CUSTOMER_CARE'] if kw in text]
    if kyc_matches:
        return 'FAKE_CUSTOMER_CARE', kyc_matches

    # 7. Accidental transfer
    for kw in KEYWORD_MAP['WRONG_TRANSFER']:
        if kw in text:
            return 'WRONG_TRANSFER', [kw]

    return 'GENERAL_SUSPICIOUS', matched_keywords


def get_follow_up_questions(category: str):
    """Returns 1-2 smart clarifying questions for the detected category."""
    questions = {
        'QR_CODE_RECEIVE': [
            {
                "question": "Are you scanning this QR code to RECEIVE money into your account or to pay?",
                "options": [
                    {"label": "To RECEIVE money (Advance / Cashback / Sale)", "is_high_risk": True},
                    {"label": "To PAY a genuine verified merchant", "is_high_risk": False}
                ]
            },
            {
                "question": "Does your UPI app (GPay / PhonePe / Paytm) ask for your 4 or 6-digit Secret UPI PIN?",
                "options": [
                    {"label": "Yes, it prompts for Secret UPI PIN", "is_high_risk": True},
                    {"label": "No PIN requested", "is_high_risk": False}
                ]
            }
        ],
        'COLLECT_REQUEST': [
            {
                "question": "Does the notification or button say 'PAY' or 'COLLECT REQUEST' from an unknown person?",
                "options": [
                    {"label": "Yes, it says 'Pay' and asks for my PIN", "is_high_risk": True},
                    {"label": "No, it says 'Money Received'", "is_high_risk": False}
                ]
            },
            {
                "question": "Is the caller instructing you on call: 'Press Pay and enter PIN to receive funds'?",
                "options": [
                    {"label": "Yes, they claim pressing Pay will credit money", "is_high_risk": True},
                    {"label": "No, this is my own bill payment", "is_high_risk": False}
                ]
            }
        ],
        'FAKE_CUSTOMER_CARE': [
            {
                "question": "Is the caller or SMS threatening that your bank, SIM, or electricity will be blocked within hours?",
                "options": [
                    {"label": "Yes, creating panic and extreme urgency", "is_high_risk": True},
                    {"label": "No urgency mentioned", "is_high_risk": False}
                ]
            },
            {
                "question": "Did they send an APK file, ask for OTP, or ask for a ₹10 'verification payment'?",
                "options": [
                    {"label": "Yes, asked for OTP / APK / test payment", "is_high_risk": True},
                    {"label": "No secret data asked", "is_high_risk": False}
                ]
            }
        ],
        'SCREEN_SHARING': [
            {
                "question": "Did the person ask you to install AnyDesk, TeamViewer, RustDesk, or QuickSupport?",
                "options": [
                    {"label": "Yes, asked me to download remote access app", "is_high_risk": True},
                    {"label": "No remote app requested", "is_high_risk": False}
                ]
            },
            {
                "question": "Did they ask you to open your UPI or mobile banking app while the screen is connected?",
                "options": [
                    {"label": "Yes, told me to open UPI app and check balance", "is_high_risk": True},
                    {"label": "No banking app opened", "is_high_risk": False}
                ]
            }
        ],
        'DIGITAL_ARREST': [
            {
                "question": "Are they on WhatsApp/Skype video in police uniform forbidding you from disconnecting or telling anyone?",
                "options": [
                    {"label": "Yes! Claiming Digital Arrest for illegal parcels/drugs", "is_high_risk": True},
                    {"label": "No, standard official email", "is_high_risk": False}
                ]
            },
            {
                "question": "Are they demanding you transfer money to a 'Court Escrow / RBI Verification' account via UPI?",
                "options": [
                    {"label": "Yes! Demanding UPI transfer for clearance", "is_high_risk": True},
                    {"label": "No money demanded", "is_high_risk": False}
                ]
            }
        ],
        'FAKE_REWARDS': [
            {
                "question": "Does the lottery/cashback link ask you to enter your UPI PIN to claim the prize?",
                "options": [
                    {"label": "Yes, asks for UPI PIN to credit reward", "is_high_risk": True},
                    {"label": "No PIN asked, normal coupon code", "is_high_risk": False}
                ]
            },
            {
                "question": "Did you receive this link from WhatsApp forward, unknown SMS, or random Telegram group?",
                "options": [
                    {"label": "Yes, forwarded link from unknown source", "is_high_risk": True},
                    {"label": "No, inside official verified shopping app", "is_high_risk": False}
                ]
            }
        ],
        'GENERAL_SUSPICIOUS': [
            {
                "question": "Did anyone ask you to enter your UPI PIN, share an OTP, or scan a code to RECEIVE money?",
                "options": [
                    {"label": "Yes, asked for PIN / OTP / scan", "is_high_risk": True},
                    {"label": "No secret credentials asked", "is_high_risk": False}
                ]
            }
        ]
    }
    return questions.get(category, questions['GENERAL_SUSPICIOUS'])


def evaluate_scam(user_input: str, category: str, high_risk_count: int):
    """Calculates risk score and generates full diagnostic report."""
    base_scores = {
        'DIGITAL_ARREST': 80,
        'SCREEN_SHARING': 75,
        'QR_CODE_RECEIVE': 60,
        'COLLECT_REQUEST': 60,
        'FAKE_REWARDS': 60,
        'FAKE_CUSTOMER_CARE': 50,
        'WRONG_TRANSFER': 50,
        'GENERAL_SUSPICIOUS': 40
    }
    base = base_scores.get(category, 40)
    risk_score = min(100, base + (high_risk_count * 20))

    if risk_score >= 85:
        risk_level = "CRITICAL"
    elif risk_score >= 65:
        risk_level = "HIGH"
    elif risk_score >= 45:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    reports = {
        'QR_CODE_RECEIVE': {
            "name": "Fake QR Code Reverse Scam",
            "verdict": "DANGER: 100% CONFIRMED UPI SCAM",
            "summary": "Scanning a QR code or typing your UPI PIN will DEDUCT money from your account, NOT credit it! The scammer is abusing the QR payment protocol.",
            "red_flags": [
                "Scammer claims scanning a QR code is required to RECEIVE advance payment.",
                "UPI PIN screen appears. Entering your PIN authorizes money deduction only.",
                "Commonly seen when selling items on OLX, Quikr, or Facebook Marketplace."
            ],
            "safe_actions": [
                "DO NOT scan the QR code or enter your Secret UPI PIN under any circumstances.",
                "Disconnect the call and block the scammer's number immediately.",
                "Remember: You only need to give your phone number or UPI ID (VPA) to receive money.",
                "Report fraud phone numbers on Sanchar Saathi (Chakshu portal)."
            ],
            "golden_rule": "QR Codes are ONLY used for SENDING money. You NEVER need to scan a QR code to receive money!"
        },
        'COLLECT_REQUEST': {
            "name": "Collect-Request Reverse Payment Fraud",
            "verdict": "HIGH RISK: DECEPTIVE PAYMENT REQUEST",
            "summary": "The scammer sent an incoming 'Collect Request' to your UPI app. Clicking 'Pay' and typing your PIN transfers YOUR money to the scammer!",
            "red_flags": [
                "Notification says 'Pay ₹...' instead of 'Money Received'.",
                "Caller insists on phone: 'Press Pay and enter PIN to accept money into your account'.",
                "Deceptive transaction notes like 'Cashback_Release' or 'Refund_Approved'."
            ],
            "safe_actions": [
                "Click 'DECLINE' or 'REJECT' on the UPI collect request immediately.",
                "Block and report the scammer's UPI ID inside your UPI app (GPay / PhonePe).",
                "Never enter your PIN to claim any prize or refund.",
                "If money was deducted, immediately dial National Cyber Helpline 1930."
            ],
            "golden_rule": "Entering your UPI PIN ALWAYS means money is LEAVING your bank account!"
        },
        'FAKE_CUSTOMER_CARE': {
            "name": "Fake Customer Care & Urgency KYC / Electricity Scam",
            "verdict": "FRAUD ALERT: FAKE EXECUTIVE IMPERSONATION",
            "summary": "Banks, electricity boards, and telecom operators NEVER send SMS from 10-digit mobile numbers demanding instant UPI payments to prevent blockage.",
            "red_flags": [
                "SMS comes from an ordinary mobile number (+91-9xxxxxxxxx) instead of an official bank header.",
                "Extreme urgency created: 'Account will be permanently blocked in 2 hours'.",
                "Asking you to make a ₹10 test payment or click an unverified .apk link."
            ],
            "safe_actions": [
                "Do NOT call back on phone numbers sent in unsolicited SMS.",
                "Only use official numbers printed on the back of your debit card or official bank portal.",
                "Never install APK files sent via WhatsApp or SMS.",
                "Report the incident on National Cyber Crime Portal (1930)."
            ],
            "golden_rule": "No bank or electricity company blocks services in 2 hours via WhatsApp or SMS!"
        },
        'SCREEN_SHARING': {
            "name": "Screen-Sharing Remote Device Takeover Scam",
            "verdict": "CRITICAL DANGER: DEVICE TAKEOVER ATTEMPT",
            "summary": "Installing AnyDesk, TeamViewer, RustDesk, or QuickSupport gives the scammer full remote visibility of your smartphone screen, passwords, and incoming OTPs!",
            "red_flags": [
                "Caller asked you to download AnyDesk / TeamViewer / QuickSupport.",
                "They asked for the 9-digit remote connection code.",
                "They instructed you to open your UPI or mobile banking app while connected."
            ],
            "safe_actions": [
                "IMMEDIATELY UNINSTALL the remote desktop app (AnyDesk, TeamViewer) right now!",
                "Turn off your Wi-Fi and Mobile Data immediately to cut the connection.",
                "Change your UPI PIN and NetBanking passwords from another secure device.",
                "Check your bank balance; if unauthorized deductions occurred, call 1930 instantly."
            ],
            "golden_rule": "NEVER install remote access or screen-sharing apps on instructions from unknown callers!"
        },
        'DIGITAL_ARREST': {
            "name": "Digital Arrest / Fake Law Enforcement Cyber Extortion",
            "verdict": "CRITICAL EXTORTION: FAKE DIGITAL ARREST",
            "summary": "There is NO SUCH LEGAL CONCEPT as 'Digital Arrest' under Indian Law! Indian Police, CBI, ED, and Supreme Court NEVER conduct video trials or demand money on UPI.",
            "red_flags": [
                "Video call on WhatsApp / Skype showing fake police uniform and station backdrop.",
                "Claims your Aadhaar was found in illegal narcotics / money laundering parcels.",
                "Threatens immediate arrest if you disconnect or inform parents ('Confidential Case').",
                "Orders you to transfer funds to a 'Court Escrow / RBI Verification' UPI ID."
            ],
            "safe_actions": [
                "DISCONNECT THE CALL IMMEDIATELY. You are completely safe; it is an organized syndicate.",
                "Talk to your parents, school teachers, or trusted elders right away. Do not stay silent.",
                "Call Cyber Crime Helpline 1930 immediately or visit your nearest local police station.",
                "Report the scammer's number on cybercrime.gov.in."
            ],
            "golden_rule": "Indian Law has NO 'Digital Arrest'. Real Police NEVER demand UPI money transfers!"
        },
        'FAKE_REWARDS': {
            "name": "Fake Lottery, Cashback & Scratch Card Scam",
            "verdict": "BOGUS PRIZE ALERT: CASHBACK / LOTTERY TRAP",
            "summary": "This is a clickbait trap. Scammers use attractive banners promising ₹10,000+ cashback to trick you into entering your UPI PIN on a phishing page.",
            "red_flags": [
                "Promising huge cash prizes for a contest you never entered.",
                "Requires entering your Secret UPI PIN to 'deposit reward'.",
                "Unusual web links outside the official Google Pay / PhonePe app."
            ],
            "safe_actions": [
                "Close the browser tab immediately.",
                "Never enter your UPI PIN on any web link or scratch card page.",
                "Legitimate cashbacks credit AUTOMATICALLY without requiring your PIN.",
                "Warn friends and family not to forward such lottery links."
            ],
            "golden_rule": "Genuine cashbacks credit AUTOMATICALLY. They NEVER require entering a UPI PIN!"
        }
    }

    report = reports.get(category, {
        "name": "Suspicious UPI Payment / Information Request",
        "verdict": "CAUTION: SUSPICIOUS ACTIVITY DETECTED",
        "summary": "Multiple warning signs detected. Any request where a stranger asks for your PIN, OTP, or remote screen share is almost always fraudulent.",
        "red_flags": [
            "Unsolicited request involving money or secret credentials.",
            "Pressure or urgency applied by an unknown caller."
        ],
        "safe_actions": [
            "Never enter your UPI PIN to receive money.",
            "Consult parents or teachers before taking action.",
            "Call 1930 if money was deducted."
        ],
        "golden_rule": "When in doubt, STOP. Think before you PIN!"
    })

    return {
        "category": category,
        "scam_name": report["name"],
        "risk_level": risk_level,
        "risk_score": risk_score,
        "verdict": report["verdict"],
        "summary": report["summary"],
        "red_flags": report["red_flags"],
        "safe_actions": report["safe_actions"],
        "golden_rule": report["golden_rule"]
    }


def print_banner():
    print(f"{Colors.HEADER}{'='*70}")
    print("      🛡️  SurakshaUPI: Class 9 UPI Fraud Awareness Chatbot  🛡️")
    print("             CBSE / School Cyber Safety Project (Python 3)")
    print(f"{'='*70}{Colors.ENDC}\n")


def run_interactive_investigation(preset_text=None):
    """Main interactive investigation flow in Python terminal."""
    if preset_text:
        user_query = preset_text
        print(f"\n{Colors.CYAN}[Scenario]: {user_query}{Colors.ENDC}\n")
    else:
        print(f"{Colors.CYAN}Describe the suspicious situation (call, SMS, QR code, or payment request):{Colors.ENDC}")
        user_query = input(f"{Colors.BOLD}> {Colors.ENDC}").strip()
        if not user_query:
            print("No description provided. Returning to menu.")
            return

    print(f"\n{Colors.BLUE}🤖 Raksha AI Bot: Analyzing your situation using rule-based heuristics...{Colors.ENDC}")
    time.sleep(0.5)

    category, matched_kw = detect_scam_category(user_query)
    questions = get_follow_up_questions(category)

    high_risk_count = 0

    print(f"{Colors.BLUE}🤖 Raksha AI Bot: Let me ask {len(questions)} quick question(s) to verify:{Colors.ENDC}\n")

    for i, q in enumerate(questions, 1):
        print(f"{Colors.BOLD}Q{i}: {q['question']}{Colors.ENDC}")
        for opt_idx, opt in enumerate(q['options'], 1):
            print(f"   [{opt_idx}] {opt['label']}")

        choice = input(f"{Colors.BOLD}Select option (1-{len(q['options'])}): {Colors.ENDC}").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(q['options']):
            selected = q['options'][int(choice) - 1]
            if selected['is_high_risk']:
                high_risk_count += 1
        else:
            print(f"{Colors.WARNING}Invalid choice. Assuming standard caution.{Colors.ENDC}")
        print()

    # Generate diagnosis
    result = evaluate_scam(user_query, category, high_risk_count)

    # Display Verdict
    print(f"\n{Colors.FAIL if result['risk_level'] in ['CRITICAL', 'HIGH'] else Colors.GREEN}{'='*70}")
    print(f"  {result['verdict']}")
    print(f"  Scam Type: {result['scam_name']}")
    print(f"  Threat Level: {result['risk_level']} ({result['risk_score']}% Probability)")
    print(f"{'='*70}{Colors.ENDC}\n")

    print(f"{Colors.BOLD}📝 Investigation Verdict:{Colors.ENDC}")
    print(f"   {result['summary']}\n")

    print(f"{Colors.FAIL}{Colors.BOLD}🚩 Red Flags Identified:{Colors.ENDC}")
    for flag in result['red_flags']:
        print(f"   • {flag}")
    print()

    print(f"{Colors.GREEN}{Colors.BOLD}🛡️ Recommended Safe Actions:{Colors.ENDC}")
    for idx, act in enumerate(result['safe_actions'], 1):
        print(f"   {idx}. {act}")
    print()

    print(f"{Colors.HEADER}{Colors.BOLD}💡 Class 9 Golden Cyber Rule:{Colors.ENDC}")
    print(f"   \"{result['golden_rule']}\"\n")

    if result['risk_level'] in ['CRITICAL', 'HIGH']:
        print(f"{Colors.WARNING}🚨 If money was already deducted, dial 1930 immediately!{Colors.ENDC}\n")


def display_safety_rules():
    """Displays 6 essential rules for Class 9 presentation."""
    print(f"\n{Colors.HEADER}{'='*70}")
    print("           📜 6 OFFICIAL UPI CYBER SAFETY RULES")
    print(f"{'='*70}{Colors.ENDC}\n")

    rules = [
        ("1. The Golden PIN Rule", "UPI PIN is ONLY for DEDUCTING money. NEVER for receiving!"),
        ("2. The QR Code Reality", "QR Codes only send money. Never scan a QR code to receive payments."),
        ("3. Zero Screen-Sharing", "Never install AnyDesk or TeamViewer for customer care callers."),
        ("4. No 'Digital Arrest'", "Indian Law has NO Digital Arrest. Police never demand UPI transfers."),
        ("5. The 1930 Golden Hour", "Report fraud within 1-2 hours on Helpline 1930 to freeze accounts."),
        ("6. Passbook over SMS", "Always check your real bank passbook. Never trust SMS alerts alone.")
    ]

    for title, desc in rules:
        print(f"{Colors.CYAN}{Colors.BOLD}{title}:{Colors.ENDC} {desc}")
    print()


def display_report_guide():
    """Emergency reporting details."""
    print(f"\n{Colors.FAIL}{'='*70}")
    print("        🚨 NATIONAL CYBER CRIME HELPLINE: 1930")
    print(f"{'='*70}{Colors.ENDC}\n")
    print("If you or anyone in your family has lost money on UPI:")
    print("1. Call 1930 immediately (Available 24x7 across India).")
    print("2. Visit https://cybercrime.gov.in to register an official e-FIR.")
    print("3. Contact your bank's toll-free cyber cell to freeze your account.")
    print("4. Save screenshots of the UPI UTR / Transaction ID and scammer phone number.\n")


def run_quiz():
    """Interactive 3-question quiz for class demonstration."""
    print(f"\n{Colors.HEADER}{'='*70}")
    print("         🎯 CLASS 9 CYBER SAFETY CHALLENGE QUIZ")
    print(f"{'='*70}{Colors.ENDC}\n")

    questions = [
        {
            "q": "Do you ever need to enter your UPI PIN to RECEIVE money?",
            "options": ["Yes, to accept the transfer", "No, NEVER! PIN is only for sending money", "Only above ₹2,000"],
            "correct": 2,
            "exp": "UPI PIN authorizes a debit. You NEVER enter a PIN to receive money."
        },
        {
            "q": "What will happen if you scan a QR code sent by an OLX buyer and enter your PIN?",
            "options": ["Money will be credited", "Money will be DEDUCTED from your account", "It verifies your identity"],
            "correct": 2,
            "exp": "Scanning a QR code and entering your PIN transfers YOUR money to the scammer."
        },
        {
            "q": "What is the national toll-free cyber crime helpline number in India?",
            "options": ["100", "1930", "112"],
            "correct": 2,
            "exp": "1930 is the dedicated financial cyber fraud reporting helpline."
        }
    ]

    score = 0
    for idx, item in enumerate(questions, 1):
        print(f"{Colors.BOLD}Q{idx}: {item['q']}{Colors.ENDC}")
        for o_idx, opt in enumerate(item['options'], 1):
            print(f"   [{o_idx}] {opt}")
        ans = input(f"{Colors.BOLD}Your answer: {Colors.ENDC}").strip()
        if ans == str(item['correct']):
            print(f"{Colors.GREEN}✓ Correct! {item['exp']}{Colors.ENDC}\n")
            score += 1
        else:
            print(f"{Colors.FAIL}✗ Incorrect! {item['exp']}{Colors.ENDC}\n")

    print(f"{Colors.CYAN}{Colors.BOLD}Quiz Completed! Your Score: {score} / {len(questions)}{Colors.ENDC}\n")


def main():
    # If called with command line argument --json for API mode:
    if len(sys.argv) > 1 and sys.argv[1] == '--json':
        input_data = sys.stdin.read()
        try:
            req = json.loads(input_data)
            text = req.get('text', '')
            cat, kw = detect_scam_category(text)
            questions = get_follow_up_questions(cat)
            diagnosis = evaluate_scam(text, cat, req.get('high_risk_count', 0))
            print(json.dumps({
                "category": cat,
                "keywords": kw,
                "questions": questions,
                "diagnosis": diagnosis
            }))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
        return

    print_banner()

    while True:
        print(f"{Colors.BOLD}--- MAIN MENU ---{Colors.ENDC}")
        print("1. Test Custom Suspicious Situation (Free-form input)")
        print("2. Test Pre-loaded Demo Scenarios (6 Class 9 Examples)")
        print("3. View 6 Official UPI Safety Rules")
        print("4. Report Fraud Guide (Helpline 1930 Protocol)")
        print("5. Take Class 9 Cyber Safety Challenge Quiz")
        print("6. Exit")

        choice = input(f"{Colors.BOLD}Enter choice (1-6): {Colors.ENDC}").strip()

        if choice == '1':
            run_interactive_investigation()
        elif choice == '2':
            print(f"\n{Colors.CYAN}Select a Demo Scenario:{Colors.ENDC}")
            for sc in DEMO_SCENARIOS:
                print(f"  [{sc['id']}] {sc['title']}")
            sc_choice = input(f"{Colors.BOLD}Select scenario (1-6): {Colors.ENDC}").strip()
            matched = next((s for s in DEMO_SCENARIOS if s['id'] == sc_choice), None)
            if matched:
                run_interactive_investigation(preset_text=matched['prompt'])
            else:
                print("Invalid scenario choice.")
        elif choice == '3':
            display_safety_rules()
        elif choice == '4':
            display_report_guide()
        elif choice == '5':
            run_quiz()
        elif choice == '6':
            print(f"\n{Colors.GREEN}Stay Safe, Stay Cyber Smart! Exiting SurakshaUPI.{Colors.ENDC}\n")
            break
        else:
            print(f"{Colors.WARNING}Please choose between 1 and 6.{Colors.ENDC}\n")


if __name__ == '__main__':
    main()
