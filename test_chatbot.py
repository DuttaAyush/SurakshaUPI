#!/usr/bin/env python3
"""
Unit tests for SurakshaUPI Python implementation.
Uses standard library unittest.
"""

import unittest
from upi_fraud_chatbot import (
    detect_scam_category,
    get_follow_up_questions,
    evaluate_scam,
    DEMO_SCENARIOS
)

class TestUPIFraudChatbot(unittest.TestCase):

    def test_detect_qr_code_scam(self):
        prompt = "Buyer on OLX sent QR code and told me to scan to receive advance payment"
        category, kw = detect_scam_category(prompt)
        self.assertEqual(category, "QR_CODE_RECEIVE")
        self.assertTrue(len(kw) > 0)

    def test_detect_digital_arrest(self):
        prompt = "CBI officer on Skype video call said narcotics found in courier and I am under digital arrest"
        category, kw = detect_scam_category(prompt)
        self.assertEqual(category, "DIGITAL_ARREST")

    def test_detect_screen_sharing(self):
        prompt = "Refund executive told me to download AnyDesk and QuickSupport on mobile"
        category, kw = detect_scam_category(prompt)
        self.assertEqual(category, "SCREEN_SHARING")

    def test_detect_collect_request(self):
        prompt = "Received collect request on GPay saying click pay to receive funds"
        category, kw = detect_scam_category(prompt)
        self.assertEqual(category, "COLLECT_REQUEST")

    def test_detect_fake_rewards(self):
        prompt = "You won 15000 festive cashback lottery, enter UPI PIN"
        category, kw = detect_scam_category(prompt)
        self.assertEqual(category, "FAKE_REWARDS")

    def test_detect_customer_care_kyc(self):
        prompt = "SMS says electricity bill unpaid and SIM will be blocked call customer care immediately"
        category, kw = detect_scam_category(prompt)
        self.assertEqual(category, "FAKE_CUSTOMER_CARE")

    def test_follow_up_questions_structure(self):
        categories = ['QR_CODE_RECEIVE', 'COLLECT_REQUEST', 'FAKE_CUSTOMER_CARE',
                      'SCREEN_SHARING', 'DIGITAL_ARREST', 'FAKE_REWARDS']
        for cat in categories:
            questions = get_follow_up_questions(cat)
            self.assertGreaterEqual(len(questions), 1)
            self.assertLessEqual(len(questions), 2)
            for q in questions:
                self.assertIn("question", q)
                self.assertIn("options", q)
                self.assertGreaterEqual(len(q["options"]), 2)

    def test_evaluate_scam_critical_threat(self):
        result = evaluate_scam("Digital arrest extortion", "DIGITAL_ARREST", high_risk_count=2)
        self.assertEqual(result["risk_level"], "CRITICAL")
        self.assertGreaterEqual(result["risk_score"], 85)
        self.assertIn("Digital Arrest", result["golden_rule"])

    def test_demo_scenarios_completeness(self):
        self.assertEqual(len(DEMO_SCENARIOS), 6)
        for sc in DEMO_SCENARIOS:
            self.assertIn("id", sc)
            self.assertIn("title", sc)
            self.assertIn("prompt", sc)


if __name__ == '__main__':
    unittest.main()
