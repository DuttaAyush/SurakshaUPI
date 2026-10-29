/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectScamCategory,
  getFollowUpQuestions,
  evaluateScam,
  DEMO_SCENARIOS
} from './fraudDetection';

test('detectScamCategory identifies QR code scam correctly', () => {
  const input = 'Someone on OLX asked me to scan a QR code to receive money for my old bicycle';
  const result = detectScamCategory(input);
  assert.equal(result.category, 'QR_CODE_RECEIVE');
  assert.ok(result.matchedKeywords.length > 0);
});

test('detectScamCategory identifies Digital Arrest scam correctly', () => {
  const input = 'CBI officer in police uniform on video call saying I am under digital arrest and must deposit funds';
  const result = detectScamCategory(input);
  assert.equal(result.category, 'DIGITAL_ARREST');
});

test('detectScamCategory identifies Screen-Sharing scam correctly', () => {
  const input = 'Customer care executive told me to install AnyDesk on my mobile to get my refund';
  const result = detectScamCategory(input);
  assert.equal(result.category, 'SCREEN_SHARING');
});

test('detectScamCategory identifies Collect Request correctly', () => {
  const input = 'Received collect request of 5000 on GPay and caller says click approve to receive';
  const result = detectScamCategory(input);
  assert.equal(result.category, 'COLLECT_REQUEST');
});

test('detectScamCategory identifies Fake Rewards correctly', () => {
  const input = 'Won 20,000 lottery scratch card cashback on festive link';
  const result = detectScamCategory(input);
  assert.equal(result.category, 'FAKE_REWARDS');
});

test('getFollowUpQuestions returns 1-2 targeted questions for each category', () => {
  const qrQuestions = getFollowUpQuestions('QR_CODE_RECEIVE');
  assert.ok(qrQuestions.length >= 1 && qrQuestions.length <= 2);
  assert.ok(qrQuestions[0].options.length >= 2);

  const digitalArrestQuestions = getFollowUpQuestions('DIGITAL_ARREST');
  assert.ok(digitalArrestQuestions.length >= 1 && digitalArrestQuestions.length <= 2);
});

test('evaluateScam calculates critical risk for Digital Arrest and Screen Sharing', () => {
  const result = evaluateScam(
    'Digital arrest call',
    'DIGITAL_ARREST',
    { video_threat: 'yes_fake_police', money_demand: 'yes_money_demanded' },
    ['digital arrest', 'cbi']
  );
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.equal(result.riskScore, 100);
  assert.ok(result.goldenRule.includes('Digital Arrest'));
  assert.ok(result.isScam);
});

test('evaluateScam identifies QR Code scam and emphasizes PIN rule', () => {
  const result = evaluateScam(
    'OLX QR scan',
    'QR_CODE_RECEIVE',
    { ask_pin: 'receive_money', pin_prompt: 'yes_pin' },
    ['qr', 'receive money']
  );
  assert.ok(result.riskScore >= 80);
  assert.ok(result.goldenRule.includes('NEVER'));
  assert.ok(result.safeActions.some(a => a.includes('DO NOT scan')));
});

test('all demo scenarios have valid categories and follow-up options', () => {
  for (const scenario of DEMO_SCENARIOS) {
    assert.ok(scenario.title);
    assert.ok(scenario.userPrompt);
    const questions = getFollowUpQuestions(scenario.category);
    assert.ok(questions.length > 0);
  }
});
