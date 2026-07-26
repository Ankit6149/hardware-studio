from pathlib import Path


def edit(path: str, replacements: list[tuple[str, str]]) -> None:
    file = Path(path)
    text = file.read_text()
    for old, new in replacements:
        if old in text:
            text = text.replace(old, new)
    file.write_text(text)


response_interface = """interface BridgeResponseBody {
  [key: string]: unknown;
  status?: string;
  error?: string;
  token?: string;
  available?: boolean;
  version?: string;
  valid?: boolean;
  success?: boolean;
  exitCode?: number;
  stdout?: string;
  raw?: string;
}

"""

for path in ["src/__tests__/bridgeSecurity.test.ts", "src/__tests__/bridgeWorkspaceOps.test.ts"]:
    edit(path, [
        ("import http from 'http';\n\n", "import http from 'http';\nimport type { AddressInfo } from 'node:net';\n\n" + response_interface),
        ("const addr = server.address() as any;", "const addr = server.address() as AddressInfo;"),
        ("body: any", "body: BridgeResponseBody"),
        ("body: data });", "body: { raw: data } });"),
    ])

edit("src/__tests__/bridgeSecurity.test.ts", [
    ("const approvalToken = tokenRes.body.token;\n\n    // 2. Perform upload", "const approvalToken = tokenRes.body.token;\n    expect(typeof approvalToken).toBe('string');\n    if (typeof approvalToken !== 'string') throw new Error('Approval token was not returned');\n\n    // 2. Perform upload"),
])
edit("src/__tests__/bridgeWorkspaceOps.test.ts", [
    ("const withApproval = await makeRequest('/api/workspace/overwrite', { 'X-Approval-Token': tokenRes.body.token });", "const approvalToken = tokenRes.body.token;\n    expect(typeof approvalToken).toBe('string');\n    if (typeof approvalToken !== 'string') throw new Error('Approval token was not returned');\n\n    const withApproval = await makeRequest('/api/workspace/overwrite', { 'X-Approval-Token': approvalToken });"),
])

edit("src/__tests__/localBridgeSecurity.test.ts", [
    ("import http from 'http';\n\nconst { createServer, isPathContained } = require('../../packages/local-bridge/bridgeServer');\n\n", "import http from 'http';\nimport { createServer, isPathContained } from '../../packages/local-bridge/bridgeServer';\n\n" + response_interface),
    ("const getPort = () => (server.address() as any).port;", "const getPort = () => {\n    const address = server.address();\n    if (!address || typeof address === 'string') throw new Error('Bridge server has no TCP address');\n    return address.port;\n  };"),
    ("body: any", "body: BridgeResponseBody"),
    ("body: raw });", "body: { raw } });"),
    ("const approvalToken = reqApprovalRes.body.token;\n    expect(approvalToken).toBeDefined();", "const approvalToken = reqApprovalRes.body.token;\n    expect(typeof approvalToken).toBe('string');\n    if (typeof approvalToken !== 'string') throw new Error('Approval token was not returned');"),
])

edit("src/__tests__/pcbRouting.test.ts", [
    ("import { getComponentPads } from '../components/board/boardGeometry';\n", "import { getComponentPads } from '../components/board/boardGeometry';\nimport type { BoardComponent } from '../types';\n"),
    ("describe('Slice 2 Production PCB Editor & Routing Engine', () => {\n", "describe('Slice 2 Production PCB Editor & Routing Engine', () => {\n  const requireBoardComponent = (id: string): BoardComponent => {\n    const component = (useProjectStore.getState().boardComponents || []).find(item => item.id === id);\n    expect(component).toBeDefined();\n    if (!component) throw new Error(`Board component ${id} was not created`);\n    return component;\n  };\n\n"),
    ("useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_u1')!", "requireBoardComponent('comp_u1')"),
    ("useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_u2')!", "requireBoardComponent('comp_u2')"),
    ("useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_c1')!", "requireBoardComponent('comp_c1')"),
    ("useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_c2')!", "requireBoardComponent('comp_c2')"),
])

edit("src/components/ProjectManager.tsx", [
    ("res.issues.map(i => (i as any).message || String(i)).join(', ')", "res.issues.map(issue => typeof issue === 'object' && issue !== null && 'message' in issue ? String(issue.message) : String(issue)).join(', ')")
])

edit("src/components/firmware/FirmwareCodePreview.tsx", [
    ("""  // Initialize workspace if empty
  useEffect(() => {
    if (sourceFiles.length === 0) {
      const initialFiles = generateFirmwareWorkspace(store);
      store.updateProjectState({ firmwareSourceFiles: initialFiles });
      if (initialFiles.length > 0) {
        setSelectedFileId(initialFiles[0].id);
        setEditingContent(initialFiles[0].content);
      }
    } else if (!selectedFileId && sourceFiles.length > 0) {
      setSelectedFileId(sourceFiles[0].id);
      setEditingContent(sourceFiles[0].content);
    }
  }, [sourceFiles.length]);

  const activeFile = sourceFiles.find(f => f.id === selectedFileId);
""", """  // Initialize only the external project workspace. Selection is derived below.
  useEffect(() => {
    if (sourceFiles.length === 0) {
      store.updateProjectState({ firmwareSourceFiles: generateFirmwareWorkspace(store) });
    }
  }, [sourceFiles.length, store]);

  const effectiveSelectedFileId = selectedFileId ?? sourceFiles[0]?.id ?? null;
  const activeFile = sourceFiles.find(file => file.id === effectiveSelectedFileId);
  const editorContent = selectedFileId ? editingContent : (activeFile?.content ?? '');
"""),
    ("""  const handleContentChange = (val: string) => {
    setEditingContent(val);
    if (selectedFileId) {
      const updated = sourceFiles.map(f => f.id === selectedFileId ? { ...f, content: val, dirty: true } : f);
      store.updateProjectState({ firmwareSourceFiles: updated });
    }
  };
""", """  const handleContentChange = (val: string) => {
    setEditingContent(val);
    const fileId = effectiveSelectedFileId;
    if (fileId) {
      if (!selectedFileId) setSelectedFileId(fileId);
      const updated = sourceFiles.map(file => file.id === fileId ? { ...file, content: val, dirty: true } : file);
      store.updateProjectState({ firmwareSourceFiles: updated });
    }
  };
"""),
    ("""  const handleSaveFile = () => {
    if (!selectedFileId) return;
    const updated = sourceFiles.map(f => f.id === selectedFileId ? { ...f, content: editingContent, dirty: false } : f);
""", """  const handleSaveFile = () => {
    const fileId = effectiveSelectedFileId;
    if (!fileId) return;
    const updated = sourceFiles.map(file => file.id === fileId ? { ...file, content: editorContent, dirty: false } : file);
"""),
    ("const lang = ext === 'cpp' || ext === 'c' || ext === 'h' ? 'cpp' : ext === 'ini' ? 'ini' : 'text';", "const lang: FirmwareSourceFile['language'] = ext === 'cpp' || ext === 'c' || ext === 'h' ? 'cpp' : ext === 'ini' ? 'ini' : 'text';"),
    ("language: lang as any", "language: lang"),
    ("selectedFileId === file.id", "effectiveSelectedFileId === file.id"),
    ("value={editingContent}", "value={editorContent}"),
])

edit("src/components/firmware/FirmwareStateMachineCanvas.tsx", [("const onNodeDragStart = useCallback((_event: any, _node: any) => {", "const onNodeDragStart = useCallback(() => {")])
edit("src/components/product/ProductArchitectureCanvas.tsx", [("const onNodeDragStart = useCallback((_event: any, _node: any) => {", "const onNodeDragStart = useCallback(() => {")])

edit("src/components/mechanical/MechanicalInspector.tsx", [
    ("import { MechanicalObject } from '../../types';\n", "import { MechanicalObject } from '../../types';\nimport { applyLightweightConstraint } from '../../lib/mechanical/mechanicalGeometry';\n"),
    ("            const { applyLightweightConstraint } = require('../../lib/mechanical/mechanicalGeometry');\n", ""),
])

edit("src/lib/exportFirmware.ts", [
    ("import { Project } from '../types';", "import { FirmwareSourceFile, Project } from '../types';"),
    ("export function generateFirmwareWorkspace(project: Project): any[] {", "export function generateFirmwareWorkspace(project: Project): FirmwareSourceFile[] {")
])

edit("src/lib/mechanical/mechanicalGeometry.ts", [
    ("import { MechanicalObject } from '../../types';", "import { MechanicalObject, Project } from '../../types';"),
    ("export function checkMechanicalInterference(project: any): CollisionResult {", "export function checkMechanicalInterference(project: Project): CollisionResult {"),
    ("(project.mechanicalBodies || []).forEach((b: any) => {", "(project.mechanicalBodies || []).forEach((b) => {"),
    ("(project.mechanicalObjects || []).forEach((obj: any) => {", "(project.mechanicalObjects || []).forEach((obj) => {"),
    (".filter((c: any) =>", ".filter((c) =>"),
    (".forEach((c: any) => {", ".forEach((c) => {")
])

edit("src/lib/nativeExports.ts", [("activeBranch: (project as any).activeBranchName || (project as any).activeBranch || 'main',", "activeBranch: project.activeBranchName || project.activeBranch || 'main',")])
edit("src/lib/pcb/pcbRoutingEngine.ts", [("componentId: (nearestPad as any).componentId,", "componentId: nearestPad.componentId,")])

edit("src/lib/releaseEngine.ts", [
    ("sourceValue: any;\n  targetValue: any;", "sourceValue: unknown;\n  targetValue: unknown;"),
    ("const sourceProject = sourceRevision.projectSnapshot;", "const sourceProject = sourceRevision.projectSnapshot as Project | undefined;"),
    ("sourceMechs.forEach((sObj: any) => {", "sourceMechs.forEach((sObj) => {"),
    ("targetMechs.find((t: any) =>", "targetMechs.find((t) =>"),
    ("sourceComps.forEach((sComp: any) => {", "sourceComps.forEach((sComp) => {"),
    ("targetComps.find((t: any) =>", "targetComps.find((t) =>")
])

edit("src/lib/validationRunner.ts", [("let evidenceLink = options?.evidenceLink;", "const evidenceLink = options?.evidenceLink;")])

edit("src/store/projectStore.ts", [
    ("const OLD_KEY = 'hardware_studio_system_alpha_project';", "const OLD_KEY = 'hardware_studio_legacy_project';"),
    ("const linkedMechId = (currentComp as any).mechanicalObjectId || (currentComp as any).linkedMechanicalObjectId;", "const linkedMechId = currentComp.mechanicalObjectId || currentComp.linkedMechanicalObjectId;"),
    ("const id = (obj as any).id ||", "const id = obj.id ||"),
    ("const tx = (get() as any).activeTransaction;", "const tx = get().activeTransaction;")
])

edit("src/types/index.ts", [
    ("  architectureNodeId?: string;\n  bomItemId?: string;", "  architectureNodeId?: string;\n  bomItemId?: string;\n  mechanicalObjectId?: string;\n  linkedMechanicalObjectId?: string;"),
    ("evidence?: any[];\n  stepResults?: any[];", "evidence?: unknown[];\n  stepResults?: unknown[];"),
    ("export type MCPProposal = Record<string, any>;\nexport type MCPAuditRecord = Record<string, any>;", """export interface MCPProposal {
  id: string;
  proposalId?: string;
  timestamp: string;
  proposedBy?: string;
  description?: string;
  domain?: string;
  patch?: Partial<Project>;
  diffSummary?: string;
  status: 'Pending' | 'Applied' | 'Rejected';
}

export interface MCPAuditRecord {
  id: string;
  timestamp: string;
  tool: string;
  params: Record<string, unknown>;
  resultStatus: string;
  requiresApproval: boolean;
  approved: boolean;
}"""),
    ("firmwareBuildRecords?: any[];", "firmwareBuildRecords?: Record<string, unknown>[];"),
    ("mcpProposals?: any[];\n  mcpAuditRecords?: any[];", "mcpProposals?: MCPProposal[];\n  mcpAuditRecords?: MCPAuditRecord[];")
])
