import React from 'react';
import type {
  BlueprintDrawing,
  BlueprintDrawingConnection,
  BlueprintDrawingObject,
} from '../../lib/blueprintSheetTypes';

interface BlueprintDrawingRendererProps {
  drawing: BlueprintDrawing;
  className?: string;
}

type Point = { x: number; y: number };
type SymbolKind = 'power' | 'controller' | 'sensor' | 'wireless' | 'cloud' | 'actuator' | 'mechanical' | 'board' | 'component' | 'zone' | 'state' | 'document' | 'warning' | 'annotation' | 'module';

const connectionColors: Record<NonNullable<BlueprintDrawingConnection['type']>, string> = {
  signal: '#334155',
  power: '#b91c1c',
  ground: '#047857',
  mechanical: '#92400e',
  assembly: '#6d28d9',
  firmware: '#0369a1',
  test: '#a16207',
};

const connectionDash: Partial<Record<NonNullable<BlueprintDrawingConnection['type']>, string>> = {
  ground: '8 4',
  mechanical: '3 3',
  test: '10 4 2 4',
};

export function createEngineeringLayout(drawing: BlueprintDrawing): BlueprintDrawing {
  const nodes = drawing.objects.filter(object => object.type === 'block' && object.sourceType === 'node');
  if (nodes.length < 3) return drawing;

  const ids = new Set(nodes.map(node => node.id));
  const edges = drawing.connections.filter(edge => ids.has(edge.sourceId) && ids.has(edge.targetId));
  if (edges.length === 0) return drawing;

  const incoming = new Map(nodes.map(node => [node.id, 0]));
  const outgoing = new Map(nodes.map(node => [node.id, [] as string[]]));
  edges.forEach(edge => {
    incoming.set(edge.targetId, (incoming.get(edge.targetId) || 0) + 1);
    outgoing.get(edge.sourceId)?.push(edge.targetId);
  });

  const levels = new Map<string, number>();
  const queue = nodes.filter(node => (incoming.get(node.id) || 0) === 0).map(node => node.id);
  if (queue.length === 0) queue.push(nodes[0].id);

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) continue;
    const level = levels.get(id) || 0;
    for (const targetId of outgoing.get(id) || []) {
      levels.set(targetId, Math.max(levels.get(targetId) || 0, level + 1));
      const next = Math.max(0, (incoming.get(targetId) || 0) - 1);
      incoming.set(targetId, next);
      if (next === 0) queue.push(targetId);
    }
  }

  nodes.forEach(node => {
    if (!levels.has(node.id)) levels.set(node.id, 0);
  });

  const groups = new Map<number, BlueprintDrawingObject[]>();
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    groups.set(level, [...(groups.get(level) || []), node]);
  });

  const maxLevel = Math.max(...groups.keys());
  const maxRows = Math.max(...Array.from(groups.values()).map(group => group.length));
  const width = Math.max(960, 145 + (maxLevel + 1) * 225);
  const height = Math.max(560, 150 + maxRows * 106);
  const replacements = new Map<string, BlueprintDrawingObject>();

  Array.from(groups.entries()).sort(([a], [b]) => a - b).forEach(([level, group]) => {
    const gap = (height - 150) / group.length;
    group.forEach((node, row) => {
      replacements.set(node.id, {
        ...node,
        x: 65 + level * 225,
        y: 62 + row * gap + Math.max(0, (gap - 76) / 2),
        width: 176,
        height: 76,
      });
    });
  });

  return {
    ...drawing,
    viewBox: `0 0 ${width} ${height}`,
    objects: drawing.objects.map(object => replacements.get(object.id) || object),
  };
}

function meta(object: BlueprintDrawingObject, key: string): string {
  const value = object.metadata?.[key];
  return value == null ? '' : String(value);
}

function classify(object: BlueprintDrawingObject): SymbolKind {
  if (object.type === 'board') return 'board';
  if (object.type === 'component' || object.type === 'schematic-symbol' || object.type === 'pin' || object.type === 'trace' || object.type === 'via') return 'component';
  if (object.type === 'zone') return 'zone';
  if (object.type === 'state') return 'state';
  if (object.type === 'factory-file') return 'document';
  if (object.type === 'warning') return 'warning';
  if (object.type === 'annotation') return 'annotation';

  const text = [object.label, object.sourceType || '', meta(object, 'category'), meta(object, 'description')].join(' ').toLowerCase();
  if (/battery|power|charger|regulator|supply|voltage/.test(text)) return 'power';
  if (/firmware|controller|processor|mcu|microcontroller|logic|compute/.test(text)) return 'controller';
  if (/sensor|touch|button|input|gesture|microphone|imu/.test(text)) return 'sensor';
  if (/wireless|bluetooth|ble|wifi|antenna|radio|nfc|rf\b/.test(text)) return 'wireless';
  if (/cloud|external|mobile|phone|desktop|api|host|app|software/.test(text)) return 'cloud';
  if (/haptic|motor|actuator|feedback|speaker|buzzer|led|display|output/.test(text)) return 'actuator';
  if (/mechanical|enclosure|housing|ring|shell|body|frame/.test(text)) return 'mechanical';
  return 'module';
}

function labelLines(label: string, limit = 21): string[] {
  const words = label.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= limit || !line) line = candidate;
    else { lines.push(line); line = word; }
  });
  if (line) lines.push(line);
  if (lines.length <= 2) return lines;
  return [lines[0], `${lines.slice(1).join(' ').slice(0, limit - 1)}…`];
}

function anchor(object: BlueprintDrawingObject, other: BlueprintDrawingObject): Point {
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  const target = { x: other.x + other.width / 2, y: other.y + other.height / 2 };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (Math.abs(dx) >= Math.abs(dy)) return { x: dx >= 0 ? object.x + object.width : object.x, y: center.y };
  return { x: center.x, y: dy >= 0 ? object.y + object.height : object.y };
}

function connectionPoints(connection: BlueprintDrawingConnection, source: BlueprintDrawingObject, target: BlueprintDrawingObject): Point[] {
  const start = anchor(source, target);
  const end = anchor(target, source);
  if (connection.points?.length) return [start, ...connection.points, end];
  if (Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)) {
    const x = (start.x + end.x) / 2;
    return [start, { x, y: start.y }, { x, y: end.y }, end];
  }
  const y = (start.y + end.y) / 2;
  return [start, { x: start.x, y }, { x: end.x, y }, end];
}

function path(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function centerOfLongestSegment(points: Point[]): Point {
  let chosen: [Point, Point] = [points[0], points[1] || points[0]];
  let longest = -1;
  for (let index = 0; index < points.length - 1; index += 1) {
    const length = Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y);
    if (length > longest) { longest = length; chosen = [points[index], points[index + 1]]; }
  }
  return { x: (chosen[0].x + chosen[1].x) / 2, y: (chosen[0].y + chosen[1].y) / 2 };
}

function TechnicalLabel({ object, xOffset = 0 }: { object: BlueprintDrawingObject; xOffset?: number }) {
  const adjusted = { ...object, x: object.x + xOffset, width: object.width - xOffset };
  const lines = labelLines(object.label, adjusted.width < 130 ? 17 : 23);
  const centerX = adjusted.x + adjusted.width / 2;
  const startY = object.y + object.height / 2 - (lines.length - 1) * 6;
  const category = (meta(object, 'category') || object.sourceType || object.type).toUpperCase().slice(0, 28);
  const status = meta(object, 'status').toUpperCase().slice(0, 10);
  return (
    <g pointerEvents="none">
      {lines.map((line, index) => <text key={`${object.id}-${index}`} x={centerX} y={startY + index * 13} textAnchor="middle" fontSize={8.2} fontWeight={750} fill="#0f172a">{line}</text>)}
      <text x={centerX} y={object.y + object.height - 9} textAnchor="middle" fontSize={5.5} fontWeight={650} letterSpacing={0.65} fill="#64748b" fontFamily="ui-monospace, monospace">{category}{status ? ` · ${status}` : ''}</text>
    </g>
  );
}

function Ports({ object }: { object: BlueprintDrawingObject }) {
  const y = object.y + object.height / 2;
  return <g><circle cx={object.x} cy={y} r={2.7} fill="#fff" stroke="#334155" strokeWidth={1.1} /><circle cx={object.x + object.width} cy={y} r={2.7} fill="#fff" stroke="#334155" strokeWidth={1.1} /></g>;
}

function Symbol({ object }: { object: BlueprintDrawingObject }) {
  const kind = classify(object);
  const cx = object.x + 29;
  const cy = object.y + object.height / 2;
  const common = <><TechnicalLabel object={object} xOffset={kind === 'module' ? 0 : 56} /><Ports object={object} /></>;

  if (kind === 'annotation') return <g><line x1={object.x} y1={object.y} x2={object.x + object.width} y2={object.y} stroke="#64748b" /><text x={object.x} y={object.y + 15} fontSize={9} fontWeight={750} fill="#1e293b">{object.label.slice(0, 48)}</text></g>;
  if (kind === 'warning') return <g><path d={`M ${object.x + object.width / 2} ${object.y + 4} L ${object.x + object.width - 4} ${object.y + object.height - 4} H ${object.x + 4} Z`} fill="#fef2f2" stroke="#dc2626" /><text x={object.x + object.width / 2} y={cy + 6} textAnchor="middle" fontSize={16} fontWeight={800} fill="#dc2626">!</text></g>;
  if (kind === 'zone') return <g><rect x={object.x} y={object.y} width={object.width} height={object.height} rx={4} fill="url(#zoneHatch)" stroke="#92400e" strokeWidth={1.2} /><TechnicalLabel object={object} /></g>;
  if (kind === 'state') return <g><rect x={object.x} y={object.y} width={object.width} height={object.height} rx={object.height / 2} fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.2} /><TechnicalLabel object={object} /><Ports object={object} /></g>;
  if (kind === 'document') return <g><path d={`M ${object.x} ${object.y} H ${object.x + object.width - 14} L ${object.x + object.width} ${object.y + 14} V ${object.y + object.height} H ${object.x} Z`} fill="#f8fafc" stroke="#475569" /><path d={`M ${object.x + object.width - 14} ${object.y} V ${object.y + 14} H ${object.x + object.width}`} fill="none" stroke="#475569" /><TechnicalLabel object={object} /></g>;
  if (kind === 'board') return <g><rect x={object.x} y={object.y} width={object.width} height={object.height} rx={4} fill="#ecfdf5" stroke="#047857" strokeWidth={1.5} />{[[9,9],[object.width-9,9],[9,object.height-9],[object.width-9,object.height-9]].map(([x,y],i)=><circle key={i} cx={object.x+x} cy={object.y+y} r={3.2} fill="#fff" stroke="#047857" />)}<path d={`M ${object.x+18} ${object.y+20} H ${object.x+object.width-18} V ${object.y+object.height-20}`} fill="none" stroke="#10b981" />{common}</g>;
  if (kind === 'component') return <g><rect x={object.x} y={object.y} width={object.width} height={object.height} rx={3} fill="#f1f5f9" stroke="#334155" />{[1,2,3,4].map(index => { const y=object.y+(index*object.height)/5; return <React.Fragment key={index}><line x1={object.x-4} y1={y} x2={object.x} y2={y} stroke="#475569" /><line x1={object.x+object.width} y1={y} x2={object.x+object.width+4} y2={y} stroke="#475569" /></React.Fragment>; })}<circle cx={object.x+7} cy={object.y+7} r={2} fill="#334155" /><TechnicalLabel object={object} /></g>;

  const palette: Record<Exclude<SymbolKind, 'board' | 'component' | 'zone' | 'state' | 'document' | 'warning' | 'annotation'>, [string, string, string]> = {
    power: ['#fff7ed', '#9a3412', '#c2410c'], controller: ['#f0f9ff', '#0369a1', '#0284c7'], sensor: ['#ecfdf5', '#047857', '#059669'], wireless: ['#f5f3ff', '#6d28d9', '#7c3aed'], cloud: ['#eff6ff', '#1d4ed8', '#2563eb'], actuator: ['#fefce8', '#a16207', '#ca8a04'], mechanical: ['#f8fafc', '#475569', '#64748b'], module: ['#ffffff', '#1e293b', '#475569'],
  };
  const [fill, stroke, accent] = palette[kind];

  return <g><rect x={object.x} y={object.y} width={object.width} height={object.height} rx={5} fill={fill} stroke={stroke} strokeWidth={1.25} />
    {kind === 'power' && <g><rect x={cx-12} y={cy-19} width={24} height={38} rx={3} fill="none" stroke={accent} /><rect x={cx-4} y={cy-23} width={8} height={4} fill={accent} /><path d={`M ${cx-5} ${cy-5} H ${cx+5} M ${cx} ${cy-10} V ${cy} M ${cx-5} ${cy+9} H ${cx+5}`} stroke={accent} strokeWidth={1.5} /></g>}
    {kind === 'controller' && <g><rect x={cx-15} y={cy-18} width={30} height={36} rx={2} fill="none" stroke={accent} />{[-12,-6,0,6,12].map((dy,i)=><React.Fragment key={i}><line x1={cx-23} y1={cy+dy} x2={cx-15} y2={cy+dy} stroke={accent}/><line x1={cx+15} y1={cy+dy} x2={cx+23} y2={cy+dy} stroke={accent}/></React.Fragment>)}<circle cx={cx-8} cy={cy-11} r={2} fill={accent}/></g>}
    {kind === 'sensor' && <g><circle cx={cx} cy={cy} r={12} fill="none" stroke={accent} /><circle cx={cx} cy={cy} r={3.5} fill={accent} /><path d={`M ${cx+15} ${cy-13} Q ${cx+27} ${cy} ${cx+15} ${cy+13}`} fill="none" stroke={accent} /></g>}
    {kind === 'wireless' && <g><line x1={cx} y1={cy+15} x2={cx} y2={cy-13} stroke={accent} strokeWidth={1.4}/><circle cx={cx} cy={cy-15} r={2.2} fill={accent}/><path d={`M ${cx-8} ${cy-17} Q ${cx} ${cy-27} ${cx+8} ${cy-17} M ${cx-14} ${cy-22} Q ${cx} ${cy-38} ${cx+14} ${cy-22}`} fill="none" stroke={accent}/></g>}
    {kind === 'cloud' && <path d={`M ${cx-18} ${cy+8} C ${cx-23} ${cy+1}, ${cx-18} ${cy-7}, ${cx-10} ${cy-7} C ${cx-7} ${cy-18}, ${cx+9} ${cy-18}, ${cx+13} ${cy-8} C ${cx+23} ${cy-8}, ${cx+25} ${cy+7}, ${cx+15} ${cy+9} Z`} fill="none" stroke={accent}/>} 
    {kind === 'actuator' && <g><circle cx={cx} cy={cy} r={14} fill="none" stroke={accent}/><text x={cx} y={cy+4} textAnchor="middle" fontSize={11} fontWeight={800} fill={accent}>M</text><path d={`M ${cx-22} ${cy-10} q -7 5 0 10 M ${cx+22} ${cy-10} q 7 5 0 10`} fill="none" stroke={accent}/></g>}
    {kind === 'mechanical' && <g><circle cx={cx} cy={cy} r={17} fill="none" stroke={accent} strokeWidth={3}/><circle cx={cx} cy={cy} r={8} fill="none" stroke={accent} strokeDasharray="3 2"/><path d={`M ${cx-23} ${cy} H ${cx+23} M ${cx} ${cy-23} V ${cy+23}`} stroke={accent} strokeWidth={0.7}/></g>}
    {kind === 'module' && <g><rect x={object.x} y={object.y} width={object.width} height={16} rx={5} fill="#e2e8f0"/><line x1={object.x} y1={object.y+16} x2={object.x+object.width} y2={object.y+16} stroke="#94a3b8"/></g>}
    {common}
  </g>;
}

export const BlueprintDrawingRenderer: React.FC<BlueprintDrawingRendererProps> = ({ drawing, className }) => {
  const prepared = createEngineeringLayout(drawing);
  const [vx = 0, vy = 0, vw = 800, vh = 500] = prepared.viewBox.split(' ').map(Number);
  const objects = new Map(prepared.objects.map(object => [object.id, object]));
  const legend = Array.from(new Set(prepared.connections.map(connection => connection.type || 'signal')));

  return <svg viewBox={prepared.viewBox} className={className} style={{ width: '100%', height: 'auto', maxHeight: '620px', background: '#fff' }} role="img" aria-label="Generated engineering blueprint diagram" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="minorGrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth={0.35}/></pattern>
      <pattern id="majorGrid" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="url(#minorGrid)"/><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e1" strokeWidth={0.55}/></pattern>
      <pattern id="zoneHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fffbeb"/><line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" opacity={0.3}/></pattern>
      {Object.entries(connectionColors).map(([type,color])=><marker key={type} id={`arrow-${type}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill={color}/></marker>)}
      <marker id="dimStart" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M 7 0 L 1 4 L 7 8" fill="none" stroke="#334155"/></marker>
      <marker id="dimEnd" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M 1 0 L 7 4 L 1 8" fill="none" stroke="#334155"/></marker>
    </defs>
    <rect x={vx} y={vy} width={vw} height={vh} fill={prepared.grid ? 'url(#majorGrid)' : '#fff'}/>
    <rect x={vx+12} y={vy+12} width={vw-24} height={vh-24} fill="none" stroke="#0f172a" strokeWidth={1.1}/>
    <rect x={vx+16} y={vy+16} width={vw-32} height={vh-32} fill="none" stroke="#94a3b8" strokeWidth={0.45}/>
    {Array.from({length:8},(_,i)=><text key={i} x={vx+12+((i+0.5)*(vw-24))/8} y={vy+9} textAnchor="middle" fontSize={6} fill="#475569" fontFamily="ui-monospace, monospace">{String.fromCharCode(65+i)}</text>)}
    {prepared.connections.map(connection => { const source=objects.get(connection.sourceId); const target=objects.get(connection.targetId); if(!source||!target)return null; const type=connection.type||'signal'; const points=connectionPoints(connection,source,target); const d=path(points); const lp=centerOfLongestSegment(points); return <g key={connection.id}><path d={d} fill="none" stroke="#fff" strokeWidth={4}/><path d={d} fill="none" stroke={connectionColors[type]} strokeWidth={1.35} strokeDasharray={connectionDash[type]} markerEnd={`url(#arrow-${type})`} strokeLinejoin="round"/>{connection.label&&<g transform={`translate(${lp.x} ${lp.y})`}><rect x={-Math.min(52,connection.label.length*3)} y={-9} width={Math.min(104,connection.label.length*6)} height={12} rx={2} fill="#fff" stroke={connectionColors[type]} strokeWidth={0.45}/><text y={0} textAnchor="middle" fontSize={6.1} fontWeight={700} fill={connectionColors[type]} fontFamily="ui-monospace, monospace">{connection.label.slice(0,28)}</text></g>}</g>; })}
    {prepared.objects.map(object=><Symbol key={object.id} object={object}/>)}
    {prepared.dimensions.map(dimension => { const mx=(dimension.from.x+dimension.to.x)/2; const my=(dimension.from.y+dimension.to.y)/2; return <g key={dimension.id}><line x1={dimension.from.x} y1={dimension.from.y-6} x2={dimension.from.x} y2={dimension.from.y+6} stroke="#334155"/><line x1={dimension.to.x} y1={dimension.to.y-6} x2={dimension.to.x} y2={dimension.to.y+6} stroke="#334155"/><line x1={dimension.from.x} y1={dimension.from.y} x2={dimension.to.x} y2={dimension.to.y} stroke="#334155" markerStart="url(#dimStart)" markerEnd="url(#dimEnd)"/><rect x={mx-28} y={my-12} width={56} height={11} fill="#fff"/><text x={mx} y={my-4} textAnchor="middle" fontSize={6.5} fontWeight={700} fill="#334155" fontFamily="ui-monospace, monospace">{dimension.label}</text></g>; })}
    {prepared.callouts.map((callout,index)=>{ const color=callout.severity==='blocker'||callout.severity==='error'?'#dc2626':callout.severity==='warning'?'#d97706':'#2563eb'; return <g key={callout.id}>{callout.targetX!=null&&callout.targetY!=null&&<path d={`M ${callout.x} ${callout.y} L ${callout.targetX} ${callout.targetY}`} fill="none" stroke={color} strokeDasharray="4 2"/>}<circle cx={callout.x} cy={callout.y} r={6} fill="#fff" stroke={color}/><text x={callout.x} y={callout.y+2.2} textAnchor="middle" fontSize={6.5} fontWeight={800} fill={color}>{index+1}</text><text x={callout.x+9} y={callout.y+2.2} fontSize={6.3} fontWeight={700} fill={color}>{callout.label.slice(0,38)}</text></g>;})}
    {legend.length>0&&<g transform={`translate(${vx+vw-164} ${vy+27})`}><rect width={142} height={16+legend.length*14} rx={3} fill="#fff" stroke="#94a3b8"/><text x={8} y={11} fontSize={6} fontWeight={800} fill="#475569">CONNECTION LEGEND</text>{legend.map((type,index)=><g key={type} transform={`translate(8 ${20+index*14})`}><line x1={0} y1={0} x2={24} y2={0} stroke={connectionColors[type]} strokeDasharray={connectionDash[type]}/><text x={30} y={2.2} fontSize={6.1} fontWeight={650} fill="#334155">{type.toUpperCase()}</text></g>)}</g>}
    <g transform={`translate(${vx+vw-246} ${vy+vh-58})`}><rect width={230} height={42} fill="#fff" stroke="#0f172a"/><line x1={0} y1={18} x2={230} y2={18} stroke="#0f172a"/><line x1={155} y1={18} x2={155} y2={42} stroke="#0f172a"/><text x={8} y={12} fontSize={6.5} fontWeight={800} fill="#0f172a">GENERATED ENGINEERING VIEW</text><text x={8} y={30} fontSize={6} fill="#475569">SOURCE-BOUND · REVIEW REQUIRED</text><text x={163} y={29} fontSize={5.5} fill="#64748b">SCALE</text><text x={194} y={31} fontSize={7} fontWeight={800}>NTS</text></g>
  </svg>;
};
