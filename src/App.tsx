import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_PATIENTS } from './data/mockData';
import PatientList from './components/PatientList';
import ConflictGraph from './components/ConflictGraph';
import InteractionViewer from './components/InteractionViewer';
import ValidationPanel from './components/ValidationPanel';
import GlobalAuditTable from './components/GlobalAuditTable';
import { Mic, Video, Globe2, Activity, HeartPulse, Database } from 'lucide-react';

function App() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<any | null>(null);
  const [arMode, setArMode] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedPatient = useMemo(() => 
    MOCK_PATIENTS.find(p => p.id === selectedPatientId), 
  [selectedPatientId]);

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id);
    setSelectedInteraction(null); // Reset interaction view on new patient
  };

  // AR Mode Camera Integration
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (arMode && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) videoRef.current.srcObject = mediaStream;
        })
        .catch(err => console.error("Camera access denied or unavailable", err));
    } else if (!arMode && videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [arMode]);

  // Voice Recognition Mock API
  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice API not supported in this browser. Try Chrome/Edge.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command Recognized:", transcript);
      
      const foundPatient = MOCK_PATIENTS.find(p => transcript.includes(p.name.toLowerCase().split(' ')[0]));
      if (foundPatient) {
        handlePatientSelect(foundPatient.id);
      } else if (transcript.includes('ar') || transcript.includes('camera')) {
        setArMode(true);
      } else if (transcript.includes('mission') || transcript.includes('rural')) {
        setShowMission(true);
      }
    };
    recognition.start();
  };

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      
      {/* AR Background Video Element */}
      {arMode && (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="ar-video-bg"
        />
      )}

      {/* Sidebar: Patients & Wearables */}
      <div className="sidebar" style={{ zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="logo-text">Sanjeevani</div>
          <div className="subtitle" style={{ marginTop: '0.4rem', letterSpacing: '1px' }}>Pharma AI Engine</div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', width: '100%' }}>
            <button 
              className="btn-primary" 
              style={{ flex: 1, margin: 0, padding: '0.5rem', display: 'flex', justifyContent: 'center', background: isListening ? 'var(--alert-red)' : 'var(--primary)', color: 'white' }}
              onClick={handleVoiceCommand}
            >
              <Mic size={18} /> {isListening ? 'Listening...' : 'Voice AI'}
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1, margin: 0, padding: '0.5rem', display: 'flex', justifyContent: 'center', background: arMode ? 'var(--alert)' : 'var(--surface)', color: arMode ? 'white' : 'var(--primary)' }}
              onClick={() => setArMode(!arMode)}
            >
              <Video size={18} /> AR Mode
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 0, padding: '0.5rem', display: 'flex', justifyContent: 'center', background: 'var(--surface)', color: 'var(--primary)' }}
              title="Social Impact Mission"
              onClick={() => setShowMission(true)}
            >
              <Globe2 size={18} />
            </button>
          </div>

          <button 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.8rem', 
              background: 'var(--primary)', 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(26, 107, 66, 0.4)',
              border: '1px solid var(--accent-teal)'
            }}
            onClick={() => setShowAudit(true)}
          >
            <Database size={20} /> View Global Pharmacy Audit
          </button>
        </div>
        
        <div style={{ flex: 2, minHeight: 0 }}>
          <PatientList 
            selectedPatientId={selectedPatientId} 
            onSelectPatient={handlePatientSelect} 
          />
        </div>

        {/* Wearables Panel for Selected Patient */}
        {selectedPatient && (
          <div className="glass-panel" style={{ flex: 1, minHeight: 0, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary-dark)' }}>
              <HeartPulse size={18} color="var(--alert-red)" /> Live Wearable Vitals
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="surface-panel" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedPatient.wearables?.heartRate || '--'} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>BPM</span></div>
                <div className="subtitle" style={{ fontSize: '0.6rem' }}>Heart Rate</div>
              </div>
              <div className="surface-panel" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedPatient.wearables?.bpSystolic}/{selectedPatient.wearables?.bpDiastolic}</div>
                <div className="subtitle" style={{ fontSize: '0.6rem' }}>Blood Pressure</div>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: selectedPatient.wearables.status === 'Critical' ? 'var(--alert-red)' : selectedPatient.wearables.status === 'Elevated' ? 'var(--alert)' : 'var(--primary)' }}>
              Telemetry: {selectedPatient.wearables.status}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ zIndex: 10 }}>
        
        {/* 2-column layout: Left = Graph + Validation stacked, Right = AI Risk Analysis */}
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* LEFT COLUMN: Conflict Graph on top, Validation Panel below */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>

            {/* Medication Conflict Graph */}
            <div className="glass-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', minHeight: 0, background: arMode ? 'rgba(255,255,255,0.6)' : 'var(--white-panel)' }}>
              <div className="widget-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Medication Conflict Graph
                </h3>
                {selectedPatient && <span className="pill safe">{selectedPatient.name} (Age {selectedPatient.age})</span>}
              </div>
              <div className="widget-body" style={{ padding: 0, flex: 1, minHeight: 0 }}>
                <ConflictGraph 
                  patient={selectedPatient} 
                  onInteractionClick={(interaction) => setSelectedInteraction(interaction)} 
                />
              </div>
            </div>

            {/* Prescription Validation Panel - below graph */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <ValidationPanel patient={selectedPatient} />
            </div>

          </div>

          {/* RIGHT COLUMN: AI Risk Analysis (full height) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <InteractionViewer interaction={selectedInteraction} patient={selectedPatient} />
          </div>

        </div>

      </div>

      {/* Social Impact Mission Modal */}
      {showMission && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ width: '600px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2>Bridging the Rural Health Gap</h2>
            <p style={{ lineHeight: '1.6' }}>
              In rural areas, pharmacists are often severely understaffed and managing chaotic environments without specialized clinical pharmacologists on duty. 
              <br/><br/>
              Our <strong>Pharmacy Interaction Engine</strong> utilizes Caesar-decrypted telemetry and predictive AI to instantly serve as a second pair of expert eyes—automatically analyzing complex chains of medications to prevent lethal complications before a prescription ever leaves the pharmacy window.
            </p>
            <button className="btn-primary" onClick={() => setShowMission(false)}>Return to Dashboard</button>
          </div>
        </div>
      )}

      {/* Lazarus Audit Modal */}
      {showAudit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{ width: '90vw', maxWidth: '1200px', height: '90vh', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--primary)', background: 'var(--bg)' }}>
            <GlobalAuditTable />
            <button className="btn-primary" style={{ alignSelf: 'flex-end', marginTop: '1rem', padding: '0.8rem 2rem' }} onClick={() => setShowAudit(false)}>Close Audit Log</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
