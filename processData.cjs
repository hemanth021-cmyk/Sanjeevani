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

    return {
        id: `P-${d.internal_id}`,
        name: d.name ? d.name.replace('_', ' ') : `Unknown-${d.internal_id}`,
        age: parseInt(d.age) || 50,
        encryptedActivePrescriptions: prescriptionsMap[ghost] ? [...prescriptionsMap[ghost]] : [],
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

// Distribute risks randomly across the ENTIRE dataset of 1000 patients
for (let i = 0; i < generatedData.length; i++) {
    const p = generatedData[i];
    // 35% of all patients get a conflict 
    if (Math.random() < 0.35) {
        const pairs = [
            ["Aspirin", "Warfarin", "Metformin"],
            ["Lisinopril", "Potassium"],
            ["Simvastatin", "Amiodarone", "Aspirin"],
            ["Ibuprofen", "Aspirin"]
        ];
        const selected = pairs[Math.floor(Math.random() * pairs.length)];
        p.encryptedActivePrescriptions = selected.map(drug => encryptPrescription(drug, p.age));
        p.predictiveAnalytics = "Critical conflict path identified in most recent prescription payload. Immediate evaluation recommended to prevent adverse systemic reaction.";
    }
}

const fileContent = `// AUTO-GENERATED from CSV integration \nexport const GENERATED_PATIENTS = ${JSON.stringify(generatedData, null, 2)};`;

fs.writeFileSync('./src/data/generatedPatients.ts', fileContent);
console.log('Successfully generated ' + generatedData.length + ' patients into src/data/generatedPatients.ts!');
