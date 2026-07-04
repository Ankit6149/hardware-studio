import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { BOMItem } from '../types';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { 
  Plus, 
  Trash2, 
  HelpCircle, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  Globe, 
  Coins 
} from 'lucide-react';
import { exportToCSV } from '../lib/exportCsv';

export const BOMTable: React.FC = () => {
  const { 
    bom, 
    addBOMItem, 
    updateBOMItem, 
    deleteBOMItem,
    generateBOMFromMVP 
  } = useProjectStore();

  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');

  const handleAddField = (id: string, key: keyof BOMItem, value: string | number) => {
    let parsedValue = value;
    if (key === 'quantity') {
      parsedValue = value === '' ? 1 : Number(value);
    }
    updateBOMItem(id, { [key]: parsedValue });
  };

  const handleAddRow = () => {
    addBOMItem({
      blockName: "New Component",
      candidateComponent: "",
      partNumber: "",
      stage: "Prototype",
      quantity: 1,
      voltage: "",
      currentEstimate: "",
      interface: "",
      packageSize: "",
      dimensions: "",
      costEstimate: "0.00",
      supplier: "",
      supplierUrl: "",
      datasheetUrl: "",
      status: "Not Started",
      risk: "",
      alternative: "",
      notes: ""
    });
  };

  // Stage filters list
  const stagesList = ["ALL", "Prototype", "EVT", "DVT", "PVT", "Production", "Future"];

  // Filtered BOM
  const filteredBOM = bom.filter(item => {
    if (activeStageFilter === 'ALL') return true;
    return item.stage === activeStageFilter;
  });

  // Calculate Metrics on filtered list
  const totalCost = filteredBOM.reduce((sum, item) => {
    const qty = Number(item.quantity) || 1;
    const cost = parseFloat(String(item.costEstimate || '0').replace(/[^\d.]/g, '')) || 0;
    return sum + (qty * cost);
  }, 0);

  const totalSourced = filteredBOM.filter(item => 
    ['Sourced', 'Ordered', 'Received', 'Tested'].includes(item.status)
  ).length;

  const handleExportCSV = () => {
    const headers = ["Component Block", "Candidate Component", "Part Number", "Stage", "Quantity", "Voltage", "Current Draw", "Interface", "Package Size", "Unit Cost", "Total Cost", "Supplier", "Supplier URL", "Datasheet URL", "Status", "Notes"];
    const rows = filteredBOM.map(item => {
      const qty = Number(item.quantity) || 1;
      const cost = parseFloat(String(item.costEstimate || '0').replace(/[^\d.]/g, '')) || 0;
      return [
        item.blockName,
        item.candidateComponent,
        item.partNumber || '',
        item.stage,
        qty,
        item.voltage || '',
        item.currentEstimate || '',
        item.interface || '',
        item.packageSize || '',
        cost.toFixed(2),
        (qty * cost).toFixed(2),
        item.supplier || '',
        item.supplierUrl || '',
        item.datasheetUrl || '',
        item.status,
        item.notes || ''
      ];
    });
    exportToCSV(`${projectNameSafe()}_bom.csv`, headers, rows);
  };


  const projectNameSafe = () => {
    return useProjectStore.getState().projectName.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Table Header Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Bill of Materials (BOM)
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            Track component quantities, purchase links, datasheets, and unit pricing. Auto-generate from architecture nodes or import CSVs.
          </p>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button 
            onClick={generateBOMFromMVP} 
            variant="outline" 
            size="xs"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync MVP Blocks
          </Button>
          <Button 
            onClick={handleAddRow} 
            variant="primary" 
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Component
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

      {/* Metrics breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="BOM Line Items"
          value={filteredBOM.length}
          status="info"
          icon={<Layers className="w-4 h-4 text-cyan-500" />}
        />
        <StatCard
          title="Total Prototype Cost"
          value={`$${totalCost.toFixed(2)}`}
          status="success"
          icon={<Coins className="w-4 h-4 text-emerald-500" />}
        />
        <StatCard
          title="Sourced Components"
          value={`${totalSourced} / ${filteredBOM.length}`}
          status={totalSourced === filteredBOM.length && filteredBOM.length > 0 ? 'success' : 'warning'}
          icon={<FileSpreadsheet className="w-4 h-4 text-blue-500" />}
        />
        <StatCard
          title="Average Item Cost"
          value={`$${filteredBOM.length > 0 ? (totalCost / filteredBOM.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)).toFixed(2) : '0.00'}`}
          status="neutral"
          icon={<Globe className="w-4 h-4 text-slate-450" />}
        />
      </div>

      {/* Stage Filters Tabs */}
      <div className="flex border-b border-slate-200">
        {stagesList.map(stage => (
          <button
            key={stage}
            onClick={() => setActiveStageFilter(stage)}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 uppercase transition-all duration-150 ${
              activeStageFilter === stage
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {stage === 'ALL' ? 'All Stages' : stage}
          </button>
        ))}
      </div>

      {/* Excel-like compact spreadsheet */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1550px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 uppercase text-[9px] tracking-wider">
                <th className="p-2.5 font-semibold pl-4 w-[180px]">Component Name</th>
                <th className="p-2.5 font-semibold w-[180px]">Candidate Part</th>
                <th className="p-2.5 font-semibold w-[120px]">Part Number</th>
                <th className="p-2.5 font-semibold w-[110px]">Stage</th>
                <th className="p-2.5 font-semibold w-[60px] text-center">Qty</th>
                <th className="p-2.5 font-semibold w-[75px] text-center">Voltage</th>
                <th className="p-2.5 font-semibold w-[85px]">Current</th>
                <th className="p-2.5 font-semibold w-[95px]">Interface</th>
                <th className="p-2.5 font-semibold w-[110px]">Package</th>
                <th className="p-2.5 font-semibold w-[90px] text-right">Unit Cost</th>
                <th className="p-2.5 font-semibold w-[90px] text-right">Total Cost</th>
                <th className="p-2.5 font-semibold w-[110px]">Supplier</th>
                <th className="p-2.5 font-semibold w-[150px]">Purchase Link</th>
                <th className="p-2.5 font-semibold w-[150px]">Datasheet Link</th>
                <th className="p-2.5 font-semibold w-[120px] text-center">Status</th>
                <th className="p-2.5 font-semibold">Notes</th>
                <th className="p-2.5 font-semibold w-10 text-center pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredBOM.length === 0 ? (
                <tr>
                  <td colSpan={17} className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-350" />
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">No Components Configured</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                        Click &apos;Sync MVP Blocks&apos; to load nodes from your canvas flow, or add lines manually to trace components.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBOM.map((item) => {
                  const qty = Number(item.quantity) || 1;
                  const cost = parseFloat(String(item.costEstimate || '0').replace(/[^\d.]/g, '')) || 0;
                  const total = qty * cost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      
                      {/* Name */}
                      <td className="p-1.5 pl-4">
                        <input
                          type="text"
                          value={item.blockName}
                          onChange={(e) => handleAddField(item.id, 'blockName', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-850 font-bold"
                          placeholder="Microcontroller"
                        />
                      </td>

                      {/* Candidate */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.candidateComponent}
                          onChange={(e) => handleAddField(item.id, 'candidateComponent', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                          placeholder="e.g. nRF52840"
                        />
                      </td>

                      {/* Part Number */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.partNumber || ''}
                          onChange={(e) => handleAddField(item.id, 'partNumber', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                          placeholder="e.g. nRF52840-QIAA-R"
                        />
                      </td>

                      {/* Stage */}
                      <td className="p-1.5">
                        <select
                          value={item.stage}
                          onChange={(e) => handleAddField(item.id, 'stage', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 font-semibold"
                        >
                          <option value="Prototype">Prototype</option>
                          <option value="EVT">EVT</option>
                          <option value="DVT">DVT</option>
                          <option value="PVT">PVT</option>
                          <option value="Production">Production</option>
                          <option value="Future">Future</option>
                        </select>
                      </td>

                      {/* Qty */}
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleAddField(item.id, 'quantity', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center font-bold"
                          min="1"
                        />
                      </td>

                      {/* Voltage */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.voltage || ''}
                          onChange={(e) => handleAddField(item.id, 'voltage', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center"
                          placeholder="3.3V"
                        />
                      </td>

                      {/* Current Draw */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.currentEstimate || ''}
                          onChange={(e) => handleAddField(item.id, 'currentEstimate', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                          placeholder="15mA active"
                        />
                      </td>

                      {/* Interface */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.interface || ''}
                          onChange={(e) => handleAddField(item.id, 'interface', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                          placeholder="SPI / I2C"
                        />
                      </td>

                      {/* Package */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.packageSize || ''}
                          onChange={(e) => handleAddField(item.id, 'packageSize', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                          placeholder="aQFN-73"
                        />
                      </td>

                      {/* Unit Cost */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.costEstimate}
                          onChange={(e) => handleAddField(item.id, 'costEstimate', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 text-right font-bold"
                          placeholder="0.00"
                        />
                      </td>

                      {/* Total Cost */}
                      <td className="p-2.5 text-right font-bold text-slate-800 bg-slate-50/20">
                        ${total.toFixed(2)}
                      </td>

                      {/* Supplier */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.supplier || ''}
                          onChange={(e) => handleAddField(item.id, 'supplier', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
                          placeholder="Mouser"
                        />
                      </td>

                      {/* Supplier URL */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.supplierUrl || ''}
                          onChange={(e) => handleAddField(item.id, 'supplierUrl', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-350 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-blue-700 truncate"
                          placeholder="Purchase link..."
                        />
                      </td>

                      {/* Datasheet URL */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.datasheetUrl || ''}
                          onChange={(e) => handleAddField(item.id, 'datasheetUrl', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-350 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-blue-700 truncate"
                          placeholder="Datasheet link..."
                        />
                      </td>

                      {/* Status */}
                      <td className="p-1.5">
                        <select
                          value={item.status}
                          onChange={(e) => handleAddField(item.id, 'status', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 font-bold"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="Sourced">Sourced</option>
                          <option value="Ordered">Ordered</option>
                          <option value="Received">Received</option>
                          <option value="Tested">Tested</option>
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleAddField(item.id, 'notes', e.target.value)}
                          className="w-full bg-transparent border-0 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-500 font-sans"
                          placeholder="Lead times or alternate components..."
                        />
                      </td>

                      {/* Action */}
                      <td className="p-1.5 text-center pr-4">
                        <button
                          onClick={() => deleteBOMItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
      
    </div>
  );
};
