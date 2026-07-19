'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ValidationTest } from '../../types';
import { Plus, Award, CheckSquare, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';

export const ValidationStudio: React.FC = () => {
  const store = useProjectStore();
  const {
    validationTests = [],
    requirements = [],
    addValidationTest,
    updateValidationTest,
    deleteValidationTest
  } = store;

  // Selected test
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Form State
  const [testName, setTestName] = useState('');
  const [testStage, setTestStage] = useState<ValidationTest['stage']>('EVT');
  const [testCategory, setTestCategory] = useState<ValidationTest['category']>('Electrical');
  const [selectedReqId, setSelectedReqId] = useState('');

  // Execution Step State
  const [stepInstruction, setStepInstruction] = useState('');
  const [stepExpected, setStepExpected] = useState('');

  // Measurement State
  const [measName, setMeasName] = useState('');
  const [measExpected, setMeasExpected] = useState('');
  const [measActual, setMeasActual] = useState('');

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    store.executeProjectCommand(
      'ADD_VALIDATION_TEST',
      `Add validation test: ${testName}`,
      () => addValidationTest({
        name: testName,
        stage: testStage,
        category: testCategory,
        linkedRequirementIds: selectedReqId ? [selectedReqId] : [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedNetIds: [],
        linkedFirmwareModuleIds: [],
        steps: [],
        measurements: [],
        passCriteria: [],
        status: 'Not Started',
        evidence: []
      })
    );

    setTestName('');
    setSelectedReqId('');
  };

  const handleDeleteTest = (id: string) => {
    const test = validationTests.find(t => t.id === id);
    if (!test) return;
    store.executeProjectCommand(
      'DELETE_VALIDATION_TEST',
      `Delete test case: ${test.name}`,
      () => deleteValidationTest(id)
    );
    if (selectedTestId === id) setSelectedTestId(null);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId || !stepInstruction.trim()) return;

    const test = validationTests.find(t => t.id === selectedTestId);
    if (!test) return;

    const newSteps = [
      ...test.steps,
      {
        stepNumber: test.steps.length + 1,
        instruction: stepInstruction,
        expectedResult: stepExpected,
        completed: false
      }
    ];

    store.executeProjectCommand(
      'ADD_TEST_STEP',
      `Add verification step to test: ${test.name}`,
      () => updateValidationTest(selectedTestId, { steps: newSteps })
    );

    setStepInstruction('');
    setStepExpected('');
  };

  const handleToggleStep = (testId: string, stepNumber: number) => {
    const test = validationTests.find(t => t.id === testId);
    if (!test) return;

    const newSteps = test.steps.map(s => s.stepNumber === stepNumber ? { ...s, completed: !s.completed } : s);
    
    // Automatically recalculate test status based on steps and measurements
    let newStatus: ValidationTest['status'] = test.status;
    const allDone = newSteps.every(s => s.completed);
    if (allDone) {
      newStatus = 'Passed';
    } else if (newSteps.some(s => s.completed)) {
      newStatus = 'In Progress';
    }

    store.executeProjectCommand(
      'TOGGLE_TEST_STEP',
      `Toggle step ${stepNumber} in test: ${test.name}`,
      () => updateValidationTest(testId, { steps: newSteps, status: newStatus })
    );
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId || !measName.trim() || !measExpected.trim()) return;

    const test = validationTests.find(t => t.id === selectedTestId);
    if (!test) return;

    // Simple pass/fail status checking
    const status: 'Pass' | 'Fail' | 'Untested' = measActual ? (measActual === measExpected ? 'Pass' : 'Fail') : 'Untested';

    const newMeas = [
      ...test.measurements,
      {
        id: `meas_${Date.now()}`,
        name: measName,
        expectedValue: measExpected,
        actualValue: measActual || undefined,
        status
      }
    ];

    store.executeProjectCommand(
      'ADD_TEST_MEASUREMENT',
      `Add measurement to test: ${test.name}`,
      () => updateValidationTest(selectedTestId, { measurements: newMeas })
    );

    setMeasName('');
    setMeasExpected('');
    setMeasActual('');
  };

  // Calculate stats
  const reqTotal = requirements.length;
  const reqTested = requirements.filter(r => 
    validationTests.some(t => t.linkedRequirementIds.includes(r.id) && t.status === 'Passed')
  ).length;
  const coveragePercent = reqTotal > 0 ? Math.round((reqTested / reqTotal) * 100) : 0;

  const activeTest = validationTests.find(t => t.id === selectedTestId);

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col min-h-0 overflow-hidden font-mono text-[11px] p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest">Validation Studio</h1>
          <p className="text-[10px] text-slate-400 mt-1">Plan testing stages (EVT/DVT/PVT), verify requirement coverage, and log measurement thresholds.</p>
        </div>
      </div>

      {/* Coverage Widget */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
          <Award className="w-8 h-8 text-indigo-400" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Verification Coverage</span>
            <span className="text-lg font-black text-slate-100">{coveragePercent}%</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">{reqTested} of {reqTotal} requirements verified</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-450" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Passed Test Cases</span>
            <span className="text-lg font-black text-slate-100">
              {validationTests.filter(t => t.status === 'Passed').length}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl flex items-center gap-4">
          <CheckSquare className="w-8 h-8 text-indigo-400" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Test Cases</span>
            <span className="text-lg font-black text-slate-100">{validationTests.length} Drafted</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Test Suites */}
        <div className="w-1/2 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="font-extrabold uppercase text-slate-350 tracking-wider">Test Suite Specifications</h2>
          </div>

          <form onSubmit={handleAddTest} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Test Case Name..."
                value={testName}
                onChange={e => setTestName(e.target.value)}
                className="col-span-2 bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={testStage}
                onChange={e => setTestStage(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="EVT">EVT Stage</option>
                <option value="DVT">DVT Stage</option>
                <option value="PVT">PVT Stage</option>
                <option value="Factory QA">Factory QA</option>
              </select>
              <select
                value={testCategory}
                onChange={e => setTestCategory(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Power">Power</option>
                <option value="RF">RF Path</option>
                <option value="Firmware">Firmware</option>
              </select>
            </div>

            <select
              value={selectedReqId}
              onChange={e => setSelectedReqId(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
            >
              <option value="">Link Requirement (None)...</option>
              {requirements.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 font-bold rounded text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Test Case
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {validationTests.map(test => (
              <div
                key={test.id}
                onClick={() => setSelectedTestId(test.id)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedTestId === test.id
                    ? 'bg-slate-700/60 border-indigo-500'
                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-slate-200">{test.name}</span>
                  <button onClick={() => handleDeleteTest(test.id)} className="text-slate-500 hover:text-red-400 p-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-2 text-[9px] text-slate-400 mt-1">
                  <span>Stage: {test.stage}</span>
                  <span>Category: {test.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                    test.status === 'Passed' ? 'bg-emerald-950 text-emerald-450' : test.status === 'Failed' ? 'bg-red-950 text-red-400' : 'bg-slate-900 text-slate-400'
                  }`}>{test.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Test Steps & Interactive Execution */}
        <div className="flex-1 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          <div className="border-b border-slate-700 pb-2">
            <h2 className="font-extrabold uppercase text-slate-350 tracking-wider">
              {activeTest ? `Verify: ${activeTest.name}` : 'Select a Test Case to Execute'}
            </h2>
          </div>

          {activeTest ? (
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {/* Steps List */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Procedure Steps</div>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg">
                  {activeTest.steps.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">No steps added to this test case.</div>
                  ) : (
                    activeTest.steps.map(step => (
                      <div key={step.stepNumber} className="flex items-start gap-3 p-2 bg-slate-800/50 border border-slate-700/60 rounded">
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => handleToggleStep(activeTest.id, step.stepNumber)}
                          className="mt-0.5"
                        />
                        <div className="text-left flex-1">
                          <div className="text-slate-200"><span className="font-bold">#{step.stepNumber}:</span> {step.instruction}</div>
                          <div className="text-[9px] text-slate-400 mt-1">Expected: {step.expectedResult}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddStep} className="bg-slate-800/60 p-2.5 border border-slate-700 rounded-lg space-y-2">
                  <input
                    type="text"
                    placeholder="Step instruction..."
                    value={stepInstruction}
                    onChange={e => setStepInstruction(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Expected result..."
                      value={stepExpected}
                      onChange={e => setStepExpected(e.target.value)}
                      className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                    />
                    <button type="submit" className="px-3 bg-indigo-650 hover:bg-indigo-600 rounded text-white font-bold">
                      Add Step
                    </button>
                  </div>
                </form>
              </div>

              {/* Measurements */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Tolerance Thresholds</div>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg">
                  {activeTest.measurements.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">No numeric measurements logged.</div>
                  ) : (
                    activeTest.measurements.map(meas => (
                      <div key={meas.id} className="flex items-center justify-between p-2 bg-slate-800/50 border border-slate-700/60 rounded">
                        <div className="text-left">
                          <span className="font-bold text-slate-200">{meas.name}</span>
                          <div className="text-[9px] text-slate-400 mt-0.5">Expected: {meas.expectedValue} | Actual: {meas.actualValue || 'None'}</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          meas.status === 'Pass' ? 'bg-emerald-950 text-emerald-450' : meas.status === 'Fail' ? 'bg-red-950 text-red-400' : 'bg-slate-900 text-slate-400'
                        }`}>{meas.status}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddMeasurement} className="bg-slate-800/60 p-2.5 border border-slate-700 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Measurement Name (e.g. VCC Rail)..."
                      value={measName}
                      onChange={e => setMeasName(e.target.value)}
                      className="bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Expected (e.g. 3.3V)..."
                      value={measExpected}
                      onChange={e => setMeasExpected(e.target.value)}
                      className="bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Actual measured value..."
                      value={measActual}
                      onChange={e => setMeasActual(e.target.value)}
                      className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                    />
                    <button type="submit" className="px-3 bg-emerald-650 hover:bg-emerald-600 rounded text-white font-bold">
                      Log Meas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">Please select an EVT, DVT or Factory test suite case from the left.</div>
          )}
        </div>
      </div>
    </div>
  );
};
