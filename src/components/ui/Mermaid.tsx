import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#f43f5e',
    primaryTextColor: '#fff',
    primaryBorderColor: '#f43f5e',
    lineColor: '#fda4af',
    secondaryColor: '#38bdf8',
    tertiaryColor: '#1e293b',
  },
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid flex justify-center w-full overflow-x-auto p-4 bg-white/5 rounded-3xl" ref={ref}>
      {chart}
    </div>
  );
};

export default Mermaid;
