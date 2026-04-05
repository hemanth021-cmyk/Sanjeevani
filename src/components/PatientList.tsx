import React, { useState } from 'react';
import { MOCK_PATIENTS, Patient, DRUG_INTERACTIONS } from '../data/mockData';
import { Activity } from 'lucide-react';
import { decryptPrescription, calculateSafetyScore } from '../utils/engine';

interface PatientListProps {
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ selectedPatientId, onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculate score on the fly for UI
  const getScore = (patient: Patient) => {
    const decryptedRx = patient.encryptedActivePrescriptions.map(enc => decryptPrescription(enc, patient.age));
    const conflicts = [];
    for (let i = 0; i < decryptedRx.length; i++) {
        for (let j = i + 1; j < decryptedRx.length; j++) {
            const d1 = decryptedRx[i];
            const d2 = decryptedRx[j];
            const inter = DRUG_INTERACTIONS.find(l => (l.source === d1 && l.target === d2) || (l.source === d2 && l.target === d1));
            if (inter) conflicts.push(inter);
        }
    }
    return calculateSafetyScore(conflicts);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="widget-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--alert-red)" />
          High-Risk Patients List
        </h3>
        <span className="pill safe">LIVE</span>
      </div>
      
      <div style={{ padding: '0 1rem 0.5rem 1rem' }}>
        <input 
          type="search" 
          placeholder="Search patients..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--white-panel)', color: 'var(--text-body)', fontSize: '0.9rem' }}
        />
      </div>

      <div className="widget-body">
        {MOCK_PATIENTS.map(p => ({ ...p, score: getScore(p) }))
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .sort((a, b) => a.score - b.score) // Sort lowest score (highest risk) first
          .map((patient) => {
          const isSelected = patient.id === selectedPatientId;
          const score = patient.score;
          const scoreColor = score > 80 ? 'var(--primary)' : score > 50 ? 'var(--alert)' : 'var(--alert-red)';
          const riskTier = score > 80 ? 'Moderate' : score > 50 ? 'High' : 'Critical';
          const tierIcon = score > 80 ? '🟡' : score > 50 ? '🟠' : '🔴';
          
          return (
            <div 
              key={patient.id}
              className={`list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPatient(patient.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{patient.name}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface)', color: scoreColor }}>
                    {tierIcon} {riskTier} Risk
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Age: {patient.age}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, color: scoreColor }}>Risk Score: {score}</span>
                </div>
                
                {isSelected ? (
                  <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '6px', border: '1px dashed var(--alert)', marginTop: '0.5rem' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--alert)', marginBottom: '0.4rem', display: 'block' }}>Decryption Trace:</strong>
                    {patient.encryptedActivePrescriptions.map((enc, idx) => {
                      const dec = decryptPrescription(enc, patient.age);
                      const shift = patient.age % 26;
                      return (
                        <div key={idx} style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '4px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '2px' }}>
                          <code>{enc}</code> + Age {patient.age} → Shift {shift} → <strong style={{ color: 'var(--primary-dark)' }}>{dec}</strong> {'✅'}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {patient.encryptedActivePrescriptions.join(', ')}
                    </code>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientList;
