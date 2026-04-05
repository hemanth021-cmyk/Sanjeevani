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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {interaction.severity === 'high' ? <AlertCircle size={32} color="var(--alert-red)" /> : 
                 interaction.severity === 'moderate' ? <AlertTriangle size={32} color="var(--alert)" /> : 
                 <ShieldCheck size={32} color="var(--primary)" />}
                <div>
                  <h2 style={{ marginBottom: '0.2rem' }}>{interaction.source.name || interaction.source}</h2>
                  <div style={{ color: 'var(--accent-teal)' }}>interacting with</div>
                  <h2 style={{ marginTop: '0.2rem' }}>{interaction.target.name || interaction.target}</h2>
                </div>
              </div>

              <div className="surface-panel" style={{ borderLeft: `4px solid ${interaction.severity === 'high' ? 'var(--alert-red)' : 'var(--alert)'}` }}>
                <strong style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--primary-dark)' }}>Plain-Language Explanation:</strong>
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>{interaction.aiExplanation || interaction.description}</p>
              </div>

              {/* Explainable Graph AI component */}
              <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                 <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Conflict Tracing Path:</strong>
                 <code style={{ color: 'var(--primary-dark)', fontSize: '0.9rem' }}>
                   Input → {interaction.source.name || interaction.source} ↔ {interaction.target.name || interaction.target} → Reaction
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
