-- ============================================================
--  Bahay ni Kuya — DML  (Insert / Update / Delete / Select samples)
--  Reference mirror; the app seeds equivalent data via prisma/seed.ts.
-- ============================================================

-- ---------- INSERT ----------
-- Login accounts (password_hash shown as a placeholder; the app stores a bcrypt hash).
INSERT INTO users (name, email, password_hash, role) VALUES
  ('House Administrator', 'admin@bahaynikuya.com', '<bcrypt-hash-of-admin123>', 'admin'),
  ('Front Desk Staff',    'staff@bahaynikuya.com', '<bcrypt-hash-of-staff123>', 'staff');

INSERT INTO rooms (room_number, floor, type, monthly_rate, max_occupancy, status) VALUES
  ('101', 1, 'single', 4500.00, 1, 'occupied'),
  ('102', 1, 'double', 6000.00, 2, 'occupied'),
  ('201', 2, 'single', 4800.00, 1, 'available'),
  ('202', 2, 'shared', 3000.00, 4, 'occupied'),
  ('203', 2, 'single', 4800.00, 1, 'under_maintenance');

INSERT INTO tenants (first_name, last_name, email, phone, status) VALUES
  ('Carlos',  'Reyes',      'carlos.reyes@example.com',      '0917-123-4501', 'active'),
  ('Ana',     'Santos',     'ana.santos@example.com',        '0917-123-4502', 'active'),
  ('Miguel',  'Cruz',       'miguel.cruz@example.com',       '0917-123-4503', 'active'),
  ('Jasmine', 'Dela Cruz',  'jasmine.delacruz@example.com',  '0917-123-4504', 'active'),
  ('Ramon',   'Villanueva', 'ramon.villanueva@example.com',  '0917-123-4505', 'inactive');

INSERT INTO leases (tenant_id, room_id, start_date, end_date, status) VALUES
  (1, 1, '2024-06-01', NULL,         'active'),
  (2, 2, '2024-07-15', NULL,         'active'),
  (3, 4, '2024-08-01', NULL,         'active'),
  (4, 4, '2024-09-01', NULL,         'active'),
  (5, 3, '2023-01-10', '2024-01-10', 'ended');

INSERT INTO payments (lease_id, amount, payment_date, status) VALUES
  (1, 4500.00, '2026-05-05', 'paid'),
  (2, 6000.00, '2026-05-03', 'paid'),
  (3, 3000.00, '2026-05-10', 'paid'),
  (4, 1500.00, '2026-05-12', 'partial'),
  (1, 4500.00, '2026-04-04', 'paid'),
  (1, 4500.00, '2026-06-05', 'paid'),
  (2, 6000.00, '2026-06-03', 'paid'),
  (3, 3000.00, '2026-06-10', 'paid'),
  (4, 1500.00, '2026-06-12', 'partial');

INSERT INTO maintenance_requests (room_id, description, priority, reported_date, status) VALUES
  (5, 'Air-conditioning unit not cooling; needs servicing.', 'high',   '2026-05-20', 'in_progress'),
  (2, 'Leaking faucet in the bathroom.',                     'medium', '2026-05-22', 'resolved'),
  (4, 'Broken window latch, will not lock.',                 'high',   '2026-06-01', 'pending'),
  (1, 'Flickering ceiling light.',                           'low',    '2026-05-30', 'pending'),
  (3, 'Door lock sticking, hard to open.',                   'low',    '2026-05-18', 'in_progress');

-- ---------- UPDATE ----------
-- Mark a partial payment as overdue
UPDATE payments SET status = 'overdue' WHERE payment_id = 4;

-- ---------- DELETE (soft-delete for tenants) ----------
UPDATE tenants SET status = 'inactive' WHERE tenant_id = 5;

-- ---------- SELECT with JOINs ----------
-- Active tenants with their room + rate
SELECT t.first_name, t.last_name, r.room_number, r.monthly_rate
FROM tenants t
JOIN leases l ON t.tenant_id = l.tenant_id
JOIN rooms  r ON l.room_id  = r.room_id
WHERE l.status = 'active';

-- Total income for the current month (paid only)
SELECT COALESCE(SUM(amount), 0) AS income_this_month
FROM payments
WHERE status = 'paid'
  AND date_trunc('month', payment_date) = date_trunc('month', CURRENT_DATE);

-- Occupancy rate
SELECT
  COUNT(*) FILTER (WHERE status = 'occupied') AS occupied,
  COUNT(*)                                    AS total
FROM rooms;

-- Outstanding (overdue/partial) payments with tenant + days overdue
SELECT t.first_name, t.last_name, p.amount, p.status,
       (CURRENT_DATE - p.payment_date) AS days_overdue
FROM payments p
JOIN leases  l ON p.lease_id  = l.lease_id
JOIN tenants t ON l.tenant_id = t.tenant_id
WHERE p.status IN ('partial', 'overdue')
ORDER BY p.payment_date ASC;
