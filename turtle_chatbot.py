#!/usr/bin/env python3
"""
================================================================================
SurakshaUPI: Class 9 UPI Fraud Awareness Chatbot with Python TURTLE Graphics
CBSE / ICSE Class 9 Computer Science Project
Language: Pure Python 3 (Standard Library: turtle, time, sys)
================================================================================
Run this file in Python IDLE, VS Code, or Terminal:
    python3 turtle_chatbot.py
================================================================================
"""

import sys
import time

# Try importing turtle (available in standard Python on Windows, macOS, Linux with GUI)
TURTLE_AVAILABLE = False
try:
    import turtle
    TURTLE_AVAILABLE = True
except Exception:
    TURTLE_AVAILABLE = False


# Scam knowledge base & keywords
KEYWORD_MAP = {
    'QR_CODE_RECEIVE': ['qr', 'qr code', 'scan', 'scan qr', 'receive payment', 'receive money', 'advance payment', 'olx'],
    'COLLECT_REQUEST': ['collect', 'collect request', 'request money', 'click pay', 'approve request', 'accept payment'],
    'FAKE_CUSTOMER_CARE': ['customer care', 'kyc', 'kyc update', 'account blocked', 'sim blocked', 'electricity bill'],
    'SCREEN_SHARING': ['anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share', 'remote access'],
    'DIGITAL_ARREST': ['digital arrest', 'cbi', 'police', 'customs', 'fedex', 'narcotics', 'drugs', 'skype call'],
    'FAKE_REWARDS': ['lottery', 'scratch card', 'cashback', 'won', 'winner', 'flipkart prize', 'telegram task']
}

DEMO_SCENARIOS = {
    "1": ("Fake QR Code Scam", "Someone on OLX asked me to scan a QR code to receive Rs 4,500 advance for my study table."),
    "2": ("Collect-Request Fraud", "A stranger says he sent Rs 2,000 and asked me to click 'Pay' on Google Pay to accept it."),
    "3": ("Fake Customer Care / KYC", "SMS claims electricity will be disconnected in 2 hours unless I call to update KYC."),
    "4": ("Screen-Sharing Scam", "Helpdesk executive asked me to install AnyDesk to process a refund."),
    "5": ("Digital Arrest Scam", "Fake police on Skype video call says my Aadhaar is in drug parcel and demands UPI bail."),
    "6": ("Fake Rewards / Cashback", "WhatsApp link says 'You won Rs 15,000 Festive Cashback', enter UPI PIN to deposit.")
}


def detect_scam(text):
    t = text.lower()
    if 'digital arrest' in t or (('cbi' in t or 'police' in t) and ('deposit' in t or 'drugs' in t or 'narcotics' in t)):
        return 'DIGITAL_ARREST'
    if any(app in t for app in ['anydesk', 'teamviewer', 'rustdesk', 'quicksupport', 'screen share']):
        return 'SCREEN_SHARING'
    if any(kw in t for kw in KEYWORD_MAP['QR_CODE_RECEIVE']) and ('qr' in t or 'scan' in t):
        return 'QR_CODE_RECEIVE'
    if any(kw in t for kw in KEYWORD_MAP['COLLECT_REQUEST']):
        return 'COLLECT_REQUEST'
    if any(kw in t for kw in KEYWORD_MAP['FAKE_REWARDS']):
        return 'FAKE_REWARDS'
    if any(kw in t for kw in KEYWORD_MAP['FAKE_CUSTOMER_CARE']):
        return 'FAKE_CUSTOMER_CARE'
    return 'GENERAL_SUSPICIOUS'


def get_verdict(category, high_risk_count):
    base_scores = {'DIGITAL_ARREST': 80, 'SCREEN_SHARING': 75, 'QR_CODE_RECEIVE': 60, 'COLLECT_REQUEST': 60, 'FAKE_REWARDS': 60}
    score = min(100, base_scores.get(category, 50) + (high_risk_count * 20))
    risk_level = "CRITICAL SCAM" if score >= 85 else ("HIGH RISK" if score >= 65 else "SUSPICIOUS")
    
    rules = {
        'QR_CODE_RECEIVE': "QR Codes are ONLY for SENDING money. NEVER scan to receive money!",
        'DIGITAL_ARREST': "Indian Law has NO 'Digital Arrest'. Real Police NEVER demand UPI money!",
        'SCREEN_SHARING': "NEVER install remote access apps (AnyDesk) on instructions from callers!",
        'COLLECT_REQUEST': "Entering UPI PIN ALWAYS means money is LEAVING your account!",
        'FAKE_REWARDS': "Genuine cashbacks credit AUTOMATICALLY without your UPI PIN!"
    }
    
    return {
        "score": score,
        "level": risk_level,
        "rule": rules.get(category, "PIN is for DEDUCTING money, NEVER for receiving!"),
        "helpline": "1930 (National Cyber Crime Helpline)"
    }


# ==============================================================================
# Python Turtle Visual Graphics Engine
# ==============================================================================
class TurtleChatbotVisualizer:
    def __init__(self):
        if not TURTLE_AVAILABLE:
            print("Notice: GUI Turtle requires graphical desktop. Running in Python Console mode.")
            return

        self.screen = turtle.Screen()
        self.screen.setup(width=900, height=700)
        self.screen.title("SurakshaUPI: Class 9 Cyber Safety Chatbot (Python Turtle)")
        self.screen.bgcolor("#0f172a") # Dark navy blue
        self.screen.tracer(0)

        self.t = turtle.Turtle()
        self.t.hideturtle()
        self.t.speed(0)

    def draw_rounded_rect(self, x, y, width, height, radius, fill_color, border_color="#334155"):
        """Draws a rounded rectangular card on the turtle canvas."""
        self.t.penup()
        self.t.goto(x + radius, y)
        self.t.pendown()
        self.t.color(border_color, fill_color)
        self.t.begin_fill()
        for _ in range(2):
            self.t.forward(width - 2 * radius)
            self.t.circle(radius, 90)
            self.t.forward(height - 2 * radius)
            self.t.circle(radius, 90)
        self.t.end_fill()

    def draw_shield(self, x, y, size=40, color="#10b981"):
        """Draws the official Cyber Security Shield in Turtle."""
        self.t.penup()
        self.t.goto(x, y)
        self.t.setheading(0)
        self.t.pendown()
        self.t.color(color, color)
        self.t.begin_fill()
        self.t.forward(size)
        self.t.right(90)
        self.t.forward(size * 0.8)
        self.t.circle(-size, 45)
        self.t.goto(x, y - size * 1.8)
        self.t.goto(x - size * 0.7, y - size * 1.5)
        self.t.circle(-size, 45)
        self.t.forward(size * 0.8)
        self.t.goto(x, y)
        self.t.end_fill()

        # Checkmark
        self.t.penup()
        self.t.goto(x - size * 0.3, y - size * 0.9)
        self.t.setheading(-45)
        self.t.pendown()
        self.t.color("#ffffff")
        self.t.pensize(4)
        self.t.forward(size * 0.4)
        self.t.left(90)
        self.t.forward(size * 0.7)
        self.t.pensize(1)

    def draw_header(self):
        """Draws header title bar."""
        self.draw_rounded_rect(-420, 260, 840, 75, 12, "#1e293b", "#475569")
        self.draw_shield(-380, 315, size=24, color="#10b981")

        self.t.penup()
        self.t.goto(-330, 285)
        self.t.color("#f8fafc")
        self.t.write("SurakshaUPI: Class 9 Cyber Safety Chatbot", font=("Arial", 16, "bold"))

        self.t.goto(-330, 268)
        self.t.color("#94a3b8")
        self.t.write("CBSE / ICSE School Project Edition • Python Turtle", font=("Arial", 10, "normal"))

        # Emergency 1930 badge
        self.draw_rounded_rect(240, 275, 160, 42, 8, "#dc2626", "#ef4444")
        self.t.penup()
        self.t.goto(320, 286)
        self.t.color("#ffffff")
        self.t.write("Helpline: 1930", align="center", font=("Arial", 11, "bold"))

    def draw_threat_meter(self, score, level):
        """Draws animated graphical threat bar in Turtle."""
        self.t.penup()
        self.t.goto(-380, 40)
        self.t.color("#f8fafc")
        self.t.write(f"THREAT ASSESSMENT: {level} ({score}%)", font=("Arial", 13, "bold"))

        # Outer bar
        self.draw_rounded_rect(-380, 10, 760, 22, 6, "#334155", "#475569")

        # Inner fill
        bar_color = "#ef4444" if score >= 80 else ("#f59e0b" if score >= 50 else "#10b981")
        fill_width = int(760 * (score / 100))
        if fill_width > 12:
            self.draw_rounded_rect(-380, 10, fill_width, 22, 6, bar_color, bar_color)

    def draw_result_card(self, verdict_data, category):
        """Draws full diagnosis report on the Turtle screen."""
        self.t.clear()
        self.draw_header()

        # Diagnosis card background
        is_danger = verdict_data['score'] >= 65
        bg_card = "#450a0a" if is_danger else "#064e3b"
        border_card = "#dc2626" if is_danger else "#059669"
        self.draw_rounded_rect(-400, -220, 800, 460, 16, bg_card, border_card)

        # Threat meter
        self.draw_threat_meter(verdict_data['score'], verdict_data['level'])

        # Verdict text
        self.t.penup()
        self.t.goto(-380, -30)
        self.t.color("#ffffff")
        self.t.write(f"Scam Category Detected: {category.replace('_', ' ')}", font=("Arial", 14, "bold"))

        self.t.goto(-380, -70)
        self.t.color("#fecaca" if is_danger else "#a7f3d0")
        self.t.write(f"Investigation Verdict:", font=("Arial", 11, "bold"))

        self.t.goto(-380, -100)
        self.t.color("#f1f5f9")
        if category == 'QR_CODE_RECEIVE':
            summary = "Scanning a QR code or entering your Secret PIN will DEDUCT money!\nNever scan a QR code to receive advance payments."
        elif category == 'DIGITAL_ARREST':
            summary = "There is NO 'Digital Arrest' in Indian Law! Police never conduct\nvideo call trials or demand UPI bail money."
        elif category == 'SCREEN_SHARING':
            summary = "AnyDesk/TeamViewer lets hackers view your screen and steal OTPs!\nUninstall the remote app immediately."
        else:
            summary = "Suspicious financial request detected. Entering your PIN transfers YOUR money."
        
        self.t.write(summary, font=("Arial", 11, "normal"))

        # Golden Rule box
        self.draw_rounded_rect(-380, -190, 760, 60, 8, "#1e1b4b", "#4338ca")
        self.t.penup()
        self.t.goto(-370, -155)
        self.t.color("#fef08a")
        self.t.write("CLASS 9 GOLDEN CYBER RULE:", font=("Arial", 9, "bold"))
        self.t.goto(-370, -178)
        self.t.color("#ffffff")
        self.t.write(f"\"{verdict_data['rule']}\"", font=("Arial", 11, "bold"))

        self.screen.update()


def main():
    print("=" * 65)
    print("  SurakshaUPI: Class 9 UPI Fraud Chatbot with Python TURTLE")
    print("=" * 65)
    
    visualizer = None
    if TURTLE_AVAILABLE:
        try:
            visualizer = TurtleChatbotVisualizer()
            visualizer.draw_header()
            visualizer.screen.update()
        except Exception as e:
            print(f"(Running without graphical display: {e})")
            visualizer = None

    print("\nSelect a Demo Scenario to test:")
    for num, (title, prompt) in DEMO_SCENARIOS.items():
        print(f"  [{num}] {title}")
    print("  [7] Enter Custom Suspicious Situation")

    choice = input("\nEnter choice (1-7): ").strip()
    if choice in DEMO_SCENARIOS:
        title, user_text = DEMO_SCENARIOS[choice]
        print(f"\nScenario selected: {title}")
        print(f"Situation: {user_text}")
    else:
        user_text = input("\nDescribe your situation: ").strip()

    category = detect_scam(user_text)
    print(f"\nAnalyzing situation... Identified Category: {category}")

    # Ask 1-2 clarifying questions
    print("\nClarifying Question 1:")
    print("Are you doing this to RECEIVE money or PAY someone?")
    print("  [1] To RECEIVE money into my bank (Sale, cashback, advance)")
    print("  [2] To PAY a genuine verified merchant")
    q1 = input("Choose 1 or 2: ").strip()

    print("\nClarifying Question 2:")
    print("Does the app prompt for your Secret 4/6-digit UPI PIN?")
    print("  [1] Yes, it asks for my UPI PIN")
    print("  [2] No PIN requested")
    q2 = input("Choose 1 or 2: ").strip()

    high_risk_count = (1 if q1 == '1' else 0) + (1 if q2 == '1' else 0)
    verdict = get_verdict(category, high_risk_count)

    # Output to terminal
    print("\n" + "=" * 65)
    print(f"🚨 VERDICT: {verdict['level']} ({verdict['score']}%)")
    print(f"💡 Golden Rule: {verdict['rule']}")
    print(f"📞 Helpline: Dial 1930 within the Golden Hour!")
    print("=" * 65)

    # Render on Turtle Canvas if graphical display is active
    if visualizer:
        try:
            visualizer.draw_result_card(verdict, category)
            print("\nTurtle canvas updated! Click turtle window to close or press Enter.")
            visualizer.screen.exitonclick()
        except Exception:
            pass


if __name__ == '__main__':
    main()
