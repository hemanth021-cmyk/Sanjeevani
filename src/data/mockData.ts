

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
  {
    source: "Metformin", target: "Ibuprofen", severity: "moderate",
    description: "NSAIDs can reduce metformin's renal clearance, increasing lactic acidosis risk.",
    aiExplanation: "NSAIDs like Ibuprofen reduce kidney blood flow, causing Metformin to accumulate. Elevated Metformin levels can trigger life-threatening lactic acidosis, especially in elderly patients."
  },
  {
    source: "Metformin", target: "Lisinopril", severity: "moderate",
    description: "ACE inhibitors may enhance hypoglycaemic effects of Metformin.",
    aiExplanation: "Lisinopril can potentiate blood-sugar-lowering effects of Metformin, increasing risk of hypoglycaemia. Monitor blood glucose levels closely."
  },
  {
    source: "Amoxicillin", target: "Warfarin", severity: "moderate",
    description: "Amoxicillin can potentiate anticoagulant effect of Warfarin.",
    aiExplanation: "Broad-spectrum antibiotics like Amoxicillin disrupt gut bacteria that produce Vitamin K, leading to enhanced anticoagulation. INR monitoring is essential during combined use."
  },
  {
    source: "Cephalexin", target: "Warfarin", severity: "moderate",
    description: "Cephalexin may enhance the anticoagulant effect of Warfarin.",
    aiExplanation: "Cephalexin, like other cephalosporins, can suppress gut flora responsible for Vitamin K production, indirectly amplifying Warfarin's blood-thinning action."
  },
  {
    source: "Simvastatin", target: "Aspirin", severity: "safe",
    description: "No clinically significant interaction expected.",
    aiExplanation: "Aspirin and Simvastatin are frequently co-prescribed for cardiovascular prevention. No adverse pharmacokinetic interaction has been identified."
  },
  {
    source: "Amiodarone", target: "Warfarin", severity: "high",
    description: "Amiodarone markedly potentiates the anticoagulant effect of Warfarin.",
    aiExplanation: "Amiodarone inhibits CYP2C9, the primary enzyme responsible for Warfarin metabolism. This causes dangerous Warfarin accumulation and massively elevated bleeding risk."
  },
  {
    source: "Lisinopril", target: "Ibuprofen", severity: "moderate",
    description: "NSAIDs can reduce the antihypertensive effectiveness of Lisinopril.",
    aiExplanation: "Ibuprofen inhibits prostaglandin synthesis which Lisinopril relies on to lower blood pressure. The combination blunts the ACE inhibitor's effect and can lead to acute kidney injury."
  },
  {
    source: "Potassium", target: "Amoxicillin", severity: "safe",
    description: "No significant pharmacological interaction identified.",
    aiExplanation: "Potassium supplements and Amoxicillin operate on entirely different biological targets with no known cross-reactivity."
  },
  {
    source: "Simvastatin", target: "Metformin", severity: "safe",
    description: "No significant interaction between these agents.",
    aiExplanation: "Simvastatin and Metformin are commonly co-prescribed in diabetic patients with dyslipidaemia. No clinically significant pharmacokinetic interaction has been documented."
  },
  {
    source: "Cephalexin", target: "Metformin", severity: "moderate",
    description: "Cephalexin may inhibit renal tubular secretion of Metformin.",
    aiExplanation: "Cephalexin competes with Metformin for active renal tubular secretion via the OCT2 transporter, potentially increasing Metformin plasma concentrations and lactic acidosis risk."
  },
  {
    source: "Amoxicillin", target: "Metformin", severity: "safe",
    description: "No clinically significant interaction documented.",
    aiExplanation: "Amoxicillin and Metformin do not interact via shared metabolic pathways. Standard doses of both are safe for co-administration."
  },
  {
    source: "Aspirin", target: "Simvastatin", severity: "safe",
    description: "Safe combination used commonly in cardiac patients.",
    aiExplanation: "Aspirin and Simvastatin are a standard combination in cardiovascular preventive therapy with no significant adverse drug-drug interaction identified."
  },
  {
    source: "Ibuprofen", target: "Lisinopril", severity: "moderate",
    description: "NSAIDs antagonise the effects of ACE inhibitors and risk renal impairment.",
    aiExplanation: "Regular NSAID use alongside Lisinopril can blunt antihypertensive action and cause a measurable decline in glomerular filtration rate. Chronic use combination should be avoided."
  },
  {
    source: "Amiodarone", target: "Metformin", severity: "moderate",
    description: "Amiodarone has been associated with hyperglycaemia, counteracting Metformin.",
    aiExplanation: "Amiodarone can impair glucose metabolism and increase blood sugar. This pharmacodynamic antagonism can reduce Metformin's effectiveness in controlling diabetes."
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
