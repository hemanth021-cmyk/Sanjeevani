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

      {/* LEFT: Narrow controls sidebar */}
      <div className="sidebar" style={{ zIndex: 10, width: '200px', minWidth: '200px' }}>
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <div className="logo-text" style={{ fontSize: '20px' }}>Sanjeevani</div>
          <div className="subtitle" style={{ marginTop: 0, letterSpacing: '1px', fontSize: '0.7rem' }}>Pharma AI Engine</div>
          
          <button 
            className="btn-primary" 
            style={{ margin: 0, padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: isListening ? 'var(--alert-red)' : 'var(--primary)', color: 'white', width: '100%', fontSize: '0.85rem' }}
            onClick={handleVoiceCommand}
          >
            <Mic size={15} /> {isListening ? 'Listening...' : 'Voice AI'}
          </button>
          <button 
            className="btn-primary" 
            style={{ margin: 0, padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: arMode ? 'var(--alert)' : 'var(--surface)', color: arMode ? 'white' : 'var(--primary)', width: '100%', fontSize: '0.85rem' }}
            onClick={() => setArMode(!arMode)}
          >
            <Video size={15} /> AR Mode
          </button>
          <button 
            className="btn-primary" 
            style={{ margin: 0, padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: 'var(--surface)', color: 'var(--primary)', width: '100%', fontSize: '0.85rem' }}
            onClick={() => setShowMission(true)}
          >
            <Globe2 size={15} /> Mission
          </button>
          <button 
            className="btn-primary" 
            style={{ 
              margin: 0, width: '100%', padding: '0.8rem 0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '0.8rem',
              boxShadow: '0 4px 15px rgba(26, 107, 66, 0.4)', border: '1px solid var(--accent-teal)'
            }}
            onClick={() => setShowAudit(true)}
          >
            <Database size={16} /> Pharmacy Audit
          </button>
        </div>

        {/* Wearables Panel for Selected Patient */}
        {selectedPatient && (
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.8rem', color: 'var(--primary-dark)', fontSize: '0.85rem' }}>
              <HeartPulse size={16} color="var(--alert-red)" /> Live Vitals
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <div className="surface-panel" style={{ textAlign: 'center', padding: '0.6rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedPatient.wearables?.heartRate || '--'} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>BPM</span></div>
                <div className="subtitle" style={{ fontSize: '0.55rem' }}>Heart Rate</div>
              </div>
              <div className="surface-panel" style={{ textAlign: 'center', padding: '0.6rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{selectedPatient.wearables?.bpSystolic}/{selectedPatient.wearables?.bpDiastolic}</div>
                <div className="subtitle" style={{ fontSize: '0.55rem' }}>Blood Pressure</div>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: selectedPatient.wearables.status === 'Critical' ? 'var(--alert-red)' : selectedPatient.wearables.status === 'Elevated' ? 'var(--alert)' : 'var(--primary)' }}>
              {selectedPatient.wearables.status}
            </div>
          </div>
        )}
      </div>

      {/* CENTER: Wide Patient List - sticky, always visible */}
      <div style={{ width: '360px', minWidth: '320px', position: 'sticky', top: '1rem', alignSelf: 'flex-start', zIndex: 10, maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}>
        <PatientList 
          selectedPatientId={selectedPatientId} 
          onSelectPatient={handlePatientSelect} 
        />
      </div>

      {/* RIGHT: Main Analytics Area */}
      <div className="main-content" style={{ zIndex: 10 }}>
        
        {/* Row 1: Conflict Graph — fixed height */}
        <div className="glass-panel" style={{ height: '340px', display: 'flex', flexDirection: 'column', background: arMode ? 'rgba(255,255,255,0.6)' : 'var(--white-panel)' }}>
          <div className="widget-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              Medication Conflict Graph
            </h3>
            {selectedPatient && <span className="pill safe" style={{ fontSize: '0.7rem' }}>{selectedPatient.name} (Age {selectedPatient.age})</span>}
          </div>
          <div className="widget-body" style={{ padding: 0, flex: 1, minHeight: 0 }}>
            <ConflictGraph 
              patient={selectedPatient} 
              onInteractionClick={(interaction) => setSelectedInteraction(interaction)} 
            />
          </div>
        </div>

        {/* Row 2: AI Risk Analysis + Validation side by side — auto height, scrollable */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <InteractionViewer interaction={selectedInteraction} patient={selectedPatient} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ValidationPanel patient={selectedPatient} />
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
