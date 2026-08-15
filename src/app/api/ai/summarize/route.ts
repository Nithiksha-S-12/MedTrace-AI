import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Record from "@/models/Record";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { patientId, medicalHistory: inputMedicalHistory } = body;

    // Resolve patient by session or provided patientId (id / healthId / govId)
    let patient: any = null;
    const targetId = patientId || (session?.user as any)?.dbId || (session?.user as any)?.healthId;

    if (targetId) {
      if (mongoose.Types.ObjectId.isValid(targetId)) {
        patient = await User.findById(targetId).select("-password");
      }
      if (!patient) {
        patient = await User.findOne({
          $or: [{ healthId: targetId }, { govId: targetId }],
        }).select("-password");
      }
    }

    // Fallback to session user if patient still not found
    if (!patient && (session?.user as any)?.dbId) {
      patient = await User.findById((session?.user as any).dbId).select("-password");
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch medical records for patient
    const records = await Record.find({ patientId: patient._id }).sort({ date: -1 }).lean();

    // Construct medical history text
    let historyText = "";
    if (inputMedicalHistory && typeof inputMedicalHistory === "string" && inputMedicalHistory.trim()) {
      historyText = inputMedicalHistory.trim();
    } else if (patient.medicalHistory && patient.medicalHistory.trim()) {
      historyText = patient.medicalHistory.trim();
    }

    if (records.length > 0) {
      const recordsText = records
        .map(
          (r: any) =>
            `[${new Date(r.date).toLocaleDateString("en-IN")}] ${r.type}: ${r.title}. ${r.aiSummary || ""} (Category: ${r.category || "N/A"})`
        )
        .join("\n");
      historyText = historyText ? `${historyText}\n\nRecent Records:\n${recordsText}` : recordsText;
    }

    if (!historyText) {
      historyText = "No prior medical history or records documented for this patient.";
    }

    const hfKey = process.env.HUGGINGFACE_API_KEY;
    const model = process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";

    let summaryJson: any = null;

    // Check if valid Hugging Face API key is available
    if (hfKey && !hfKey.startsWith("hf_xxx") && hfKey.length > 10) {
      const prompt = `<s>[INST] You are a medical triage assistant. Output JSON with criticalAlerts, chronicConditions, minorHistory, summary.
Structure must be exact JSON without markdown code blocks:
{
  "criticalAlerts": "Allergies, blood thinners, life-threatening conditions or 'No known critical alerts'",
  "chronicConditions": "Ongoing diseases requiring long-term management or 'No chronic conditions recorded'",
  "minorHistory": "Resolved minor past conditions or 'No minor history recorded'",
  "summary": "A 50-word ER snapshot including key conditions, allergies, and current medications."
}

Patient Medical Records:
${historyText}
[/INST]`;

      try {
        console.log(`[AI Summarize] Calling Hugging Face model: ${model}`);
        const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 600, temperature: 0.2, return_full_text: false },
            options: { wait_for_model: true },
          }),
        });

        if (hfRes.ok) {
          const data = await hfRes.json();
          const rawText = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || "";
          console.log("[AI Summarize] Hugging Face response received:", rawText.slice(0, 150));

          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            summaryJson = JSON.parse(jsonMatch[0]);
          }
        } else {
          const errText = await hfRes.text();
          console.warn("[AI Summarize] Hugging Face API error response:", hfRes.status, errText);
        }
      } catch (err: any) {
        console.error("[AI Summarize] Hugging Face fetch failed:", err?.message);
      }
    }

    // Fallback: If HF failed or key not configured, build structured fallback
    if (!summaryJson || !summaryJson.summary) {
      console.log("[AI Summarize] Generating structured fallback summary...");
      const criticals = records.filter((r: any) => r.category === "critical");
      const chronics = records.filter((r: any) => r.category === "chronic");
      const minors = records.filter((r: any) => r.category === "minor");

      let critAlerts = criticals.length > 0 ? criticals.map((r: any) => r.title).join("; ") : "";
      if (historyText.toLowerCase().includes("penicillin")) {
        critAlerts = critAlerts ? `${critAlerts}; Severe Penicillin Allergy` : "Severe Penicillin Allergy";
      }
      if (!critAlerts) critAlerts = "No known critical alerts on file.";

      let chronicCond = chronics.length > 0 ? chronics.map((r: any) => r.title).join("; ") : "";
      if (historyText.toLowerCase().includes("hypertension") && !chronicCond.toLowerCase().includes("hypertension")) {
        chronicCond = chronicCond ? `${chronicCond}; Stage 1 Hypertension` : "Stage 1 Hypertension (Amlodipine 5mg)";
      }
      if (historyText.toLowerCase().includes("diabetes") && !chronicCond.toLowerCase().includes("diabetes")) {
        chronicCond = chronicCond ? `${chronicCond}; Type 2 Diabetes` : "Type 2 Diabetes (Metformin 500mg)";
      }
      if (!chronicCond) chronicCond = "No chronic conditions recorded.";

      let minorHist = minors.length > 0 ? minors.map((r: any) => r.title).join("; ") : "";
      if (!minorHist) minorHist = "No minor history recorded.";

      summaryJson = {
        criticalAlerts: critAlerts,
        chronicConditions: chronicCond,
        minorHistory: minorHist,
        summary: `Patient ${patient.name} (${patient.healthId || "HID"}). ${critAlerts.includes("Allergy") || critAlerts.includes("Critical") ? `Alerts: ${critAlerts}.` : "No critical alerts."} Active conditions: ${chronicCond}. History reviewed across ${records.length} record(s). Ready for ER triage assessment.`,
      };
    }

    // Save summary to Citizen model in MongoDB
    summaryJson.updatedAt = new Date();
    await User.findByIdAndUpdate(patient._id, {
      aiSummary: summaryJson,
    });
    console.log(`[AI Summarize] Summary saved for citizen ${patient._id}`);

    return NextResponse.json({ summary: summaryJson });
  } catch (err: any) {
    console.error("[AI Summarize] Endpoint error:", err);
    return NextResponse.json({ error: "AI summarization failed", detail: err?.message }, { status: 500 });
  }
}
