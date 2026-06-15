export type TenantStatus = 'active' | 'inactive';
export type RoomType = 'single' | 'double' | 'shared';
export type RoomStatus = 'available' | 'occupied' | 'under_maintenance';
export type LeaseStatus = 'active' | 'ended';
export type PaymentStatus = 'paid' | 'partial' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';
export type RequestStatus = 'pending' | 'in_progress' | 'resolved';

export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: TenantStatus;
}

export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  type: RoomType;
  monthlyRate: number;
  maxOccupancy: number;
  status: RoomStatus;
}

export interface Lease {
  id: number;
  tenantId: number;
  roomId: number;
  startDate: string;
  endDate: string | null;
  status: LeaseStatus;
  tenant?: Tenant;
  room?: Room;
}

export interface Payment {
  id: number;
  leaseId: number;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
  lease?: Lease & { tenant?: Tenant; room?: Room };
}

export interface MaintenanceRequest {
  id: number;
  roomId: number;
  description: string;
  priority: Priority;
  reportedDate: string;
  status: RequestStatus;
  room?: Room;
}

export interface OverdueRow {
  paymentId: number;
  tenant: string;
  roomNumber: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string;
  daysOverdue: number;
}

export interface Dashboard {
  incomeThisMonth: number;
  month: string;
  occupancy: { occupied: number; total: number; rate: number };
  overdue: OverdueRow[];
  overdueTotal: number;
  maintenanceByStatus: { pending: number; in_progress: number; resolved: number };
  maintenanceTotal: number;
  activeTenants: number;
  activeLeases: number;
}

export interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  data: {
    tenants: Tenant[];
    rooms: Room[];
    leases: Lease[];
    payments: Payment[];
    maintenance_requests: MaintenanceRequest[];
  };
}
