import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date as YYYY-MM-DD');

export const tenantCreate = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(100),
  phone: z.string().trim().min(1).max(20),
  status: z.enum(['active', 'inactive']).default('active'),
});
export const tenantUpdate = tenantCreate.partial();

export const roomCreate = z.object({
  roomNumber: z.string().trim().min(1).max(10),
  floor: z.coerce.number().int().min(0).max(99),
  type: z.enum(['single', 'double', 'shared']),
  monthlyRate: z.coerce.number().positive().max(999999),
  maxOccupancy: z.coerce.number().int().positive().max(99),
  status: z.enum(['available', 'occupied', 'under_maintenance']).default('available'),
});
export const roomUpdate = roomCreate.partial();

export const leaseCreate = z.object({
  tenantId: z.coerce.number().int().positive(),
  roomId: z.coerce.number().int().positive(),
  startDate: dateString,
  endDate: dateString.nullable().optional(),
  status: z.enum(['active', 'ended']).default('active'),
});
export const leaseUpdate = leaseCreate.partial();

export const paymentCreate = z.object({
  leaseId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive().max(999999),
  paymentDate: dateString,
  status: z.enum(['paid', 'partial', 'overdue']).default('paid'),
});
export const paymentUpdate = paymentCreate.partial();

export const maintenanceCreate = z.object({
  roomId: z.coerce.number().int().positive(),
  description: z.string().trim().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high']).default('low'),
  reportedDate: dateString,
  status: z.enum(['pending', 'in_progress', 'resolved']).default('pending'),
});
export const maintenanceUpdate = maintenanceCreate.partial();

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100),
  role: z.enum(['admin', 'staff']).default('admin'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(100),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.').max(100),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(100),
  subject: z.string().trim().min(2, 'Subject is required.').max(150),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000),
});
