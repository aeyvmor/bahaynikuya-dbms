import { useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from 'reactflow';
import { KeyRound, Link2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/Layout';

interface Column {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
}
interface TableData {
  name: string;
  columns: Column[];
}

function TableNode({ data }: NodeProps<TableData>) {
  return (
    <div className="w-60 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md">
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-primary" />
      <div className="bg-slate-800 px-3 py-2 text-sm font-semibold text-white">{data.name}</div>
      <div className="divide-y">
        {data.columns.map((c) => (
          <div key={c.name} className="flex items-center justify-between px-3 py-1.5 text-xs">
            <span className="flex items-center gap-1.5">
              {c.pk && <KeyRound className="h-3 w-3 text-amber-500" />}
              {c.fk && !c.pk && <Link2 className="h-3 w-3 text-blue-500" />}
              <span className={c.pk ? 'font-semibold' : ''}>{c.name}</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{c.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary" />
    </div>
  );
}

const TABLES: Record<string, { position: { x: number; y: number }; data: TableData }> = {
  tenants: {
    position: { x: 0, y: 0 },
    data: {
      name: 'tenants',
      columns: [
        { name: 'tenant_id', type: 'PK', pk: true },
        { name: 'first_name', type: 'varchar' },
        { name: 'last_name', type: 'varchar' },
        { name: 'email', type: 'varchar' },
        { name: 'phone', type: 'varchar' },
        { name: 'status', type: 'enum' },
      ],
    },
  },
  rooms: {
    position: { x: 0, y: 320 },
    data: {
      name: 'rooms',
      columns: [
        { name: 'room_id', type: 'PK', pk: true },
        { name: 'room_number', type: 'varchar' },
        { name: 'floor', type: 'int' },
        { name: 'type', type: 'enum' },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'max_occupancy', type: 'int' },
        { name: 'status', type: 'enum' },
      ],
    },
  },
  leases: {
    position: { x: 340, y: 130 },
    data: {
      name: 'leases',
      columns: [
        { name: 'lease_id', type: 'PK', pk: true },
        { name: 'tenant_id', type: 'FK', fk: true },
        { name: 'room_id', type: 'FK', fk: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'status', type: 'enum' },
      ],
    },
  },
  payments: {
    position: { x: 690, y: 60 },
    data: {
      name: 'payments',
      columns: [
        { name: 'payment_id', type: 'PK', pk: true },
        { name: 'lease_id', type: 'FK', fk: true },
        { name: 'amount', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'status', type: 'enum' },
      ],
    },
  },
  maintenance_requests: {
    position: { x: 340, y: 430 },
    data: {
      name: 'maintenance_requests',
      columns: [
        { name: 'request_id', type: 'PK', pk: true },
        { name: 'room_id', type: 'FK', fk: true },
        { name: 'description', type: 'text' },
        { name: 'priority', type: 'enum' },
        { name: 'reported_date', type: 'date' },
        { name: 'status', type: 'enum' },
      ],
    },
  },
};

const RELATIONS: { source: string; target: string; label: string }[] = [
  { source: 'tenants', target: 'leases', label: '1 : N' },
  { source: 'rooms', target: 'leases', label: '1 : N' },
  { source: 'leases', target: 'payments', label: '1 : N' },
  { source: 'rooms', target: 'maintenance_requests', label: '1 : N' },
];

export default function ERDiagram() {
  const nodeTypes = useMemo(() => ({ table: TableNode }), []);

  const nodes: Node[] = useMemo(
    () =>
      Object.entries(TABLES).map(([id, t]) => ({
        id,
        type: 'table',
        position: t.position,
        data: t.data,
      })),
    []
  );

  const edges: Edge[] = useMemo(
    () =>
      RELATIONS.map((r, i) => ({
        id: `e${i}`,
        source: r.source,
        target: r.target,
        label: r.label,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#2563eb', strokeWidth: 1.5 },
        labelStyle: { fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: '#eff6ff' },
      })),
    []
  );

  return (
    <div>
      <PageHeader
        title="ER Diagram"
        description="Entity-relationship model of the database. Drag tables to rearrange; scroll to zoom."
      />
      <div className="h-[640px] overflow-hidden rounded-xl border bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#cbd5e1" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-amber-500" /> Primary key
        </span>
        <span className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-blue-500" /> Foreign key
        </span>
        <span>1 : N — one-to-many relationship</span>
      </div>
    </div>
  );
}
