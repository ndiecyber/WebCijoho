-- Script Inisialisasi Database PostgreSQL untuk WebCijoho & PostgREST
-- Jalankan di database 'cijoho' pada PostgreSQL VPS

-- 1. Buat role web_anon (untuk publik/kasir) dan web_admin (untuk admin dashboard)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'web_anon') THEN
    CREATE ROLE web_anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'web_admin') THEN
    CREATE ROLE web_admin NOLOGIN;
  END IF;
END
$$;

-- Berikan izin ganti role (SET ROLE) ke user Postgres utama (admin_utama)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin_utama') THEN
    GRANT web_anon TO admin_utama;
    GRANT web_admin TO admin_utama;
  END IF;
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
    GRANT web_anon TO admin;
    GRANT web_admin TO admin;
  END IF;
END
$$;

-- Izin akses skema public
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT USAGE ON SCHEMA public TO web_admin;

-- 2. Buat tabel transactions jika belum ada
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(100) NOT NULL,
    ticket_type VARCHAR(100),
    transaction_type VARCHAR(50) DEFAULT 'beli',
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC DEFAULT 0,
    customer_name VARCHAR(255) DEFAULT 'Pengunjung',
    status VARCHAR(50) DEFAULT 'lunas',
    payment_method VARCHAR(50) DEFAULT 'tunai',
    channel VARCHAR(50) DEFAULT 'offline',
    cashier_name VARCHAR(255) DEFAULT 'Petugas Kasir',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrasi jika tabel sudah ada sebelumnya namun belum punya kolom transaction_type
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'beli';


-- Index performa query
CREATE INDEX IF NOT EXISTS idx_transactions_booking_code ON public.transactions(booking_code);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 3. Prinsip Least Privilege untuk role web_anon (Publik/Kasir):
-- Hanya boleh INSERT transaksi baru dan SELECT id (untuk keepAlive ping).
-- DILARANG keras SELECT * (agar data omset/pengunjung tidak diintip) dan DILARANG DELETE/UPDATE.
REVOKE ALL ON TABLE public.transactions FROM web_anon;
GRANT INSERT, SELECT (id) ON TABLE public.transactions TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE public.transactions_id_seq TO web_anon;

-- 4. Izin penuh untuk role web_admin (Admin Dashboard):
-- Boleh SELECT, INSERT, UPDATE, dan DELETE (refund transaksi).
GRANT ALL ON TABLE public.transactions TO web_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web_admin;

-- 5. Default Privileges untuk masa depan
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO web_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO web_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO web_admin;
