import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { Layers, Info } from 'lucide-react';

export const ProductVisualizer: React.FC = () => {
  const { activeView, selectedNodeId, setSelectedNodeId } = useProjectStore();

  const isOuter = activeView === 'outer';
  const isInternal = activeView === 'internal';

  if (!isOuter && !isInternal) return null;

  const handleHotspotClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  // Helper to determine if a hotspot is selected
  const getHotspotStyles = (nodeId: string, type: 'fill' | 'stroke' | 'glow') => {
    const isSelected = selectedNodeId === nodeId;
    if (type === 'fill') {
      return isSelected ? 'fill-emerald-500/20' : 'fill-slate-800/10 hover:fill-slate-800/20';
    }
    if (type === 'stroke') {
      return isSelected ? 'stroke-emerald-500 stroke-[2px]' : 'stroke-slate-400 stroke-[1.2px] hover:stroke-slate-550';
    }
    return isSelected ? 'opacity-100' : 'opacity-0';
  };

  return (
    <div className="w-[380px] border-r border-slate-200 bg-slate-900 text-white flex flex-col h-full shrink-0 shadow-lg relative select-none">
      {/* Visualizer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-100">
            {isOuter ? 'Mechanical Shell View' : 'Internal Component Stackup'}
          </span>
        </div>
        <span className="text-[9px] text-slate-400 bg-slate-850 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Interactive CAD
        </span>
      </div>

      {/* Main Diagram Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
        
        {/* Outer Shell SVG */}
        {isOuter && (
          <div className="w-full flex flex-col items-center space-y-6">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
              Click a zone below to inspect casing specs
            </span>
            
            <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
              {/* Outer Ring Circle */}
              <circle 
                cx="100" 
                cy="100" 
                r="75" 
                className={`${getHotspotStyles('simple-ring', 'stroke')} ${getHotspotStyles('simple-ring', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('simple-ring')}
              >
                <title>Simple Circular Band</title>
              </circle>
              
              {/* Inner Curvature Sizing Curvature Ring */}
              <circle 
                cx="100" 
                cy="100" 
                r="64" 
                className={`${getHotspotStyles('comfort-sizing', 'stroke')} ${getHotspotStyles('comfort-sizing', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('comfort-sizing')}
              >
                <title>Comfort Sizing profile</title>
              </circle>

              {/* Touch Area Highlight on Top */}
              <path 
                d="M 65 37 A 75 75 0 0 1 135 37 L 125 50 A 64 64 0 0 0 75 50 Z" 
                className={`${getHotspotStyles('minimal-premium', 'stroke')} ${getHotspotStyles('minimal-premium', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('minimal-premium')}
              >
                <title>Stealth Touch Surface</title>
              </path>
              
              {/* LED Ring Shine Through Spot */}
              <circle 
                cx="100" 
                cy="44" 
                r="4" 
                className={`${getHotspotStyles('no-obvious-tech', 'stroke')} ${selectedNodeId === 'no-obvious-tech' ? 'fill-emerald-400 animate-pulse' : 'fill-slate-400'} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('no-obvious-tech')}
              >
                <title>Stealth LED shine-through</title>
              </circle>

              {/* Raised platform (Raised pod preview dotted overlay) */}
              <rect 
                x="60" 
                y="18" 
                width="80" 
                height="15" 
                rx="3" 
                className={`${getHotspotStyles('top-pod-ring', 'stroke')} fill-transparent stroke-dashed transition-all cursor-pointer`}
                strokeDasharray="2"
                onClick={() => handleHotspotClick('top-pod-ring')}
              >
                <title>Raised Flat Platform Concept</title>
              </rect>

              {/* Spring Fit Tension C-Cut Overlay */}
              <path
                d="M 94 175 L 106 175 L 106 161 L 94 161 Z"
                className={`${getHotspotStyles('open-ring', 'stroke')} ${getHotspotStyles('open-ring', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('open-ring')}
              >
                <title>Tension Fit Adjuster Slot</title>
              </path>

              {/* Tactile orientation notch at the bottom inside */}
              <path 
                d="M 95 163 Q 100 159 105 163" 
                className={`${getHotspotStyles('hidden-intel', 'stroke')} fill-transparent stroke-2 transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('hidden-intel')}
              >
                <title>Bottom Orientation ridge</title>
              </path>

              {/* NFC RF Window slot on the side casing */}
              <path
                d="M 27 115 A 75 75 0 0 0 35 135 L 45 130 A 64 64 0 0 1 38 112 Z"
                className={`${getHotspotStyles('nfc-window', 'stroke')} ${getHotspotStyles('nfc-window', 'fill')} fill-purple-500/20 transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('nfc-window')}
              >
                <title>NFC RF Pass-Through Window</title>
              </path>
            </svg>

            {/* Legend info panel */}
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5 text-[10px]">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Outer Assembly Checklist</span>
              <div className="flex items-center justify-between text-slate-350">
                <span>Exterior Style Strategy</span>
                <span className="font-semibold text-emerald-400">Stealth Matte</span>
              </div>
              <div className="flex items-center justify-between text-slate-350">
                <span>Main Band Diameter</span>
                <span className="font-semibold">22mm (Size 10)</span>
              </div>
              <div className="flex items-center justify-between text-slate-350">
                <span>Thickness Constraint</span>
                <span className="font-semibold">&lt; 2.2mm limit</span>
              </div>
            </div>
          </div>
        )}

        {/* Internal Cross Section SVG */}
        {isInternal && (
          <div className="w-full flex flex-col items-center space-y-6">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
              Click internal layout layer to configure
            </span>

            <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
              {/* Exterior Casing Reference Line */}
              <circle cx="100" cy="100" r="75" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3" />
              
              {/* Top electronics compartment block */}
              <path 
                d="M 62 42 A 70 70 0 0 1 138 42 L 128 58 A 54 54 0 0 0 72 58 Z" 
                className={`${getHotspotStyles('top-elec-zone', 'stroke')} ${getHotspotStyles('top-elec-zone', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('top-elec-zone')}
              >
                <title>Top Electronics Compartment</title>
              </path>

              {/* Capacitive foil sensor layout */}
              <path 
                d="M 70 30 A 74 74 0 0 1 130 30 L 126 36 A 70 70 0 0 0 74 36 Z" 
                className={`${getHotspotStyles('button-touch-zone', 'stroke')} ${getHotspotStyles('button-touch-zone', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('button-touch-zone')}
              >
                <title>Capacitive Copper Foil Layer</title>
              </path>

              {/* Microcontroller & RF PCB overlay inside the top half */}
              <path 
                d="M 75 51 A 56 56 0 0 1 125 51" 
                className={`${getHotspotStyles('pcb-zone', 'stroke')} fill-none stroke-[3px] transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('pcb-zone')}
              >
                <title>Flex FPC Board routing</title>
              </path>

              {/* Antenna Keepout Zone top corner */}
              <path 
                d="M 130 25 L 142 35 L 134 43 L 123 33 Z"
                className={`${getHotspotStyles('antenna-keepout', 'stroke')} ${getHotspotStyles('antenna-keepout', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('antenna-keepout')}
              >
                <title>Antenna Clearance zone</title>
              </path>

              {/* Coin Haptic Vibration motor on the side arc */}
              <circle 
                cx="165" 
                cy="100" 
                r="10" 
                className={`${getHotspotStyles('haptic-zone', 'stroke')} ${getHotspotStyles('haptic-zone', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('haptic-zone')}
              >
                <title>Vibration Coin Motor Location</title>
              </circle>

              {/* Curved Lipo Battery at the bottom arc */}
              <path 
                d="M 64 148 A 66 66 0 0 0 136 148 L 128 136 A 54 54 0 0 1 72 136 Z" 
                className={`${getHotspotStyles('battery-zone-later', 'stroke')} ${getHotspotStyles('battery-zone-later', 'fill')} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('battery-zone-later')}
              >
                <title>Curved Lithium Polymer battery</title>
              </path>

              {/* NFC Coil Antenna surrounding the side bottom arc */}
              <path 
                d="M 45 135 A 64 64 0 0 0 70 157" 
                className={`${getHotspotStyles('nfc-antenna', 'stroke')} fill-none stroke-[2.5px] stroke-purple-500 transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('nfc-antenna')}
              >
                <title>NFC Coil Antenna</title>
              </path>

              {/* Charging Pins Contact targets */}
              <circle 
                cx="90" 
                cy="165" 
                r="3" 
                className={`${getHotspotStyles('charging-contact-zone', 'stroke')} ${selectedNodeId === 'charging-contact-zone' ? 'fill-yellow-400' : 'fill-slate-400'} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('charging-contact-zone')}
              >
                <title>Battery charging target A</title>
              </circle>
              <circle 
                cx="110" 
                cy="165" 
                r="3" 
                className={`${getHotspotStyles('charging-contact-zone', 'stroke')} ${selectedNodeId === 'charging-contact-zone' ? 'fill-yellow-400' : 'fill-slate-400'} transition-all cursor-pointer`}
                onClick={() => handleHotspotClick('charging-contact-zone')}
              >
                <title>Battery charging target B</title>
              </circle>

              {/* Skin Comfort Ring interior protector */}
              <circle 
                cx="100" 
                cy="100" 
                r="63" 
                className={`${getHotspotStyles('skin-comfort-zone', 'stroke')} fill-none stroke-dashed transition-all cursor-pointer`}
                strokeDasharray="1.5"
                onClick={() => handleHotspotClick('skin-comfort-zone')}
              >
                <title>Skin-contact shielding layer</title>
              </circle>
            </svg>

            {/* Legend info panel */}
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5 text-[10px]">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Internal Stackup Metrics</span>
              <div className="flex items-center justify-between text-slate-350">
                <span>Flexible FPC Radius</span>
                <span className="font-semibold text-emerald-400">R 10.5mm</span>
              </div>
              <div className="flex items-center justify-between text-slate-350">
                <span>Vibration Coupling</span>
                <span className="font-semibold text-cyan-400">Direct Metal Contact</span>
              </div>
              <div className="flex items-center justify-between text-slate-350">
                <span>Battery Vault Thickness</span>
                <span className="font-semibold">0.3mm Titanium shield</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Visualizer Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center space-x-2 justify-center">
        <Info className="w-3.5 h-3.5 text-cyan-500" />
        <span>Linked with workspace state parameters</span>
      </div>
    </div>
  );
};
