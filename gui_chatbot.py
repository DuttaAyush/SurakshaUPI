#!/usr/bin/env python3
"""
================================================================================
SurakshaUPI: Class 9 Desktop GUI Chatbot (Python Tkinter)
Author: Class 9 Computer Science / Cyber Safety Project
Standard Library only: Uses Python's built-in Tkinter framework
Run on Windows/Mac/Linux with: python3 gui_chatbot.py
================================================================================
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from upi_fraud_chatbot import (
    detect_scam_category,
    get_follow_up_questions,
    evaluate_scam,
    DEMO_SCENARIOS
)

class SurakshaUPIGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("SurakshaUPI - Class 9 UPI Fraud Awareness Chatbot (Python Tkinter)")
        self.root.geometry("850x680")
        self.root.minsize(700, 550)

        # Theme colors
        self.bg_color = "#f8fafc"
        self.primary_color = "#4338ca" # Indigo
        self.danger_color = "#dc2626"  # Red
        self.success_color = "#16a34a" # Green

        self.root.configure(bg=self.bg_color)

        self.current_category = None
        self.pending_questions = []
        self.current_q_index = 0
        self.high_risk_count = 0
        self.user_prompt_text = ""

        self.build_ui()

    def build_ui(self):
        # 1. Header Frame
        header = tk.Frame(self.root, bg=self.primary_color, padx=15, pady=12)
        header.pack(fill=tk.X)

        title_lbl = tk.Label(
            header,
            text="🛡️ SurakshaUPI - Class 9 Cyber Safety Chatbot",
            font=("Helvetica", 16, "bold"),
            fg="white",
            bg=self.primary_color
        )
        title_lbl.pack(side=tk.LEFT)

        badge_lbl = tk.Label(
            header,
            text="Helpline: 1930",
            font=("Helvetica", 11, "bold"),
            fg="#1e1b4b",
            bg="#fef08a",
            padx=10,
            pady=3
        )
        badge_lbl.pack(side=tk.RIGHT)

        # 2. Demo Scenarios Quick Frame
        scenarios_frame = tk.LabelFrame(
            self.root,
            text=" Quick Demo Scenarios (Class 9 Project Examples) ",
            bg=self.bg_color,
            fg="#334155",
            font=("Helvetica", 10, "bold"),
            padx=10,
            pady=8
        )
        scenarios_frame.pack(fill=tk.X, padx=15, pady=8)

        for sc in DEMO_SCENARIOS:
            btn = tk.Button(
                scenarios_frame,
                text=sc["title"],
                font=("Helvetica", 9),
                bg="#e2e8f0",
                fg="#1e293b",
                relief=tk.RAISED,
                padx=6,
                pady=2,
                cursor="hand2",
                command=lambda s=sc: self.load_scenario(s)
            )
            btn.pack(side=tk.LEFT, padx=3, pady=2)

        # 3. Main Chat History Log
        self.chat_display = scrolledtext.ScrolledText(
            self.root,
            wrap=tk.WORD,
            font=("Helvetica", 11),
            bg="white",
            fg="#0f172a",
            padx=12,
            pady=12,
            relief=tk.SOLID,
            borderwidth=1
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=15, pady=5)
        self.chat_display.tag_config("bot", foreground="#4338ca", font=("Helvetica", 11, "bold"))
        self.chat_display.tag_config("user", foreground="#0f172a", font=("Helvetica", 11, "italic"))
        self.chat_display.tag_config("danger", foreground="#b91c1c", font=("Helvetica", 11, "bold"))
        self.chat_display.tag_config("rule", foreground="#065f46", font=("Helvetica", 11, "bold"))

        # Welcome message
        self.append_bot_msg(
            "Namaste! I am Raksha, your Class 9 UPI Cyber Safety Assistant.\n"
            "Did you receive a suspicious call, message, QR code, or payment request?\n"
            "Select one of the demo scenarios above or type your situation below to analyze!"
        )

        # 4. Interactive Question Choice Bar (Dynamic)
        self.question_frame = tk.Frame(self.root, bg="#e0e7ff", padx=10, pady=8)
        # Not packed initially, packed when asking questions

        # 5. Input Area
        input_frame = tk.Frame(self.root, bg=self.bg_color, padx=15, pady=10)
        input_frame.pack(fill=tk.X)

        self.input_entry = tk.Entry(
            input_frame,
            font=("Helvetica", 12),
            bg="white",
            fg="#1e293b",
            relief=tk.SOLID,
            borderwidth=1
        )
        self.input_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10), ipady=5)
        self.input_entry.bind("<Return>", lambda e: self.on_analyze_click())

        analyze_btn = tk.Button(
            input_frame,
            text="Analyze Situation 🚀",
            font=("Helvetica", 11, "bold"),
            bg=self.primary_color,
            fg="white",
            padx=15,
            pady=5,
            relief=tk.FLAT,
            cursor="hand2",
            command=self.on_analyze_click
        )
        analyze_btn.pack(side=tk.LEFT, padx=(0, 5))

        rules_btn = tk.Button(
            input_frame,
            text="Safety Rules 📜",
            font=("Helvetica", 10),
            bg="#f1f5f9",
            fg="#334155",
            padx=10,
            pady=5,
            command=self.show_safety_rules
        )
        rules_btn.pack(side=tk.LEFT, padx=(0, 5))

        helpline_btn = tk.Button(
            input_frame,
            text="Report 1930 🚨",
            font=("Helvetica", 10, "bold"),
            bg="#fee2e2",
            fg="#b91c1c",
            padx=10,
            pady=5,
            command=self.show_helpline_info
        )
        helpline_btn.pack(side=tk.LEFT)

    def append_bot_msg(self, text, tag="bot"):
        self.chat_display.insert(tk.END, f"\n🤖 Raksha: {text}\n", tag)
        self.chat_display.see(tk.END)

    def append_user_msg(self, text):
        self.chat_display.insert(tk.END, f"\n👤 You: {text}\n", "user")
        self.chat_display.see(tk.END)

    def load_scenario(self, scenario):
        self.input_entry.delete(0, tk.END)
        self.input_entry.insert(0, scenario["prompt"])
        self.on_analyze_click()

    def on_analyze_click(self):
        text = self.input_entry.get().strip()
        if not text:
            return

        self.input_entry.delete(0, tk.END)
        self.append_user_msg(text)
        self.user_prompt_text = text

        cat, kw = detect_scam_category(text)
        self.current_category = cat
        self.pending_questions = get_follow_up_questions(cat)
        self.current_q_index = 0
        self.high_risk_count = 0

        self.ask_next_question()

    def ask_next_question(self):
        if self.current_q_index < len(self.pending_questions):
            q_data = self.pending_questions[self.current_q_index]
            self.append_bot_msg(f"Clarifying Question: {q_data['question']}")

            # Clear question frame
            for child in self.question_frame.winfo_children():
                child.destroy()

            q_lbl = tk.Label(
                self.question_frame,
                text=f"👉 {q_data['question']}",
                font=("Helvetica", 10, "bold"),
                bg="#e0e7ff",
                fg="#1e1b4b"
            )
            q_lbl.pack(anchor="w", padx=5, pady=2)

            btn_box = tk.Frame(self.question_frame, bg="#e0e7ff")
            btn_box.pack(fill=tk.X, pady=4)

            for opt in q_data["options"]:
                b = tk.Button(
                    btn_box,
                    text=opt["label"],
                    font=("Helvetica", 9, "bold"),
                    bg="white",
                    fg="#4338ca",
                    relief=tk.RAISED,
                    padx=10,
                    pady=4,
                    cursor="hand2",
                    command=lambda o=opt: self.answer_question(o)
                )
                b.pack(side=tk.LEFT, padx=5)

            self.question_frame.pack(fill=tk.X, padx=15, pady=5)
        else:
            self.question_frame.pack_forget()
            self.show_diagnosis()

    def answer_question(self, option):
        if option.get("is_high_risk"):
            self.high_risk_count += 1
        self.append_user_msg(f"[Selected]: {option['label']}")
        self.current_q_index += 1
        self.ask_next_question()

    def show_diagnosis(self):
        result = evaluate_scam(self.user_prompt_text, self.current_category, self.high_risk_count)

        tag = "danger" if result["risk_level"] in ["CRITICAL", "HIGH"] else "rule"
        verdict_text = (
            f"\n{'='*50}\n"
            f"🔍 {result['verdict']}\n"
            f"Threat Score: {result['risk_score']}% ({result['risk_level']} RISK)\n"
            f"Scam Category: {result['scam_name']}\n"
            f"{'='*50}\n"
            f"\nVerdict Explanation:\n{result['summary']}\n\n"
            f"🚩 Red Flags Identified:\n" + "\n".join(f"  • {f}" for f in result['red_flags']) + "\n\n"
            f"🛡️ Safe Actions to Take:\n" + "\n".join(f"  {i}. {a}" for i, a in enumerate(result['safe_actions'], 1)) + "\n\n"
            f"💡 Golden Cyber Rule:\n\"{result['golden_rule']}\"\n"
        )
        self.chat_display.insert(tk.END, verdict_text, tag)
        self.chat_display.see(tk.END)

        if result["risk_level"] in ["CRITICAL", "HIGH"]:
            messagebox.showwarning(
                "High Scam Danger Detected!",
                f"Warning: This situation matches known {result['scam_name']} patterns.\n"
                f"Never enter your UPI PIN to receive money!\n"
                f"Emergency Helpline: 1930"
            )

    def show_safety_rules(self):
        rules_text = (
            "6 Official UPI Safety Rules:\n\n"
            "1. The Golden PIN Rule: UPI PIN is ONLY entered to deduct money, NEVER to receive!\n\n"
            "2. QR Codes Reality: QR Codes only send money. Never scan to receive cashback.\n\n"
            "3. Zero Screen-Sharing: Never install AnyDesk or TeamViewer for stranger's call.\n\n"
            "4. No Digital Arrest: Indian Law has NO Digital Arrest. Police never demand UPI money.\n\n"
            "5. Helpline 1930: Call 1930 within 1-2 hours of fraud to freeze stolen funds.\n\n"
            "6. Passbook Check: Always check bank passbook in mobile app. Never trust SMS alone."
        )
        messagebox.showinfo("Official UPI Safety Rules", rules_text)

    def show_helpline_info(self):
        msg = (
            "National Cyber Crime Reporting Helpline: 1930\n\n"
            "Website: https://cybercrime.gov.in\n\n"
            "Golden Hour Protocol:\n"
            "1. Block UPI & NetBanking from your bank app or toll-free number.\n"
            "2. Call 1930 immediately with your 12-digit UPI UTR transaction ID.\n"
            "3. Save screenshots of WhatsApp chats, calls, and transaction receipts."
        )
        messagebox.showinfo("Report Fraud - Helpline 1930", msg)


if __name__ == "__main__":
    root = tk.Tk()
    app = SurakshaUPIGUI(root)
    root.mainloop()
