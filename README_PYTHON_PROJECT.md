# SurakshaUPI - Class 9 UPI Fraud Awareness Chatbot (Python Edition)

## Project Overview
**SurakshaUPI** is a Python-based rule-based expert system developed for the Class 9 Computer Science / Cyber Safety exhibition. It educates users on recognizing and preventing UPI payment frauds like Fake QR code scams, reverse collect requests, AnyDesk screen takeover, fake lottery cashbacks, and digital arrest extortion.

---

## Files Included in This Project
1. **`upi_fraud_chatbot.py`**
   - Pure Python 3.10+ command-line chatbot.
   - Uses zero external dependencies (no pip install needed).
   - Features color-coded output, dynamic 1-2 question clarifying trees, threat risk percentage calculations, red flag identification, safe action checklists, and interactive quiz.

2. **`gui_chatbot.py`**
   - Desktop Graphical User Interface using Python's built-in `tkinter` library.
   - Real-time scenario loader, scrolling chat transcript, clickable choice buttons, and emergency alert dialogs.

3. **`test_chatbot.py`**
   - Automated unit test suite using Python's standard `unittest` framework.
   - Tests detection accuracy for all 6 scam categories.

---

## How to Run in Python

### 1. Terminal / Command Prompt:
```bash
# Run interactive CLI Chatbot
python3 upi_fraud_chatbot.py

# Run Unit Tests
python3 test_chatbot.py
```

### 2. Desktop GUI (Tkinter):
```bash
python3 gui_chatbot.py
```

---

## Class 9 Viva-Voce Questions & Answers
1. **Q: Why did you choose Python for this project?**
   - *A:* Python has clean, readable syntax and rich built-in data structures (dictionaries, lists, string manipulation) making it ideal for rule-based natural language pattern matching.

2. **Q: What is a rule-based expert system?**
   - *A:* A rule-based system uses predefined knowledge (keywords, conditional `if-elif-else` heuristics, and decision trees) to solve a specific domain problem without requiring complex black-box neural networks.

3. **Q: What is the Golden UPI Rule?**
   - *A:* "UPI PIN is ONLY for DEDUCTING money, NEVER for receiving!"

4. **Q: What is the National Cyber Crime Helpline in India?**
   - *A:* 1930 (operated by the Ministry of Home Affairs).
