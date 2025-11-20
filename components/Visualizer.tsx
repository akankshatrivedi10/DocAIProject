import React, { useState } from 'react';
import { Wand2, Download, Share2 } from 'lucide-react';
import { Org } from '../types';
import { generateDiagramSyntax } from '../services/geminiService';

interface VisualizerProps {
  activeOrg: Org | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ activeOrg }) => {
  const [prompt, setPrompt] = useState('');
  const [diagramCode, setDiagramCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!activeOrg) return;
    setLoading(true);
    const syntax = await generateDiagramSyntax(prompt, activeOrg.metadataSummary);
    setDiagramCode(syntax);
    setLoading(false);
  };

  // Use mermaid.ink for lightweight rendering without heavy client libraries
  const getMermaidUrl = (code: string) => {
    const encoded = Buffer.from(code).toString('base64');
    return `https://mermaid.ink/img/${encoded}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Process & Data Visualizer</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Gemini Powered</span>
        </div>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the process (e.g. 'Sequence diagram for Lead conversion to Opportunity')"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !activeOrg}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <span className="animate-spin">⏳</span> : <Wand2 size={18} />}
            Generate
          </button>
        </div>
        
        {!activeOrg && (
           <p className="mt-2 text-sm text-red-500">Please select a connected org first.</p>
        )}
      </div>

      {diagramCode && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-medium text-slate-700">Generated Visualization</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Download">
                <Download size={18} />
              </button>
              <button className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Export to Confluence">
                <Share2 size={18} />
              </button>
            </div>
          </div>
          <div className="p-8 flex justify-center bg-white overflow-auto">
             <img 
               src={getMermaidUrl(diagramCode)} 
               alt="Generated Diagram" 
               className="max-w-full shadow-lg rounded"
               onError={(e) => {
                   (e.target as HTMLImageElement).style.display = 'none';
                   alert("Failed to render diagram. Syntax might be invalid.");
               }}
             />
          </div>
          <div className="p-4 bg-slate-900 text-slate-300 text-xs font-mono overflow-x-auto">
            <pre>{diagramCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Polyfill for Buffer in browser environment for simple base64
import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = window.Buffer || Buffer;

export default Visualizer;