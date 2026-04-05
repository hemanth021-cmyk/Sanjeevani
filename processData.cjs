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

let patientsMap = {};

demographics.forEach(d => {
    patientsMap[d.ghost_id] = {
        id: d.ghost_id,
        name: d.name.replace('_', ' '),
        age: parseInt(d.age),
        encryptedActivePrescriptions: [],
        predictiveAnalytics: "Telemetry and recent prescriptive audits remain mostly stable, though continuous evaluation is recommended.",
        wearables: { heartRate: 75, bpSystolic: 120, bpDiastolic: 80, status: 'Normal' }
    };
});

prescriptions.forEach(p => {
    if(patientsMap[p.ghost_id] && p.scrambled_med) {
        // avoid duplicates
        if (!patientsMap[p.ghost_id].encryptedActivePrescriptions.includes(p.scrambled_med)) {
            patientsMap[p.ghost_id].encryptedActivePrescriptions.push(p.scrambled_med);
        }
    }
});

telemetry.forEach(t => {
    if(patientsMap[t.ghost_id] && t.heart_rate_hex) {
        const dec = parseInt(t.heart_rate_hex, 16);
        if(!isNaN(dec)) {
            patientsMap[t.ghost_id].wearables.heartRate = dec;
            if(dec > 100 || dec < 50) {
                patientsMap[t.ghost_id].wearables.status = 'Critical';
                patientsMap[t.ghost_id].predictiveAnalytics = "Critical telemetry detected. Immediate pharmacological review required to rule out adverse reaction cascade.";
            } else if (dec > 85) {
                patientsMap[t.ghost_id].wearables.status = 'Elevated';
                patientsMap[t.ghost_id].predictiveAnalytics = "Elevated resting heart rate indicates potential systemic strain. Continuous biochemical monitoring advised.";
            } else {
                patientsMap[t.ghost_id].wearables.status = 'Normal';
            }
            
            // Simulate linked biological BP
            patientsMap[t.ghost_id].wearables.bpSystolic = Math.floor(100 + (dec * 0.4));
            patientsMap[t.ghost_id].wearables.bpDiastolic = Math.floor(60 + (dec * 0.25));
        }
    }
});

const generatedData = Object.values(patientsMap);

const fileContent = `// AUTO-GENERATED from CSV integration
export const GENERATED_PATIENTS = ${JSON.stringify(generatedData, null, 2)};
`;

fs.writeFileSync('./src/data/generatedPatients.ts', fileContent);
console.log('Successfully generated ' + generatedData.length + ' patients into src/data/generatedPatients.ts!');
