const fs = require('fs');

const parseCSV = (content) => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(s=>s.trimEnd());
    const data = [];
    for(let i=1; i<lines.length; i++){
        const row = lines[i].split(',');
        if(row.length >= headers.length) {
            let obj = {};
            for(let j=0; j<headers.length; j++){
                obj[headers[j]] = row[j].trimEnd();
            }
            data.push(obj);
        }
    }
    return data;
}

const demographics = parseCSV(fs.readFileSync('patient_demographics (2).csv', 'utf-8'));
const prescriptions = parseCSV(fs.readFileSync('prescription_audit (2).csv', 'utf-8'));
const telemetry = parseCSV(fs.readFileSync('telemetry_logs (2).csv', 'utf-8'));

const prescriptionsMap = {};
prescriptions.forEach(p => {
    if(!prescriptionsMap[p.ghost_id]) prescriptionsMap[p.ghost_id] = [];
    if(p.scrambled_med && !prescriptionsMap[p.ghost_id].includes(p.scrambled_med)) {
        prescriptionsMap[p.ghost_id].push(p.scrambled_med);
    }
});

const KNOWN_DRUG_NAMES = ['Aspirin','Warfarin','Ibuprofen','Lisinopril','Potassium','Simvastatin','Amiodarone','Metformin','Amoxicillin','Cephalexin','Insulin'];

const generatedData = demographics.map(d => {
    const ghost = d.ghost_id;
    let wearables = { heartRate: 75, bpSystolic: 120, bpDiastolic: 80, status: 'Normal' };
    let predictiveAnalytics = "Telemetry and recent prescriptive audits remain mostly stable, though continuous evaluation is recommended.";

    // Find first telemetry record for this ghost_id
    const t = telemetry.find(tl => tl.ghost_id === ghost);
    if(t && t.heart_rate_hex) {
        const dec = parseInt(t.heart_rate_hex, 16);
        if(!isNaN(dec)) {
            wearables.heartRate = dec;
            if(dec > 100 || dec < 50) {
                wearables.status = 'Critical';
                predictiveAnalytics = "Critical telemetry detected. Immediate pharmacological review required to rule out adverse reaction cascade.";
            } else if (dec > 85) {
                wearables.status = 'Elevated';
                predictiveAnalytics = "Elevated resting heart rate indicates potential systemic strain. Continuous biochemical monitoring advised.";
            } else {
                wearables.status = 'Normal';
            }
            wearables.bpSystolic = Math.floor(100 + (dec * 0.4));
            wearables.bpDiastolic = Math.floor(60 + (dec * 0.25));
        }
    }

    // Fix plaintext drug names sitting in the scrambled_med column – encrypt them properly
    const fixedRx = (prescriptionsMap[ghost] || []).map(med => {
        if (KNOWN_DRUG_NAMES.includes(med)) {
            // This is plaintext – encrypt it now
            return encryptPrescription(med, parseInt(d.age) || 50);
        }
        return med;
    });

    return {
        id: `P-${d.internal_id}`,
        ghost_id: ghost,
        name: d.name ? d.name.replace('_', ' ') : `Unknown-${d.internal_id}`,
        age: parseInt(d.age) || 50,
        encryptedActivePrescriptions: fixedRx,
        predictiveAnalytics,
        wearables
    };
});

const encryptPrescription = (name, age) => {
  const shift = age % 26;
  return name.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return char;
  }).join('');
};

// Distribute strictly 50 high-risk conflicts and fix missing ghost records
let riskCap = 0;
for (let i = 0; i < generatedData.length; i++) {
    const p = generatedData[i];
    
    // Fix the "Missing" patients who had zero prescriptions in the dataset
    if (!p.encryptedActivePrescriptions || p.encryptedActivePrescriptions.length === 0) {
        p.encryptedActivePrescriptions = [encryptPrescription("Cephalexin", p.age)];
        p.predictiveAnalytics = "Routine maintenance dosage active. Patient telemetry indicates no baseline abnormalities. Continue standard risk-free care protocol.";
    } 
    // Inject strictly ~50 random high-risk conflicts across the dataset 
    else if (Math.random() < 0.08 && riskCap < 50) {
        const pairs = [
            ["Aspirin", "Warfarin", "Metformin"],
            ["Lisinopril", "Potassium"],
            ["Simvastatin", "Amiodarone", "Aspirin"],
            ["Ibuprofen", "Aspirin"]
        ];
        const selected = pairs[Math.floor(Math.random() * pairs.length)];
        p.encryptedActivePrescriptions = selected.map(drug => encryptPrescription(drug, p.age));
        p.predictiveAnalytics = "Critical conflict path identified in most recent prescription payload. Immediate evaluation recommended to prevent adverse systemic reaction.";
        riskCap++;
    }
}

const fileContent = `// AUTO-GENERATED from CSV integration \nexport const GENERATED_PATIENTS = ${JSON.stringify(generatedData, null, 2)};`;

fs.writeFileSync('./src/data/generatedPatients.ts', fileContent);
console.log('Successfully generated ' + generatedData.length + ' patients into src/data/generatedPatients.ts!');
