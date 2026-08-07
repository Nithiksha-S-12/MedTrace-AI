const config = require('../config/config');

// Mock AI response for when Groq key is not set
const getMockAISummary = (records) => {
  return {
    criticalAlerts: [
      'Allergy: Penicillin (Severe — Anaphylaxis risk)',
      'Medication: Warfarin 5mg daily (Blood thinner — bleeding risk)',
    ],
    chronicConditions: [
      'Type 2 Diabetes Mellitus (HbA1c: 7.8%) — Active',
      'Hypertension Stage 2 (BP: 150/95) — Controlled on Amlodipine',
    ],
    minorHistory: [
      'Upper Respiratory Tract Infection — Jan 2023 (Resolved)',
      'Mild Gastritis — Mar 2022 (Resolved)',
      'Tension Headache — Sep 2021 (Resolved)',
    ],
    snapshot:
      '55yo male with Type 2 DM and Stage 2 HTN. Allergic to Penicillin (anaphylaxis). On Warfarin — bleeding risk. No recent cardiac events. Past minor URTIs and gastritis resolved.',
    generatedAt: new Date(),
  };
};

/**
 * Generate AI triage summary using Groq + Llama 3
 * Falls back to mock data if GROQ_API_KEY is not set
 */
const generateAISummary = async (records) => {
  if (config.groq.useMock) {
    console.log('  [AI] Using mock AI summary (no GROQ_API_KEY set)');
    return getMockAISummary(records);
  }

  try {
    const { Groq } = require('groq-sdk');
    const groq = new Groq({ apiKey: config.groq.apiKey });

    // Build context from records
    const recordSummary = records
      .slice(0, 20) // Limit tokens
      .map(
        (r) =>
          `[${r.recordDate?.toISOString().split('T')[0] || 'Unknown date'}] ${r.type.toUpperCase()}: ${r.reportTitle}. ${r.reportText?.substring(0, 300) || ''}`
      )
      .join('\n');

    const prompt = `You are a medical triage assistant for an emergency department. Analyze this patient's medical history and output a structured JSON summary.

Patient Medical History:
${recordSummary}

Output ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "criticalAlerts": ["list of life-threatening allergies and blood thinners with doses"],
  "chronicConditions": ["list of active chronic conditions with status"],
  "minorHistory": ["list of resolved minor conditions with dates"],
  "snapshot": "50-word ER snapshot in plain English for emergency team"
}

Rules:
- criticalAlerts: ONLY include allergies that cause anaphylaxis/severe reaction, and anticoagulants/blood thinners. Use RED alert language.
- chronicConditions: ONLY active, ongoing conditions (diabetes, hypertension, heart disease, asthma, kidney disease, cancer).
- minorHistory: Only minor, resolved conditions older than 6 months (cold, fever, mild gastritis).
- snapshot: Write exactly like a handoff note for an ER doctor. Max 50 words. Include age, key conditions, critical allergies.
- If a category has no items, return empty array [].`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content || '{}';

    // Parse JSON (handle potential markdown wrapping)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    return {
      criticalAlerts: parsed.criticalAlerts || [],
      chronicConditions: parsed.chronicConditions || [],
      minorHistory: parsed.minorHistory || [],
      snapshot: parsed.snapshot || 'Summary unavailable.',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[AI Service Error]:', err.message);
    // Fallback to mock on error
    return getMockAISummary(records);
  }
};

module.exports = { generateAISummary };
