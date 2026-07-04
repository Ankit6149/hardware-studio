import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { 
  Plus, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Cpu, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { exportToCSV } from '../lib/exportCsv';

export const PinMapTable: React.FC = () => {
  const {
    pinMap,
    addPinItem,
    updatePinItem,
    deletePinItem,
    generatePinMapFromBlueprint
  } = useProjectStore();

  const [filterProtocol, setFilterProtocol] = useState<string>('ALL');

  const handleAddRow = () => {
    addPinItem({
      signalName: "GPIO_SIGNAL",
      connectedBlock: "External Header",
      mcuPin: "",
      direction: "Input",
      protocol: "GPIO",
      voltage: "3.3V",
      notes: ""
    });
  };

  const handleUpdate = (id: string, key: string, val: string) => {
    updatePinItem(id, { [key]: val });
  };

  const handleDuplicate = (id: string) => {
    const target = pinMap.find(p => p.id === id);
    if (!target) return;
    addPinItem({
      signalName: `${target.signalName}_COPY`,
      connectedBlock: target.connectedBlock,
      mcuPin: "",
      direction: target.direction,
      protocol: target.protocol,
      voltage: target.voltage,
      notes: target.notes
    });
  };

  // Conflict Detection Engine
  const pinCounts: Record<string, number> = {};
  pinMap.forEach(p => {
    const pinClean = p.mcuPin.trim();
    if (pinClean) {
      pinCounts[pinClean] = (pinCounts[pinClean] || 0) + 1;
    }
  });

  const duplicatePins = Object.keys(pinCounts).filter(pin => pinCounts[pin] > 1);
  const unassignedCount = pinMap.filter(p => !p.mcuPin.trim()).length;

  const pinWarnings: string[] = [];
  if (duplicatePins.length > 0) {
    pinWarnings.push(`Duplicate pin assignment: Pins [${duplicatePins.join(', ')}] are mapped to multiple signals!`);
  }
  if (unassignedCount > 0) {
    pinWarnings.push(`Unassigned Pins: ${unassignedCount} signals are missing a physical hardware MCU pin configuration.`);
  }

  // Filtered List
  const filteredPins = pinMap.filter(p => {
    if (filterProtocol === 'ALL') return true;
    return p.protocol === filterProtocol;
  });

  const handleExportCSV = () => {
    const headers = ["Signal Name", "Connected Component", "MCU Pin", "Direction", "Protocol", "Voltage", "Notes"];
    const rows = pinMap.map(p => [
      p.signalName,
      p.connectedBlock,
      p.mcuPin,
      p.direction,
      p.protocol,
      p.voltage,
      p.notes
    ]);
    exportToCSV(`${projectNameSafe()}_pin_map.csv`, headers, rows);
  };

  const projectNameSafe = () => {
    return useProjectStore.getState().projectName.toLowerCase().replace(/\s+/g, '_');
  };

  const directions = ["Input", "Output", "Bidirectional", "Power", "Ground"];
  const protocols = ["GPIO", "I2C", "SPI", "UART", "PWM", "ADC", "Touch", "Power", "Ground"];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative p-6 space-y-6 overflow-y-auto">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Microcontroller Pin Mapping
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            Route signals from peripherals, buttons, and sensors to MCU pins. Duplicate mappings will alert pin conflict warnings.
          </p>
        </div>

        {/* Protocol filtering dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest font-mono">
            Filter Protocol:
          </span>
          <select
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
            className="bg-white border border-slate-200 rounded text-xs px-2 py-1 focus:outline-none font-mono"
          >
            <option value="ALL">ALL PROTOCOLS</option>
            {protocols.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Signals Mapped"
          value={pinMap.length}
          status="info"
          icon={<Cpu className="w-4 h-4 text-cyan-500" />}
        />
        <StatCard
          title="Pin Map Conflicts"
          value={duplicatePins.length}
          status={duplicatePins.length > 0 ? 'error' : 'success'}
          icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
        />
        <StatCard
          title="Unassigned Signals"
          value={unassignedCount}
          status={unassignedCount > 0 ? 'warning' : 'success'}
          icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Pins Table spreadsheet */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-650 uppercase tracking-wider font-mono">
            Pin Routing Schematic Table
          </span>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={generatePinMapFromBlueprint} 
              variant="outline" 
              size="xs"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Generate from Blueprint
            </Button>
            <Button 
              onClick={handleAddRow} 
              variant="primary" 
              size="xs"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Pin Allocation
            </Button>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              size="xs"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 uppercase text-[9px] tracking-wider">
                <th className="p-2.5 font-semibold pl-4">Signal Name</th>
                <th className="p-2.5 font-semibold">Connected Block</th>
                <th className="p-2.5 font-semibold w-32">MCU Pin</th>
                <th className="p-2.5 font-semibold w-32">Direction</th>
                <th className="p-2.5 font-semibold w-28">Protocol</th>
                <th className="p-2.5 font-semibold w-20">Voltage</th>
                <th className="p-2.5 font-semibold">Description Notes</th>
                <th className="p-2.5 font-semibold w-20 text-center pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredPins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    {filterProtocol === 'ALL' 
                      ? "No pins mapped. Click 'Generate from Blueprint' or add lines manually to build routing."
                      : `No pins matching protocol filter: ${filterProtocol}`}
                  </td>
                </tr>
              ) : (
                filteredPins.map((item) => {
                  const pinClean = item.mcuPin.trim();
                  const isConflict = pinClean && duplicatePins.includes(pinClean);
                  const isUnassigned = !pinClean;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-1.5 pl-4">
                        <input
                          type="text"
                          value={item.signalName}
                          onChange={(e) => handleUpdate(item.id, 'signalName', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-850 font-bold"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.connectedBlock}
                          onChange={(e) => handleUpdate(item.id, 'connectedBlock', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 font-sans"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.mcuPin}
                          onChange={(e) => handleUpdate(item.id, 'mcuPin', e.target.value)}
                          className={`w-full bg-transparent border rounded px-1.5 py-0.5 text-xs font-bold text-center uppercase focus:outline-none ${
                            isConflict 
                              ? 'border-rose-400 bg-rose-50 text-rose-700' 
                              : isUnassigned
                                ? 'border-dashed border-amber-300 bg-amber-50/30 text-amber-600'
                                : 'border-transparent hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 text-slate-800'
                          }`}
                          placeholder="e.g. GPIO_4"
                        />
                      </td>
                      <td className="p-1.5">
                        <select
                          value={item.direction}
                          onChange={(e) => handleUpdate(item.id, 'direction', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-750"
                        >
                          {directions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </td>
                      <td className="p-1.5">
                        <select
                          value={item.protocol}
                          onChange={(e) => handleUpdate(item.id, 'protocol', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-750"
                        >
                          {protocols.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                        </select>
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.voltage}
                          onChange={(e) => handleUpdate(item.id, 'voltage', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center"
                          placeholder="3.3V"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdate(item.id, 'notes', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-500 font-sans"
                          placeholder="Pin load rules or alternative function definitions..."
                        />
                      </td>
                      <td className="p-1.5 text-center pr-4 space-x-1 flex justify-center items-center">
                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                          title="Duplicate Signal"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePinItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete Signal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pin Conflicts and Alert log */}
      {pinWarnings.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pin Routing Warnings</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1 font-sans">
            {pinWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
