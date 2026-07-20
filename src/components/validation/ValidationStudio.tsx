'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ValidationTest, ValidationMeasurement, ValidationEvidence, ValidationTestStep } from '../../types';
import { evaluateValidationMeasurement, calculateTestStatus } from '../../lib/validation/measurementEvaluation';
import { calculateRequirementCoverage, CoverageEntry } from '../../lib/validation/validationCoverage';
import { Plus, Trash2, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ValidationStudioProps {
  initialMode?: string;
}

export const ValidationStudio: React.FC<ValidationStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const [mode, setMode] = useState<'tests' | 'coverage' | 'factory-qa'>(
    (initialMode === 'coverage' || initialMode === 'factory-qa') ? initialMode : 'tests'
  );
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const validationTests = store.validationTests || [];
  const requirements = store.requirements || [];

  const selectedTest = selectedTestId ? validationTests.find(t => t.id === selectedTestId) : null;

  const tabs = [
    { id: 'tests' as const, label: 'Tests' },
    { id: 'coverage' as const, label: 'Coverage' },
    { id: 'factory-qa' as const, label: 'Factory QA' },
  ];

  const handleAddTest = () => {
    store.executeProjectCommand('ADD_TEST', 'Add validation test', () =>
      store.addValidationTest({
        name: `Test ${validationTests.length + 1}`,
        stage: 'EVT', category: 'Requirement',
        linkedRequirementIds: [], linkedArchitectureNodeIds: [], linkedComponentIds: [],
        linkedNetIds: [], linkedFirmwareModuleIds: [],
        steps: [], measurements: [], passCriteria: [],
        status: 'Not Started', evidence: [],
      })
    );
  };

  const handleAddStep = () => {
    if (!selectedTest) return;
    const newStep: ValidationTestStep = {
      stepNumber: selectedTest.steps.length + 1,
      instruction: '', expectedResult: '', completed: false,
    };
    store.executeProjectCommand('ADD_STEP', 'Add test step', () =>
      store.updateValidationTest(selectedTest.id, { steps: [...selectedTest.steps, newStep] })
    );
  };

  const handleAddMeasurement = () => {
    if (!selectedTest) return;
    const newMeas: ValidationMeasurement = {
      id: `meas_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: '', type: 'Numeric', required: true, status: 'Untested',
    };
    store.executeProjectCommand('ADD_MEAS', 'Add measurement', () =>
      store.updateValidationTest(selectedTest.id, { measurements: [...selectedTest.measurements, newMeas] })
    );
  };

  const handleAddEvidence = () => {
    if (!selectedTest) return;
    const newEvidence: ValidationEvidence = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'Text', value: '', createdAt: new Date().toISOString(),
    };
    store.executeProjectCommand('ADD_EVIDENCE', 'Add evidence', () =>
      store.updateValidationTest(selectedTest.id, { evidence: [...selectedTest.evidence, newEvidence] })
    );
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Passed': case 'Pass': return <CheckCircle size={12} color="#22c55e" />;
      case 'Failed': case 'Fail': return <XCircle size={12} color="#ef4444" />;
      case 'In Progress': return <AlertCircle size={12} color="#f59e0b" />;
      default: return <HelpCircle size={12} color="#94a3b8" />;
    }
  };

  // Coverage mode
  if (mode === 'coverage') {
    const coverage = calculateRequirementCoverage(requirements, validationTests);
    const covered = coverage.filter(c => c.status === 'Covered').length;
    const total = coverage.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)}
              style={{ ...tabStyle, fontWeight: mode === t.id ? 700 : 400, borderBottom: mode === t.id ? '2px solid #3b82f6' : 'none' }}>
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>
            {covered}/{total} covered ({total > 0 ? Math.round(covered / total * 100) : 0}%)
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>Requirement</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Linked Tests</th>
                <th style={thStyle}>Passed</th>
                <th style={thStyle}>Failed</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map(c => (
                <tr key={c.requirementId}>
                  <td style={tdStyle}>{c.requirementTitle}</td>
                  <td style={tdStyle}>{c.priority}</td>
                  <td style={tdStyle}>{c.linkedTestIds.length}</td>
                  <td style={tdStyle}>{c.passedTestIds.length}</td>
                  <td style={tdStyle}>{c.failedTestIds.length}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: statusColor(c.status) }}>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Factory QA mode
  if (mode === 'factory-qa') {
    const factoryTests = validationTests.filter(t => t.stage === 'Factory QA');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)}
              style={{ ...tabStyle, fontWeight: mode === t.id ? 700 : 400, borderBottom: mode === t.id ? '2px solid #3b82f6' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Factory QA Tests</div>
            <button onClick={() => {
              store.executeProjectCommand('ADD_QA', 'Add Factory QA test', () =>
                store.addValidationTest({
                  name: `Factory QA ${factoryTests.length + 1}`, stage: 'Factory QA', category: 'Manufacturing',
                  linkedRequirementIds: [], linkedArchitectureNodeIds: [], linkedComponentIds: [],
                  linkedNetIds: [], linkedFirmwareModuleIds: [],
                  steps: [], measurements: [], passCriteria: [],
                  status: 'Not Started', evidence: [],
                })
              );
            }} style={btnStyle}><Plus size={12} /> Add Factory QA Test</button>
          </div>
          {factoryTests.map(test => {
            const calcStatus = calculateTestStatus(test);
            return (
              <div key={test.id} style={{ padding: 12, marginBottom: 8, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {statusIcon(calcStatus)}
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{test.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: statusColor(calcStatus) }}>{calcStatus}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {test.measurements.length} measurements, {test.steps.length} steps, {test.evidence.length} evidence
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Tests mode (main)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: 'white', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setMode(t.id)}
            style={{ ...tabStyle, fontWeight: mode === t.id ? 700 : 400, borderBottom: mode === t.id ? '2px solid #3b82f6' : 'none' }}>
            {t.label}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 8px' }} />
        <button onClick={handleAddTest} style={btnStyle}><Plus size={12} /> Add Test</button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Test list */}
        <div style={{ width: 280, borderRight: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, background: '#fafbfc', padding: 8 }}>
          {validationTests.map(test => {
            const calcStatus = calculateTestStatus(test);
            return (
              <div key={test.id} onClick={() => setSelectedTestId(test.id)}
                style={{
                  padding: '8px 10px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
                  background: test.id === selectedTestId ? '#e0e7ff' : 'white', border: '1px solid #e2e8f0',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {statusIcon(calcStatus)}
                  <span style={{ fontWeight: 600, fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{test.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 9, padding: '1px 4px', background: '#f1f5f9', borderRadius: 3, color: '#64748b' }}>{test.stage}</span>
                  <span style={{ fontSize: 9, padding: '1px 4px', background: '#f1f5f9', borderRadius: 3, color: '#64748b' }}>{test.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test detail */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {selectedTest ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <input value={selectedTest.name} onChange={e => store.updateValidationTest(selectedTest.id, { name: e.target.value })}
                    style={{ fontWeight: 700, fontSize: 16, border: 'none', outline: 'none', color: '#1e293b', width: 300 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <select value={selectedTest.stage} onChange={e => store.executeProjectCommand('UPDATE_STAGE', 'Change stage', () =>
                      store.updateValidationTest(selectedTest.id, { stage: e.target.value as ValidationTest['stage'] })
                    )} style={selectSmall}>
                      {['EVT', 'DVT', 'PVT', 'Factory QA'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={selectedTest.category} onChange={e => store.updateValidationTest(selectedTest.id, { category: e.target.value as ValidationTest['category'] })}
                      style={selectSmall}>
                      {['Requirement', 'Mechanical', 'Electrical', 'Power', 'RF', 'Firmware', 'Thermal', 'Environmental', 'Manufacturing'].map(c =>
                        <option key={c} value={c}>{c}</option>
                      )}
                    </select>
                    <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(calculateTestStatus(selectedTest)) }}>
                      {calculateTestStatus(selectedTest)}
                    </span>
                  </div>
                </div>
                <button onClick={() => { store.executeProjectCommand('DEL_TEST', 'Delete test', () => store.deleteValidationTest(selectedTest.id)); setSelectedTestId(null); }}
                  style={{ ...btnStyle, color: '#ef4444' }}><Trash2 size={12} /> Delete</button>
              </div>

              {/* Steps */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Steps ({selectedTest.steps.length})</div>
                  <button onClick={handleAddStep} style={btnStyle}><Plus size={10} /> Step</button>
                </div>
                {selectedTest.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                    <input type="checkbox" checked={step.completed} onChange={e => {
                      const updated = [...selectedTest.steps];
                      updated[i] = { ...step, completed: e.target.checked };
                      store.executeProjectCommand('TOGGLE_STEP', 'Toggle step', () =>
                        store.updateValidationTest(selectedTest.id, { steps: updated })
                      );
                    }} style={{ marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <input placeholder="Instruction" value={step.instruction} onChange={e => {
                        const updated = [...selectedTest.steps];
                        updated[i] = { ...step, instruction: e.target.value };
                        store.updateValidationTest(selectedTest.id, { steps: updated });
                      }} style={{ width: '100%', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 6px', marginBottom: 2 }} />
                      <input placeholder="Expected result" value={step.expectedResult} onChange={e => {
                        const updated = [...selectedTest.steps];
                        updated[i] = { ...step, expectedResult: e.target.value };
                        store.updateValidationTest(selectedTest.id, { steps: updated });
                      }} style={{ width: '100%', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 6px', color: '#64748b' }} />
                    </div>
                    <button onClick={() => {
                      const updated = selectedTest.steps.filter((_, j) => j !== i);
                      store.updateValidationTest(selectedTest.id, { steps: updated });
                    }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>

              {/* Measurements */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Measurements ({selectedTest.measurements.length})</div>
                  <button onClick={handleAddMeasurement} style={btnStyle}><Plus size={10} /> Measurement</button>
                </div>
                {selectedTest.measurements.map((meas, i) => {
                  const evalStatus = evaluateValidationMeasurement(meas);
                  return (
                    <div key={meas.id} style={{ padding: 8, marginBottom: 6, background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        <input placeholder="Measurement name" value={meas.name} onChange={e => {
                          const updated = [...selectedTest.measurements];
                          updated[i] = { ...meas, name: e.target.value };
                          store.updateValidationTest(selectedTest.id, { measurements: updated });
                        }} style={{ flex: 1, fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 6px' }} />
                        <select value={meas.type} onChange={e => {
                          const updated = [...selectedTest.measurements];
                          updated[i] = { ...meas, type: e.target.value as ValidationMeasurement['type'] };
                          store.updateValidationTest(selectedTest.id, { measurements: updated });
                        }} style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 4px' }}>
                          {['Numeric', 'Boolean', 'Text', 'Visual Inspection'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {statusIcon(evalStatus)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                        {meas.type === 'Numeric' && (
                          <>
                            <div>
                              <div style={{ fontSize: 9, color: '#64748b' }}>Expected</div>
                              <input type="number" value={meas.expectedValue as number ?? ''} onChange={e => {
                                const updated = [...selectedTest.measurements];
                                updated[i] = { ...meas, expectedValue: e.target.value ? parseFloat(e.target.value) : undefined };
                                store.updateValidationTest(selectedTest.id, { measurements: updated });
                              }} style={measInput} />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: '#64748b' }}>Tol +</div>
                              <input type="number" value={meas.tolerancePlus ?? ''} onChange={e => {
                                const updated = [...selectedTest.measurements];
                                updated[i] = { ...meas, tolerancePlus: e.target.value ? parseFloat(e.target.value) : undefined };
                                store.updateValidationTest(selectedTest.id, { measurements: updated });
                              }} style={measInput} />
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: '#64748b' }}>Tol -</div>
                              <input type="number" value={meas.toleranceMinus ?? ''} onChange={e => {
                                const updated = [...selectedTest.measurements];
                                updated[i] = { ...meas, toleranceMinus: e.target.value ? parseFloat(e.target.value) : undefined };
                                store.updateValidationTest(selectedTest.id, { measurements: updated });
                              }} style={measInput} />
                            </div>
                          </>
                        )}
                        {meas.type === 'Boolean' && (
                          <div>
                            <div style={{ fontSize: 9, color: '#64748b' }}>Expected</div>
                            <select value={String(meas.expectedValue ?? '')} onChange={e => {
                              const updated = [...selectedTest.measurements];
                              updated[i] = { ...meas, expectedValue: e.target.value === 'true' };
                              store.updateValidationTest(selectedTest.id, { measurements: updated });
                            }} style={measInput}>
                              <option value="">—</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          </div>
                        )}
                        {meas.type === 'Text' && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: 9, color: '#64748b' }}>Expected</div>
                            <input value={String(meas.expectedValue ?? '')} onChange={e => {
                              const updated = [...selectedTest.measurements];
                              updated[i] = { ...meas, expectedValue: e.target.value };
                              store.updateValidationTest(selectedTest.id, { measurements: updated });
                            }} style={measInput} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: '#64748b' }}>Actual Value</div>
                          {meas.type === 'Boolean' ? (
                            <select value={String(meas.actualValue ?? '')} onChange={e => {
                              const updated = [...selectedTest.measurements];
                              updated[i] = { ...meas, actualValue: e.target.value === 'true' };
                              store.updateValidationTest(selectedTest.id, { measurements: updated });
                            }} style={measInput}>
                              <option value="">—</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input value={meas.actualValue != null ? String(meas.actualValue) : ''} onChange={e => {
                              const updated = [...selectedTest.measurements];
                              const val = meas.type === 'Numeric' ? (e.target.value ? parseFloat(e.target.value) : undefined) : e.target.value;
                              updated[i] = { ...meas, actualValue: val };
                              store.updateValidationTest(selectedTest.id, { measurements: updated });
                            }} style={measInput} />
                          )}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: statusColor(evalStatus), minWidth: 50, textAlign: 'right' }}>
                          {evalStatus}
                        </div>
                        <label style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <input type="checkbox" checked={meas.required} onChange={e => {
                            const updated = [...selectedTest.measurements];
                            updated[i] = { ...meas, required: e.target.checked };
                            store.updateValidationTest(selectedTest.id, { measurements: updated });
                          }} />
                          Req
                        </label>
                        <button onClick={() => {
                          const updated = selectedTest.measurements.filter(m => m.id !== meas.id);
                          store.updateValidationTest(selectedTest.id, { measurements: updated });
                        }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={10} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Evidence */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Evidence ({selectedTest.evidence.length})</div>
                  <button onClick={handleAddEvidence} style={btnStyle}><Plus size={10} /> Evidence</button>
                </div>
                {selectedTest.evidence.map((ev, i) => (
                  <div key={ev.id} style={{ display: 'flex', gap: 4, padding: '4px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                    <select value={ev.type} onChange={e => {
                      const updated = [...selectedTest.evidence];
                      updated[i] = { ...ev, type: e.target.value as ValidationEvidence['type'] };
                      store.updateValidationTest(selectedTest.id, { evidence: updated });
                    }} style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 4px' }}>
                      {['Text', 'URL', 'Measurement', 'Photo Reference', 'File Reference'].map(t =>
                        <option key={t} value={t}>{t}</option>
                      )}
                    </select>
                    <input placeholder="Value / description" value={ev.value} onChange={e => {
                      const updated = [...selectedTest.evidence];
                      updated[i] = { ...ev, value: e.target.value };
                      store.updateValidationTest(selectedTest.id, { evidence: updated });
                    }} style={{ flex: 1, fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 6px' }} />
                    <button onClick={() => {
                      const updated = selectedTest.evidence.filter(e => e.id !== ev.id);
                      store.updateValidationTest(selectedTest.id, { evidence: updated });
                    }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={10} /></button>
                  </div>
                ))}
              </div>

              {/* Pass Criteria */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Pass Criteria</div>
                <textarea value={selectedTest.passCriteria.join('\n')} onChange={e =>
                  store.updateValidationTest(selectedTest.id, { passCriteria: e.target.value.split('\n').filter(c => c.trim()) })
                } placeholder="One criterion per line"
                  style={{ width: '100%', minHeight: 60, fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 4, padding: '6px 8px', resize: 'vertical' }} />
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 40 }}>Select a test to view details</div>
          )}
        </div>
      </div>
    </div>
  );
};

function statusColor(status: string): string {
  switch (status) {
    case 'Passed': case 'Pass': case 'Covered': return '#22c55e';
    case 'Failed': case 'Fail': return '#ef4444';
    case 'In Progress': case 'Partially Covered': return '#f59e0b';
    case 'Needs Review': return '#8b5cf6';
    default: return '#94a3b8';
  }
}

const tabStyle: React.CSSProperties = { background: 'none', border: 'none', padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: '#475569' };
const btnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', color: '#475569', fontSize: 11 };
const selectSmall: React.CSSProperties = { padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 };
const thStyle: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#64748b', borderBottom: '2px solid #e2e8f0' };
const tdStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 12 };
const measInput: React.CSSProperties = { width: '100%', padding: '3px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 };
