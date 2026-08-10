import { ValidationTest } from '../../types';
import { calculateTestStatus } from './measurementEvaluation';

export interface ValidationReportSummary {
  projectName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  inProgressTests: number;
  notStartedTests: number;
  passRatePercent: number;
}

export function generateValidationSummary(
  projectName: string,
  tests: ValidationTest[]
): ValidationReportSummary {
  let total = 0;
  let passed = 0;
  let failed = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const test of tests) {
    total++;
    const status = calculateTestStatus(test);
    if (status === 'Passed') passed++;
    else if (status === 'Failed') failed++;
    else if (status === 'In Progress') inProgress++;
    else notStarted++;
  }

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return {
    projectName,
    totalTests: total,
    passedTests: passed,
    failedTests: failed,
    inProgressTests: inProgress,
    notStartedTests: notStarted,
    passRatePercent: passRate,
  };
}

export function exportValidationReportHtml(
  projectName: string,
  tests: ValidationTest[]
): string {
  const summary = generateValidationSummary(projectName, tests);

  let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`;
  html += `<title>Validation Executive Summary — ${projectName}</title>`;
  html += `<style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #fafbfc; color: #0f172a; padding: 32px; font-size: 12px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 800; text-transform: uppercase; }
    .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .val { font-size: 24px; font-weight: 800; color: #0284c7; }
    .lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; background: white; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; text-transform: uppercase; font-size: 9px; }
    td { border: 1px solid #e2e8f0; padding: 6px 8px; }
    .pass { color: #166534; font-weight: 700; }
    .fail { color: #991b1b; font-weight: 700; }
  </style></head><body>`;

  html += `<div class="header">`;
  html += `<div class="title">${projectName} — Hardware Validation Report</div>`;
  html += `<div class="meta">Compliance Standard: EVT / DVT / PVT | Generated: ${new Date().toLocaleString()}</div>`;
  html += `</div>`;

  html += `<div class="grid">`;
  html += `<div class="card"><div class="val">${summary.totalTests}</div><div class="lbl">Total Tests</div></div>`;
  html += `<div class="card"><div class="val" style="color:#166534">${summary.passedTests}</div><div class="lbl">Passed</div></div>`;
  html += `<div class="card"><div class="val" style="color:#991b1b">${summary.failedTests}</div><div class="lbl">Failed</div></div>`;
  html += `<div class="card"><div class="val">${summary.passRatePercent}%</div><div class="lbl">Pass Rate</div></div>`;
  html += `</div>`;

  html += `<table><thead><tr><th>Test Name</th><th>Stage</th><th>Category</th><th>Status</th><th>Telemetry Measurements</th></tr></thead><tbody>`;
  for (const test of tests) {
    const status = calculateTestStatus(test);
    const cls = status === 'Passed' ? 'pass' : status === 'Failed' ? 'fail' : '';
    html += `<tr>`;
    html += `<td><strong>${test.name}</strong></td>`;
    html += `<td>${test.stage || 'EVT'}</td>`;
    html += `<td>${test.category || 'General'}</td>`;
    html += `<td class="${cls}">${status}</td>`;
    html += `<td>${test.measurements.length} logged</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;

  html += `</body></html>`;
  return html;
}
