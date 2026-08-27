/**
 * Rule-based digital triage engine.
 *
 * This is deliberately NOT a diagnostic model. It is a decision-SUPPORT layer for a
 * frontline health worker: it converts reported symptoms + basic vitals into an
 * urgency band (green / yellow / red) and a plain-language recommendation, using
 * transparent red-flag rules rather than a black-box classifier. Every rule that
 * fires is listed in `reasoning` so the health worker can see exactly why a score
 * was assigned and can always override it. It never prescribes medication or
 * names a diagnosis; it only routes the patient to the right level of care.
 *
 * Swap-in point for a real model: replace `scoreSymptoms()` internals with a call
 * to a hosted clinical-decision-support model/API, keeping the same input/output
 * contract ({symptoms, vitals} -> {urgency, score, reasoning, recommended_action}).
 */

// Red-flag symptom codes that alone justify immediate escalation.
const RED_FLAG_SYMPTOMS = new Set([
  'chest_pain', 'severe_breathlessness', 'unconsciousness', 'seizure',
  'heavy_bleeding', 'stroke_signs', 'severe_abdominal_pain_pregnancy',
  'suicidal_ideation', 'high_fever_with_stiff_neck', 'snake_bite',
]);

// Symptoms that add moderate weight.
const MODERATE_SYMPTOMS = new Set([
  'fever', 'persistent_cough', 'vomiting', 'diarrhea', 'mild_breathlessness',
  'body_ache', 'headache', 'dizziness', 'skin_rash', 'joint_pain', 'fatigue',
]);

function scoreVitals(vitals = {}) {
  let score = 0;
  const notes = [];
  if (vitals.spo2 != null && vitals.spo2 < 92) { score += 40; notes.push(`SpO2 ${vitals.spo2}% is below 92%`); }
  else if (vitals.spo2 != null && vitals.spo2 < 95) { score += 15; notes.push(`SpO2 ${vitals.spo2}% is borderline`); }

  if (vitals.systolic != null) {
    if (vitals.systolic >= 180 || vitals.systolic < 90) { score += 30; notes.push(`Systolic BP ${vitals.systolic} is out of safe range`); }
    else if (vitals.systolic >= 160) { score += 10; notes.push(`Systolic BP ${vitals.systolic} is elevated`); }
  }
  if (vitals.temp != null) {
    if (vitals.temp >= 103) { score += 20; notes.push(`Temperature ${vitals.temp}°F is very high`); }
    else if (vitals.temp >= 100.4) { score += 8; notes.push(`Temperature ${vitals.temp}°F indicates fever`); }
  }
  if (vitals.pulse != null && (vitals.pulse > 130 || vitals.pulse < 45)) {
    score += 20; notes.push(`Pulse ${vitals.pulse} bpm is abnormal`);
  }
  return { score, notes };
}

export function runTriage({ symptoms = [], vitals = {}, riskFlags = [] }) {
  let score = 0;
  const reasoning = [];
  let hasRedFlag = false;

  for (const s of symptoms) {
    if (RED_FLAG_SYMPTOMS.has(s)) {
      hasRedFlag = true;
      score += 60;
      reasoning.push(`Red-flag symptom reported: ${s.replaceAll('_', ' ')}`);
    } else if (MODERATE_SYMPTOMS.has(s)) {
      score += 12;
      reasoning.push(`Reported: ${s.replaceAll('_', ' ')}`);
    } else {
      score += 4;
      reasoning.push(`Reported (unclassified): ${s.replaceAll('_', ' ')}`);
    }
  }

  const { score: vitalScore, notes } = scoreVitals(vitals);
  score += vitalScore;
  reasoning.push(...notes);

  // High-risk groups get a lower threshold for escalation (maternal, chronic, elderly)
  const highRiskGroup = riskFlags.some(f => ['pregnant', 'elderly', 'diabetes', 'hypertension'].includes(f));
  if (highRiskGroup && score >= 20) {
    score += 10;
    reasoning.push(`Patient belongs to a high-risk group (${riskFlags.join(', ')}) — threshold lowered`);
  }

  let urgency, recommended_action;
  if (hasRedFlag || score >= 60) {
    urgency = 'red';
    recommended_action = 'Escalate immediately: arrange emergency transport or the nearest facility capable of emergency care. Notify supervising doctor now.';
  } else if (score >= 25) {
    urgency = 'yellow';
    recommended_action = 'Book a same-day teleconsultation with a doctor; do not wait for a routine appointment.';
  } else {
    urgency = 'green';
    recommended_action = 'Manage at the local PHC/sub-centre with routine care and standard advice; schedule a follow-up if symptoms persist beyond 3 days.';
  }

  return {
    urgency,
    score,
    reasoning: reasoning.length ? reasoning.join('; ') : 'No significant symptoms or vital-sign abnormalities reported.',
    recommended_action,
  };
}
