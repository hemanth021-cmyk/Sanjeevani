import React, { useMemo } from 'react';
import { MOCK_PATIENTS } from '../data/mockData';
import { decryptPrescription } from '../utils/engine';
import { ShieldCheck } from 'lucide-react';

const GlobalAuditTable: React.FC = () => {
  const auditRows = useMemo(() => {
    const rows: any[] = [];
    MOCK_PATIENTS.forEach(patient => {
      patient.encryptedActivePrescriptions.forEach(enc => {
        const dec = decryptPrescription(enc, patient.age);
        const shift = patient.age % 26;
        let pId = patient.id;
        if (pId.startsWith('P-')) {
            const num = parseInt(pId.replace('P-', ''), 10);
            pId = `G-${100 + num}`; // Mock matching G-100 syntax from screenshot based on internal id
        }
        rows.push({
          patientId: pId,
          encrypted: enc,
          shift: `Shift = ${shift}`,
          decrypted: dec,
          dosage: 'Standard Protocol'
        });
      });
    });
    return rows;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'max(80vh, 600px)', width: '100%', overflow: 'hidden' }}>
      <div style={{ paddingBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
          <ShieldCheck size={28} /> Global Age-Based Cipher Decryption Auditing
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
          Challenge 2: Ransomware encrypted all medications using a Caesar Cipher. This table audits the active decryption of every single prescription across all 1,000+ identities. The shift is automatically computed against the patient's individual age.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', color: 'var(--text-secondary)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}>Patient</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}>Encrypted Ciphertext</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}>Age Key (Shift)</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}>Decrypted Medication</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}>Dosage</th>
            </tr>
          </thead>
          <tbody>
            {auditRows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '1rem', color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>{row.patientId}</td>
                <td style={{ padding: '1rem', color: '#F5A623', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{row.encrypted}</td>
                <td style={{ padding: '1rem', color: 'var(--text-body)' }}>{row.shift}</td>
                <td style={{ padding: '1rem', color: '#1A6B42', fontWeight: 600 }}>{row.decrypted}</td>
                <td style={{ padding: '1rem', color: 'var(--text-body)' }}>{row.dosage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalAuditTable;
