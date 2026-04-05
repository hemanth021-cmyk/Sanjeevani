

export interface Drug {
  id: string;
  name: string;
}

export interface GraphLink {
  source: string;
  target: string;
  severity: "high" | "moderate" | "safe";
  description: string;
  aiExplanation: string; // NLP Explanation
}

export const DRUGS: Drug[] = [
  { id: "Aspirin", name: "Aspirin" },
  { id: "Warfarin", name: "Warfarin" },
  { id: "Ibuprofen", name: "Ibuprofen" },
  { id: "Lisinopril", name: "Lisinopril" },
  { id: "Potassium", name: "Potassium" },
  { id: "Simvastatin", name: "Simvastatin" },
  { id: "Amiodarone", name: "Amiodarone" },
  { id: "Metformin", name: "Metformin" },
  { id: "Amoxicillin", name: "Amoxicillin" },
  { id: "Cephalexin", name: "Cephalexin" }
];

export const DRUG_INTERACTIONS: GraphLink[] = [
  { 
    source: "Aspirin", target: "Warfarin", severity: "high", 
    description: "Major bleed risk due to antiplatelet + anticoagulant combination.",
    aiExplanation: "This combination significantly thins the blood through two different physiological mechanisms, heavily increasing the risk of spontaneous internal bleeding. Immediate physician review is mandatory."
  },
  { 
    source: "Ibuprofen", target: "Aspirin", severity: "moderate", 
    description: "Concurrent use decreases the cardioprotective effect of aspirin.",
    aiExplanation: "Taking Ibuprofen blocks the heart-protecting effects of Aspirin, meaning the patient loses cardiovascular protection while increasing overall gastrointestinal distress."
  },
  { 
    source: "Lisinopril", target: "Potassium", severity: "high", 
    description: "Risk of potentially fatal hyperkalemia.",
    aiExplanation: "Lisinopril already forces the kidneys to retain Potassium. Taking additional Potassium supplements can cause an electrical imbalance in the heart, leading to fatal cardiac arrest."
  },
  { 
    source: "Simvastatin", target: "Amiodarone", severity: "high", 
    description: "Increased risk of rhabdomyolysis and myopathy.",
    aiExplanation: "Amiodarone prevents the liver from clearing Simvastatin out of the blood. The resulting toxic buildup of Simvastatin directly breaks down muscle tissue, which can cause kidney failure."
  },
  { 
    source: "Aspirin", target: "Lisinopril", severity: "safe", 
    description: "No significant adverse interaction.",
    aiExplanation: "These drugs operate on completely different biological pathways and have no known reactive crossovers. Safe to administer."
  },
  { 
    source: "Ibuprofen", target: "Warfarin", severity: "high", 
    description: "Increased risk of severe bleeding.",
    aiExplanation: "Ibuprofen damages the stomach lining while Warfarin prevents the blood from clotting. This guarantees a severe inability to stop gastrointestinal hemorrhaging."
  },
];

export interface WearableData {
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  status: 'Normal' | 'Elevated' | 'Critical';
}

export interface Patient {
  id: string;
  ghost_id: string;
  name: string;
  age: number;
  encryptedActivePrescriptions: string[];
  predictiveAnalytics: string;
  wearables: WearableData;
}

import { GENERATED_PATIENTS } from "./generatedPatients";

export const MOCK_PATIENTS: Patient[] = GENERATED_PATIENTS as unknown as Patient[];
