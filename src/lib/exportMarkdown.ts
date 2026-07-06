import { Project, CustomNode, BOMItem, TestStage } from '../types';
import { calculateReadinessScore } from './readinessScore';

const escapeMarkdown = (text: string | number | undefined | null): string => {
  if (text === undefined || text === null) return '';
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
};

export const exportProjectMarkdown = (project: Project) => {
  if (typeof window === 'undefined') return;

  try {
    let md = `# Hardware Studio by System Alpha — ${project.projectName} Project Report\n\n`;
    
    md += `**Generated:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    md += `**Studio Version:** V1.1 (Local-First)\n`;
    md += `**Description:** ${project.description || 'N/A'}\n\n`;
    
    // 1. READINESS REPORT
    md += `## 1. Project Readiness & Health Review\n\n`;
    const report = calculateReadinessScore(project);
    md += `### Overall Readiness Score: **${report.overallScore}/100**\n\n`;
    
    md += `#### Category Scores:\n`;
    md += `- **Product Architecture:** ${report.categories.architecture}/100\n`;
    md += `- **Mechanical Layout:** ${report.categories.mechanical}/100\n`;
    md += `- **Assembly Layout:** ${report.categories.assembly}/100\n`;
    md += `- **Board/PCB Prep:** ${report.categories.boardPrep}/100\n`;
    md += `- **Component Placement:** ${report.categories.components}/100\n`;
    md += `- **Circuit/Schematic Prep:** ${report.categories.electronics}/100\n`;
    md += `- **Nets Layout:** ${report.categories.nets}/100\n`;
    md += `- **MCU Pin Map:** ${report.categories.pinMap}/100\n`;
    md += `- **Power Budget Tree:** ${report.categories.power}/100\n`;
    md += `- **Firmware Driver Plans:** ${report.categories.firmware}/100\n`;
    md += `- **Test Protocols & QA:** ${report.categories.testing}/100\n`;
    md += `- **Manufacturing Checklist:** ${report.categories.manufacturing}/100\n`;
    md += `- **Native Export Pack:** ${report.categories.nativeExports}/100\n`;
    md += `- **Factory Files Package:** ${report.categories.factoryFiles}/100\n`;
    md += `- **Safety & Risk:** ${report.categories.safety}/100\n\n`;

    if (report.blockers.length > 0) {
      md += `#### 🔴 Critical Blockers:\n`;
      report.blockers.forEach(b => {
        md += `- ${b}\n`;
      });
      md += `\n`;
    }

    if (report.warnings.length > 0) {
      md += `#### ⚠️ Warnings:\n`;
      report.warnings.forEach(w => {
        md += `- ${w}\n`;
      });
      md += `\n`;
    }

    if (report.nextActions.length > 0) {
      md += `#### 📋 Next 5 Actions Recommended:\n`;
      report.nextActions.forEach((act, idx) => {
        md += `${idx + 1}. ${act}\n`;
      });
      md += `\n`;
    }

    // 2. BLUEPRINT VIEWS & NODES
    md += `## 2. Blueprint Architecture & Component Block Lists\n\n`;
    const getNodesInView = (view: string): CustomNode[] => {
      return project.nodes.filter(n => n.data.views && n.data.views.includes(view));
    };

    const views = [
      { id: 'master', name: 'Master Architecture Flow' },
      { id: 'outer', name: 'Outer Design & Appearance Direction' },
      { id: 'internal', name: 'Internal Layout Placement Zones' },
      { id: 'electronics', name: 'Electronics & Circuits' },
      { id: 'firmware', name: 'Firmware Behavior & States' },
      { id: 'power', name: 'Power System & Rails' },
      { id: 'system-alpha', name: 'System Alpha External Integration' }
    ];

    views.forEach(v => {
      md += `### 2.${views.indexOf(v) + 1} ${v.name} View\n\n`;
      const viewNodes = getNodesInView(v.id);
      
      if (viewNodes.length === 0) {
        md += `*No blocks configured for this view.*\n\n`;
        return;
      }
      
      viewNodes.forEach(node => {
        const d = node.data;
        if (node.type === 'boundaryNode') {
          md += `#### [Boundary Zone] ${d.name}\n`;
          md += `- **Milestone Phase:** ${d.status}\n`;
          md += `- **Scope Details:** ${d.description || 'N/A'}\n`;
          if (d.notes) md += `- **Notes:** ${d.notes}\n`;
          md += `\n`;
          return;
        }

        md += `#### Block: ${d.name}\n`;
        md += `- **Category:** ${d.category} | **Status:** ${d.status} | **Priority:** ${d.priority || 'Medium'}\n`;
        if (d.description) md += `- **Description:** ${d.description}\n`;
        if (d.purpose) md += `- **Purpose:** ${d.purpose}\n`;
        if (d.requirements) md += `- **Requirements:** ${d.requirements}\n`;
        if (d.candidateComponents) md += `- **Candidate Component:** ${d.candidateComponents}\n`;
        if (d.risks) md += `- **Risks:** ${d.risks}\n`;
        if (d.mitigation) md += `- **Mitigation:** ${d.mitigation}\n`;
        if (d.openQuestions) md += `- **Open Questions:** ${d.openQuestions}\n`;
        if (d.electricalNotes) md += `- **Electrical Notes:** ${d.electricalNotes}\n`;
        if (d.mechanicalNotes) md += `- **Mechanical Notes:** ${d.mechanicalNotes}\n`;
        if (d.firmwareNotes) md += `- **Firmware Notes:** ${d.firmwareNotes}\n`;
        if (d.notes) md += `- **General Notes:** ${d.notes}\n`;
        md += `\n`;
      });
      md += `\n`;
    });

    // 3. BILL OF MATERIALS (BOM)
    md += `## 3. Bill of Materials (BOM)\n\n`;
    const bom = project.bom || [];
    if (bom.length === 0) {
      md += `*No components listed in the BOM.*\n\n`;
    } else {
      md += `| Block Name | Candidate Component | Part Number | Stage | Qty | Voltage | Max Current | Interface | Package | Cost Est | Supplier | Status |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      let totalCost = 0;
      bom.forEach((b: BOMItem) => {
        const itemQty = Number(b.quantity) || 1;
        const itemCost = Number(b.costEstimate) || 0;
        totalCost += itemQty * itemCost;
        md += `| ${escapeMarkdown(b.blockName)} | ${escapeMarkdown(b.candidateComponent)} | ${escapeMarkdown(b.partNumber)} | ${b.stage} | ${itemQty} | ${escapeMarkdown(b.voltage)} | ${escapeMarkdown(b.currentEstimate)} | ${escapeMarkdown(b.interface)} | ${escapeMarkdown(b.packageSize)} | $${itemCost.toFixed(2)} | ${escapeMarkdown(b.supplier)} | ${b.status} |\n`;
      });
      md += `\n**Total Estimated Prototype Cost:** $${totalCost.toFixed(2)}\n\n`;
    }

    // 4. POWER BUDGET
    md += `## 4. Power Budget & Battery Life Estimation\n\n`;
    md += `**Target Battery Capacity:** ${project.batteryCapacityMah || 100} mAh\n\n`;
    const powerItems = project.powerBudget || [];
    if (powerItems.length === 0) {
      md += `*No power budget items configured.*\n\n`;
    } else {
      md += `| Block Name | Voltage | Active Current (mA) | Sleep Current (uA) | Duty Cycle (%) | Qty | Avg Current (mA) | Notes |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      
      let totalAvgCurrent = 0;
      powerItems.forEach(item => {
        const active = Number(item.activeCurrentMa) || 0;
        const sleep = Number(item.sleepCurrentUa) || 0;
        const duty = Number(item.dutyCyclePercent) || 0;
        const qty = Number(item.quantity) || 1;
        const avg = (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
        totalAvgCurrent += avg;
        md += `| ${escapeMarkdown(item.blockName)} | ${escapeMarkdown(item.voltage)} | ${active} mA | ${sleep} uA | ${duty}% | ${qty} | ${avg.toFixed(4)} mA | ${escapeMarkdown(item.notes)} |\n`;
      });

      md += `\n**Total Average Current Draw:** ${totalAvgCurrent.toFixed(4)} mA\n`;
      if (totalAvgCurrent > 0 && project.batteryCapacityMah) {
        const hours = project.batteryCapacityMah / totalAvgCurrent;
        const days = hours / 24;
        md += `**Estimated Runtime:** ${hours.toFixed(1)} hours (${days.toFixed(1)} days)\n\n`;
      } else {
        md += `**Estimated Runtime:** N/A (Calculate by inputting battery capacity and average current)\n\n`;
      }
    }

    // 5. PIN MAP
    md += `## 5. Microcontroller Pin Mapping\n\n`;
    const pinItems = project.pinMap || [];
    if (pinItems.length === 0) {
      md += `*No pin assignments mapped.*\n\n`;
    } else {
      md += `| Signal Name | Connected Block | MCU Pin | Direction | Protocol | Voltage | Notes |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      pinItems.forEach(p => {
        md += `| ${escapeMarkdown(p.signalName)} | ${escapeMarkdown(p.connectedBlock)} | **${escapeMarkdown(p.mcuPin || 'UNASSIGNED')}** | ${p.direction} | ${p.protocol} | ${escapeMarkdown(p.voltage)} | ${escapeMarkdown(p.notes)} |\n`;
      });
      md += `\n`;
    }

    // 6. FIRMWARE TASKS
    md += `## 6. Firmware Plan & State Tasks\n\n`;
    const fwTasks = project.firmwareTasks || [];
    if (fwTasks.length === 0) {
      md += `*No firmware tasks defined.*\n\n`;
    } else {
      md += `| Task Name | Type | Priority | Status | Description | Acceptance Criteria |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      fwTasks.forEach(t => {
        md += `| ${escapeMarkdown(t.name)} | ${t.type} | ${t.priority} | **${t.status}** | ${escapeMarkdown(t.description)} | ${escapeMarkdown(t.acceptanceCriteria)} |\n`;
      });
      md += `\n`;
    }

    // 7. TESTING BOARD
    md += `## 7. Stage-Based Testing & Verification Plan\n\n`;
    if (project.testing.length === 0) {
      md += `*No testing stages configured.*\n\n`;
    } else {
      project.testing.forEach((stage: TestStage) => {
        md += `### Test Stage: ${stage.name}\n`;
        md += `- **Category:** ${stage.category || 'General'}\n`;
        md += `- **Verification Status:** **${stage.status}**\n`;
        md += `- **Goal:** ${stage.goal || 'N/A'}\n`;
        md += `- **Parts Required:** ${stage.partsNeeded || 'N/A'}\n`;
        md += `- **Steps:** ${stage.steps || 'N/A'}\n`;
        md += `- **Pass Criteria:** ${stage.passCriteria || 'N/A'}\n`;
        if (stage.risks) md += `- **Risks & Mitigation:** ${stage.risks}\n`;
        if (stage.resultNotes) md += `- **Result Notes:** ${stage.resultNotes}\n`;
        if (stage.evidenceLink) md += `- **Evidence Link/Ref:** ${stage.evidenceLink}\n`;
        if (stage.notes) md += `- **Developer Notes:** ${stage.notes}\n`;
        md += `\n`;
      });
    }

    // Footer
    md += `---\n*Generated by Hardware Studio by System Alpha. Copying or redistribution is permitted.*`;

    // Trigger file download
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `${project.projectName.toLowerCase().replace(/\s+/g, '_')}_full_report.md`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export Markdown:", error);
  }
};
