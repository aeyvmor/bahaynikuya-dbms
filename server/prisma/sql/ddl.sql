-- ============================================================
--  Bahay ni Kuya Boarding House Management System
--  DDL — Data Definition Language  (reference mirror of Prisma schema)
--  The live schema is created by Prisma migrations; this file documents
--  the equivalent raw SQL for the course deliverable.
-- ============================================================

-- Enumerated types
CREATE TYPE tenant_status   AS ENUM ('active', 'inactive');
CREATE TYPE room_type       AS ENUM ('single', 'double', 'shared');
CREATE TYPE room_status     AS ENUM ('available', 'occupied', 'under_maintenance');
CREATE TYPE lease_status    AS ENUM ('active', 'ended');
CREATE TYPE payment_status  AS ENUM ('paid', 'partial', 'overdue');
CREATE TYPE priority_level  AS ENUM ('low', 'medium', 'high');
CREATE TYPE request_status  AS ENUM ('pending', 'in_progress', 'resolved');
CREATE TYPE user_role       AS ENUM ('admin', 'staff');

-- users (admin / staff login accounts)
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL DEFAULT 'admin',
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);

-- tenants
CREATE TABLE tenants (
    tenant_id   SERIAL PRIMARY KEY,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    phone       VARCHAR(20)  NOT NULL,
    status      tenant_status NOT NULL DEFAULT 'active'
);

-- rooms
CREATE TABLE rooms (
    room_id       SERIAL PRIMARY KEY,
    room_number   VARCHAR(10) NOT NULL UNIQUE,
    floor         SMALLINT    NOT NULL,
    type          room_type   NOT NULL,
    monthly_rate  DECIMAL(8,2) NOT NULL,
    max_occupancy SMALLINT    NOT NULL,
    status        room_status NOT NULL DEFAULT 'available'
);

-- leases
CREATE TABLE leases (
    lease_id   SERIAL PRIMARY KEY,
    tenant_id  INT NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
    room_id    INT NOT NULL REFERENCES rooms(room_id)     ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date   DATE,
    status     lease_status NOT NULL DEFAULT 'active'
);

-- payments
CREATE TABLE payments (
    payment_id   SERIAL PRIMARY KEY,
    lease_id     INT NOT NULL REFERENCES leases(lease_id) ON DELETE RESTRICT,
    amount       DECIMAL(8,2) NOT NULL,
    payment_date DATE NOT NULL,
    status       payment_status NOT NULL DEFAULT 'paid'
);

-- maintenance_requests
CREATE TABLE maintenance_requests (
    request_id    SERIAL PRIMARY KEY,
    room_id       INT NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    description   TEXT NOT NULL,
    priority      priority_level NOT NULL DEFAULT 'low',
    reported_date DATE NOT NULL,
    status        request_status NOT NULL DEFAULT 'pending'
);
