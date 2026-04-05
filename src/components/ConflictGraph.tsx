import React, { useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Patient, DRUG_INTERACTIONS } from '../data/mockData';
import { decryptPrescription } from '../utils/engine';

interface ConflictGraphProps {
  patient: Patient | undefined;
  onInteractionClick: (interaction: any) => void;
}

const ConflictGraph: React.FC<ConflictGraphProps> = ({ patient, onInteractionClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const graphData = useMemo(() => {
    if (!patient) return { nodes: [], links: [] };

    const decryptedRx = patient.encryptedActivePrescriptions.map(enc => decryptPrescription(enc, patient.age));
    
    // We want to calculate "severity mass" for nodes so we can draw a heatmap halo
    const nodesMap: Record<string, { id: string, name: string, riskLevel: number }> = {};
    decryptedRx.forEach(name => {
      nodesMap[name] = { id: name, name, riskLevel: 0 };
    });

    const links: any[] = [];

    for (let i = 0; i < decryptedRx.length; i++) {
      for (let j = i + 1; j < decryptedRx.length; j++) {
        const d1 = decryptedRx[i];
        const d2 = decryptedRx[j];
        
        const interaction = DRUG_INTERACTIONS.find(
          l => (l.source === d1 && l.target === d2) || (l.source === d2 && l.target === d1)
        );

        if (interaction) {
          links.push({
            ...interaction
          });
          
          if (interaction.severity === 'high') {
             nodesMap[d1].riskLevel += 2;
             nodesMap[d2].riskLevel += 2;
          } else if (interaction.severity === 'moderate') {
             nodesMap[d1].riskLevel += 1;
             nodesMap[d2].riskLevel += 1;
          }
        }
      }
    }

    return { nodes: Object.values(nodesMap), links };
  }, [patient]);

  const getLinkColor = (link: any) => {
    switch (link.severity) {
      case 'high': return '#E74C3C'; // Alert Red
      case 'moderate': return '#F5A623'; // Alert Orange
      case 'safe': return '#1A6B42'; // Primary Green
      default: return '#C5DEC8';
    }
  };

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 14/globalScale;
    
    // Severity Heatmap Halo
    if (node.riskLevel > 0) {
      ctx.beginPath();
      // Animate breathing effect by varying radius slightly based on Date.now()
      const pulse = Math.sin(Date.now() / 300) * 2;
      const haloRadius = (16 + (node.riskLevel * 3)) + pulse;
      ctx.arc(node.x, node.y, haloRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.riskLevel >= 2 ? 'rgba(231, 76, 60, 0.2)' : 'rgba(245, 166, 35, 0.2)';
      ctx.fill();
    }

    // Node fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#1A6B42';
    ctx.fill();

    // Node outline
    ctx.lineWidth = 1.5 / globalScale;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Label text
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3A5E46';
    ctx.fillText(label, node.x, node.y + 16);
  };

  if (!patient) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-body)' }}>
        Select a patient to decrypt their prescriptions.
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph2D
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 400}
        graphData={graphData}
        nodeLabel={() => ""} // Custom drawing used instead
        nodeCanvasObject={drawNode}
        linkColor={getLinkColor}
        linkWidth={(link: any) => (link.severity === 'high' ? 4 : 2)}
        onLinkClick={(link) => onInteractionClick(link)}
        onNodeClick={() => {}}
        backgroundColor="rgba(0,0,0,0)"
        linkDirectionalParticles={(link: any) => (link.severity === 'high' ? 3 : 0)}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleColor={() => '#E74C3C'}
        linkDirectionalParticleSpeed={0.015}
      />
      {graphData.links.some((l: any) => l.severity === 'high') && (
        <div style={{ position: 'absolute', top: 10, right: 10 }} className="pill high animate-pulse-glow">
          Clinical Warning
        </div>
      )}
    </div>
  );
};

export default ConflictGraph;
