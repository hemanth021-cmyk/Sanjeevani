import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, BrainCircuit, Activity, MousePointerClick } from 'lucide-react';
import { Patient, DRUG_INTERACTIONS } from '../data/mockData';
import { decryptPrescription } from '../utils/engine';

interface InteractionViewerProps {
  interaction: any | null;  // from graph click
  patient: Patient | undefined;
}

const InteractionViewer: React.FC<InteractionViewerProps> = ({ interaction, patient }) => {
  const [activeInteraction, setActiveInteraction] = useState<any | null>(null);

  // Compute all interactions for the current patient
  const patientInteractions = useMemo(() => {
    if (!patient) return [];
    const decryptedRx = patient.encryptedActivePrescriptions.map(enc =>
      decryptPrescription(enc, patient.age)
    );
    const found: any[] = [];
    for (let i = 0; i < decryptedRx.length; i++) {
      for (let j = i + 1; j < decryptedRx.length; j++) {
        const d1 = decryptedRx[i];
        const d2 = decryptedRx[j];
        const inter = DRUG_INTERACTIONS.find(
          l => (l.source === d1 && l.target === d2) || (l.source === d2 && l.target === d1)
        );
        if (inter) found.push({ ...inter, drug1: d1, drug2: d2 });
      }
    }
    // Sort: high first, then moderate, then safe
    return found.sort((a, b) => {
      const order: Record<string, number> = { high: 0, moderate: 1, safe: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });
  }, [patient]);

  // Auto-select first interaction when patient changes, or use graph click
  useEffect(() => {
    if (interaction) {
      // Graph click — normalize source/target names
      const src = typeof interaction.source === 'object' ? interaction.source.name : interaction.source;
      const tgt = typeof interaction.target === 'object' ? interaction.target.name : interaction.target;
      const matched = patientInteractions.find(
        i => (i.drug1 === src && i.drug2 === tgt) || (i.drug1 === tgt && i.drug2 === src)
      );
      setActiveInteraction(matched || patientInteractions[0] || null);
    } else {
      setActiveInteraction(patientInteractions[0] || null);
    }
  }, [interaction, patient, patientInteractions]);

  const severityColor = (s: string) => s === 'high' ? 'var(--alert-red)' : s === 'moderate' ? 'var(--alert)' : 'var(--primary)';
  const severityBg = (s: string) => s === 'high' ? 'rgba(231,76,60,0.08)' : s === 'moderate' ? 'rgba(245,166,35,0.08)' : 'rgba(26,107,66,0.06)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Interaction Cards — always visible, clickable */}
      <div className="glass-panel">
        <div className="widget-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <BrainCircuit size={17} color="var(--primary)" />
            AI Risk Analysis
          </h3>
          {patient && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
              {patientInteractions.length} interaction{patientInteractions.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        <div className="widget-body" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {!patient ? (
            <div style={{ color: 'var(--text-body)', opacity: 0.6, textAlign: 'center', padding: '1rem 0' }}>
              Select a patient to view AI risk analysis.
            </div>
          ) : patientInteractions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', padding: '0.5rem 0' }}>
              <ShieldCheck size={20} /> No drug interactions detected for this patient.
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MousePointerClick size={13} /> Click an interaction to view full AI explanation
              </div>
              {patientInteractions.map((inter, idx) => {
                const isActive = activeInteraction &&
                  inter.drug1 === activeInteraction.drug1 &&
                  inter.drug2 === activeInteraction.drug2;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveInteraction(inter)}
                    style={{
                      padding: '0.7rem 1rem',
                      borderRadius: '8px',
                      border: `2px solid ${isActive ? severityColor(inter.severity) : 'var(--border)'}`,
                      background: isActive ? severityBg(inter.severity) : 'var(--white-panel)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                    }}
                  >
                    {inter.severity === 'high'
                      ? <AlertCircle size={18} color="var(--alert-red)" />
                      : inter.severity === 'moderate'
                      ? <AlertTriangle size={18} color="var(--alert)" />
                      : <ShieldCheck size={18} color="var(--primary)" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-dark)' }}>
                        {inter.drug1} ↔ {inter.drug2}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-body)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inter.description}
                      </div>
                    </div>
                    <span className={`pill ${inter.severity}`} style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      {inter.severity === 'high' ? '🔴 HIGH' : inter.severity === 'moderate' ? '🟠 MOD' : '🟢 SAFE'}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Detail Panel — shows explanation for active interaction */}
      {activeInteraction && (
        <div className={`glass-panel ${activeInteraction.severity === 'high' ? 'danger-glow' : ''}`}>
          <div className="widget-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeInteraction.severity === 'high'
                ? <AlertCircle size={18} color="var(--alert-red)" />
                : activeInteraction.severity === 'moderate'
                ? <AlertTriangle size={18} color="var(--alert)" />
                : <ShieldCheck size={18} color="var(--primary)" />}
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                {activeInteraction.drug1} ↔ {activeInteraction.drug2}
              </span>
            </div>
            <span className={`pill ${activeInteraction.severity}`}>
              {activeInteraction.severity === 'high' ? '🔴 LETHAL / SEVERE' : activeInteraction.severity === 'moderate' ? '🟠 MODERATE' : '🟢 SAFE'}
            </span>
          </div>

          <div className="widget-body" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Mechanism */}
            <div className="surface-panel" style={{ borderLeft: `4px solid ${severityColor(activeInteraction.severity)}`, padding: '0.8rem 1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--primary-dark)', fontSize: '0.82rem' }}>
                Pharmacological Mechanism:
              </strong>
              <p style={{ margin: 0, lineHeight: '1.65', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                {activeInteraction.aiExplanation || activeInteraction.description}
              </p>
            </div>

            {/* Recommended Action */}
            <div style={{
              background: severityBg(activeInteraction.severity),
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: `1px solid ${severityColor(activeInteraction.severity)}`
            }}>
              <strong style={{ color: severityColor(activeInteraction.severity), fontSize: '0.88rem' }}>
                {activeInteraction.severity === 'high'
                  ? '⛔ IMMEDIATE DISCONTINUATION REQUIRED.'
                  : activeInteraction.severity === 'moderate'
                  ? '⚠️ STRICT CLINICAL MONITORING. CONSIDER ALTERNATIVES.'
                  : '✅ NO ACTION REQUIRED. SAFE TO CO-ADMINISTER.'}
              </strong>
              {activeInteraction.severity !== 'safe' && (
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-body)' }}>
                  Override requires superior attending physician authorization.
                </p>
              )}
            </div>

            {/* Conflict trace */}
            <div style={{ padding: '0.7rem', background: 'var(--bg)', borderRadius: '6px', border: '1px dashed var(--border)' }}>
              <strong style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.78rem', color: 'var(--primary-dark)' }}>
                Conflict Tracing Path:
              </strong>
              <code style={{ color: 'var(--primary-dark)', fontSize: '0.82rem' }}>
                Input → {activeInteraction.drug1} ↔ {activeInteraction.drug2} → Adverse Reaction
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Predictive Analytics Panel */}
      <div className="glass-panel">
        <div className="widget-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <Activity size={15} /> Predictive AI Outcome
          </h3>
        </div>
        <div className="widget-body" style={{ padding: '1rem 1.5rem' }}>
          {patient ? (
            <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-body)' }}>
              {patient.predictiveAnalytics}
            </p>
          ) : (
            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>No patient data loaded.</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default InteractionViewer;
