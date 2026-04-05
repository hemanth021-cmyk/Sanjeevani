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
    if (!patient || !inputRx) {
      setResult({ status: 'error', message: 'No patient selected. Please select a patient from the list first.' });
      return;
    }

    const shift = patient.age % 26;
    let plainInput = inputRx.trim();
    let decryptedInput = decryptPrescription(plainInput, patient.age);

    const matchDecrypted = DRUGS.find(d => d.name.toLowerCase() === decryptedInput.toLowerCase());
    const matchPlain = DRUGS.find(d => d.name.toLowerCase() === plainInput.toLowerCase());

    const verifiedDrug = matchDecrypted ? matchDecrypted.name : (matchPlain ? matchPlain.name : null);
    const wasEncrypted = !!matchDecrypted;

    if (!verifiedDrug) {
      setResult({ 
        status: 'error', 
        message: `"${plainInput}" could not be decoded to a known drug using Shift = ${shift} (Age ${patient.age}). Try a valid cipher input.`,
        input: plainInput,
        shift,
        age: patient.age
      });
      return;
    }

    // Check against active drugs
    const activeDrugs = patient.encryptedActivePrescriptions.map(enc => decryptPrescription(enc, patient.age));
    const conflicts: any[] = [];
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
        message: `Conflict detected with active prescription(s).`,
        drug: verifiedDrug,
        input: plainInput,
        shift,
        age: patient.age,
        wasEncrypted,
        conflicts
      });
    } else {
      setResult({
        status: 'safe',
        message: `No interactions found. Safe to prescribe.`,
        drug: verifiedDrug,
        input: plainInput,
        shift,
        age: patient.age,
        wasEncrypted,
        conflicts: []
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
            <Search size={18} /> Validate
          </button>
        </form>

        {result && (
          <div style={{ 
            borderRadius: '10px', 
            border: `2px solid ${result.status === 'high' ? 'var(--alert-red)' : result.status === 'safe' ? 'var(--primary)' : result.status === 'moderate' ? 'var(--alert)' : 'var(--border)'}`,
            overflow: 'hidden'
          }} className={result.status === 'high' ? 'danger-glow' : ''}>

            {/* Decryption Trace Block */}
            {result.input && (
              <div style={{ background: 'var(--bg)', padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ Decryption Result</strong>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div><span style={{ color: 'var(--text-secondary)', minWidth: '80px', display: 'inline-block' }}>Input:</span> <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>{result.input}</code></div>
                  <div><span style={{ color: 'var(--text-secondary)', minWidth: '80px', display: 'inline-block' }}>Age Used:</span> <strong>{result.age}</strong> → Shift = <strong style={{ color: 'var(--primary)' }}>{result.shift}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)', minWidth: '80px', display: 'inline-block' }}>Decoded:</span> <strong style={{ color: 'var(--primary-dark)', fontSize: '1rem' }}>{result.drug}</strong></div>
                </div>
              </div>
            )}

            {/* Status + Action Block */}
            <div style={{ padding: '1rem 1.2rem', background: 'var(--white-panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1rem', color: result.status === 'high' ? 'var(--alert-red)' : result.status === 'safe' ? 'var(--primary)' : result.status === 'moderate' ? 'var(--alert)' : 'var(--text-body)' }}>
                  {result.status === 'high' ? '⚠️ CONFLICT DETECTED' : result.status === 'moderate' ? '⚠️ MODERATE RISK' : result.status === 'safe' ? '✅ SAFE TO PRESCRIBE' : '❌ UNKNOWN DRUG CODE'}
                </strong>
              </div>
              <p style={{ margin: '0 0 0.8rem 0', color: 'var(--text-body)', fontSize: '0.9rem' }}>{result.message}</p>
              
              {result.conflicts && result.conflicts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.conflicts.map((c: any, idx: number) => (
                    <div key={idx} style={{ background: c.severity === 'high' ? 'rgba(231,76,60,0.08)' : 'rgba(245,166,35,0.08)', border: `1px solid ${c.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)'}`, borderRadius: '6px', padding: '0.7rem 1rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{result.drug} + {c.with} → <span style={{ color: c.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)', textTransform: 'uppercase' }}>{c.severity}</span></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{c.desc}</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 600, color: c.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)' }}>Action: {c.severity === 'high' ? 'Immediate review required' : 'Monitor closely'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;
