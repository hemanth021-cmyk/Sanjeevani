import React, { useState } from 'react';
import { Patient, DRUG_INTERACTIONS, DRUGS } from '../data/mockData';
import { encryptPrescription, decryptPrescription } from '../utils/engine';
import { Search } from 'lucide-react';

interface ValidationPanelProps {
  patient: Patient | undefined;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ patient }) => {
  const [inputRx, setInputRx] = useState('');
  const [result, setResult] = useState<any>(null); // { status: "safe" | "high", message: string }

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !inputRx) return;

    // We assume the pharmacist might enter encrypted data or plain data. 
    // Usually they'd enter encrypted data, so let's attempt to decrypt it using the patient's age.
    // To be flexible, if the decrypted string matches a known drug, we use it. If the raw input matches a known drug, we use it.
    
    let activeDrugs = patient.encryptedActivePrescriptions.map(enc => decryptPrescription(enc, patient.age));
    
    let plainInput = inputRx;
    let decryptedInput = decryptPrescription(inputRx, patient.age);

    const matchPlain = DRUGS.find(d => d.name.toLowerCase() === plainInput.toLowerCase());
    const matchDecrypted = DRUGS.find(d => d.name.toLowerCase() === decryptedInput.toLowerCase());

    const verifiedDrug = matchDecrypted ? matchDecrypted.name : (matchPlain ? matchPlain.name : null);

    if (!verifiedDrug) {
      setResult({ status: 'error', message: 'Unknown drug code. Check cipher input.' });
      return;
    }

    // Check against active drugs
    const conflicts = [];
    for (const active of activeDrugs) {
      const interaction = DRUG_INTERACTIONS.find(
        i => (i.source.toLowerCase() === active.toLowerCase() && i.target.toLowerCase() === verifiedDrug.toLowerCase()) ||
             (i.target.toLowerCase() === active.toLowerCase() && i.source.toLowerCase() === verifiedDrug.toLowerCase())
      );
      if (interaction && interaction.severity !== 'safe') {
        conflicts.push({ with: active, desc: interaction.description, severity: interaction.severity });
      }
    }

    if (conflicts.length > 0) {
      const isHigh = conflicts.some(c => c.severity === 'high');
      setResult({
        status: isHigh ? 'high' : 'moderate',
        message: `Dangerous interaction detected with ${conflicts.map(c => c.with).join(', ')}.`,
        drug: verifiedDrug,
        conflicts
      });
    } else {
      setResult({
        status: 'safe',
        message: `${verifiedDrug} is safe to prescribe for this patient.`,
        drug: verifiedDrug
      });
    }
  };

  if (!patient) {
     return (
      <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Select a patient to begin prescription validation.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="widget-header">
        <h3>Prescription Validation API</h3>
        <span className="pill safe">SYSTEM ACTIVE</span>
      </div>
      <div className="widget-body">
        <form onSubmit={handleValidate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enter Rx Code (Encrypted or Plain)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Ndenspba (matches Warfarin for Age 65)"
              value={inputRx}
              onChange={(e) => setInputRx(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ flex: '0 0 auto', width: 'auto', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={18} /> Validatate
          </button>
        </form>

        {result && (
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '8px', 
            background: 'var(--surface)',
            border: `1px solid ${result.status === 'high' ? 'var(--alert-red)' : result.status === 'safe' ? 'var(--primary)' : result.status === 'moderate' ? 'var(--alert)' : 'var(--border)'}`
          }} className={result.status === 'high' ? 'danger-glow' : ''}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '1.2rem', color: result.status === 'high' ? 'var(--alert-red)' : 'var(--primary-dark)' }}>
                {result.status.toUpperCase()}
              </strong>
              {result.drug && <span className="pill" style={{ background: 'var(--white-panel)' }}>Decrypted: {result.drug}</span>}
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-body)' }}>{result.message}</p>
            
            {result.conflicts && (
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-body)' }}>
                {result.conflicts.map((c: any, idx: number) => (
                  <li key={idx}><strong>{c.with}:</strong> {c.desc}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;
