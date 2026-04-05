import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, BrainCircuit, Activity } from 'lucide-react';
import { Patient } from '../data/mockData';

interface InteractionViewerProps {
  interaction: any | null;
  patient: Patient | undefined;
}

const InteractionViewer: React.FC<InteractionViewerProps> = ({ interaction, patient }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      
      {/* Dynamic Interaction Panel */}
      <div className={`glass-panel ${interaction?.severity === 'high' ? 'danger-glow' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="widget-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={18} color="var(--primary)" />
            AI Risk Analysis
          </h3>
          {interaction && <span className={`pill ${interaction.severity}`}>{interaction.severity}</span>}
        </div>
        <div className="widget-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {!interaction ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-body)', height: '100%', opacity: 0.7 }}>
              Click on a conflict graph connection to generate an AI explanation.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                {interaction.severity === 'high' ? <AlertCircle size={32} color="var(--alert-red)" /> : 
                 interaction.severity === 'moderate' ? <AlertTriangle size={32} color="var(--alert)" /> : 
                 <ShieldCheck size={32} color="var(--primary)" />}
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detected Interaction</div>
                  <h2 style={{ margin: '0.2rem 0', fontSize: '1.2rem' }}>
                    <span style={{ color: 'var(--primary-dark)' }}>{interaction.source.name || interaction.source}</span>
                    <span style={{ margin: '0 8px', color: 'var(--accent-teal)' }}>↔</span>
                    <span style={{ color: 'var(--primary-dark)' }}>{interaction.target.name || interaction.target}</span>
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Severity Tier */}
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Severity Level</strong>
                  <span className={`pill ${interaction.severity}`} style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
                    {interaction.severity === 'high' ? '🔴 LETHAL / SEVERE' : interaction.severity === 'moderate' ? '🟠 MODERATE' : '🟢 MILD / SAFE'}
                  </span>
                </div>

                {/* Mechanism */}
                <div className="surface-panel" style={{ borderLeft: `4px solid ${interaction.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)'}` }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-dark)', fontSize: '0.85rem' }}>Pharmacological Mechanism:</strong>
                  <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-body)' }}>{interaction.aiExplanation || interaction.description}</p>
                </div>

                {/* Recommended Action */}
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-dark)', fontSize: '0.85rem' }}>Recommended Clinical Action:</strong>
                  <div style={{ background: interaction.severity === 'high' ? 'rgba(231,76,60,0.1)' : 'rgba(245,166,35,0.1)', padding: '0.8rem', borderRadius: '6px', border: `1px solid ${interaction.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)'}` }}>
                    <strong style={{ color: interaction.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)', fontSize: '0.95rem' }}>
                      {interaction.severity === 'high' ? '⛔ IMMEDIATE DISCONTINUATION REQUIRED.' : '⚠️ REQUIRES STRICT CLINICAL MONITORING. CONSIDER ALTERNATIVES.'}
                    </strong>
                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Override requires superior attending physician authorization signature.
                    </p>
                  </div>
                </div>

              </div>

              {/* Explainable Graph AI component */}
              <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                 <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Conflict Tracing Path:</strong>
                 <code style={{ color: 'var(--primary-dark)', fontSize: '0.85rem' }}>
                   System Input → {interaction.source.name || interaction.source} ↔ {interaction.target.name || interaction.target} → Adverse Reaction
                 </code>
              </div>
            </>
          )}

        </div>
      </div>
      
      {/* Predictive Analytics Panel */}
      <div className="glass-panel">
        <div className="widget-header">
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
             <Activity size={16} /> Predictive AI Outcome
           </h3>
        </div>
        <div className="widget-body" style={{ padding: '1rem 1.5rem' }}>
          {patient ? (
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-body)' }}>
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
