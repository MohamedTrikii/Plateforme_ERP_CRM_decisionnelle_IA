-- ============================================================
-- ERP Platform – PostgreSQL initialization script
-- Runs automatically when the postgres container starts for
-- the first time (via /docker-entrypoint-initdb.d/).
-- ============================================================

-- Create the two application databases
CREATE DATABASE erp_auth;
CREATE DATABASE erp_core;

-- Grant all privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE erp_auth TO erp;
GRANT ALL PRIVILEGES ON DATABASE erp_core TO erp;

-- ─── erp_auth schema ──────────────────────────────────────────────────────

\c erp_auth;

CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    full_name  VARCHAR(150),
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    tenant_id  VARCHAR(100) NOT NULL,
    enabled    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT NOW(),
    updated_at TIMESTAMP    DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_users_tenant   ON users (tenant_id);
CREATE INDEX idx_users_username ON users (username);

-- Seed: default ADMIN user (password = Admin@1234 bcrypt-encoded)
INSERT INTO users (username, email, password, full_name, role, tenant_id)
VALUES (
    'admin',
    'admin@erp.local',
    '$2a$12$VshyU9ErAapmkHu85x7lUeJ9EdiIM7Gvn66Ae4lqiCYpfh.71EL46',
    'System Administrator',
    'ADMIN',
    'default'
) ON CONFLICT DO NOTHING;

-- ─── erp_core schema ──────────────────────────────────────────────────────

\c erp_core;

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(150),
    phone      VARCHAR(30),
    address    TEXT,
    company    VARCHAR(150),
    status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    tenant_id  VARCHAR(100) NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW(),
    updated_at TIMESTAMP    DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_customers_tenant ON customers (tenant_id);
CREATE INDEX idx_customers_name   ON customers (tenant_id, name);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    sku         VARCHAR(80)  NOT NULL,
    description TEXT,
    price       NUMERIC(14,2) NOT NULL DEFAULT 0,
    cost_price  NUMERIC(14,2) NOT NULL DEFAULT 0,
    category    VARCHAR(100),
    image_url   TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    tenant_id   VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW(),
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    UNIQUE (tenant_id, sku)
);

CREATE INDEX idx_products_tenant ON products (tenant_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id           BIGSERIAL     PRIMARY KEY,
    order_number VARCHAR(30)   NOT NULL UNIQUE,
    customer_id  BIGINT        REFERENCES customers(id),
    order_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
    status       VARCHAR(30)   NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    notes        TEXT,
    tenant_id    VARCHAR(100)  NOT NULL,
    created_at   TIMESTAMP     DEFAULT NOW(),
    updated_at   TIMESTAMP     DEFAULT NOW(),
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100)
);

CREATE INDEX idx_orders_tenant ON orders (tenant_id);
CREATE INDEX idx_orders_status ON orders (tenant_id, status);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGSERIAL     PRIMARY KEY,
    order_id    BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  BIGINT        NOT NULL REFERENCES products(id),
    quantity    INT           NOT NULL DEFAULT 1,
    unit_price  NUMERIC(14,2) NOT NULL DEFAULT 0
);

-- Stock
CREATE TABLE IF NOT EXISTS stock (
    id                 BIGSERIAL PRIMARY KEY,
    product_id         BIGINT    NOT NULL UNIQUE REFERENCES products(id),
    quantity_on_hand   INT       NOT NULL DEFAULT 0,
    quantity_reserved  INT       NOT NULL DEFAULT 0,
    reorder_level      INT       NOT NULL DEFAULT 5,
    reorder_quantity   INT       NOT NULL DEFAULT 10,
    tenant_id          VARCHAR(100) NOT NULL
);

CREATE INDEX idx_stock_tenant ON stock (tenant_id);

-- System Config
CREATE TABLE IF NOT EXISTS system_config (
    id           BIGSERIAL     PRIMARY KEY,
    tenant_id    VARCHAR(100)  NOT NULL,
    config_key   VARCHAR(150)  NOT NULL,
    config_value TEXT,
    config_type  VARCHAR(20)   NOT NULL DEFAULT 'TEXT',
    label        VARCHAR(150),
    description  TEXT,
    is_public    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP     DEFAULT NOW(),
    updated_at   TIMESTAMP     DEFAULT NOW(),
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    UNIQUE (tenant_id, config_key)
);

CREATE INDEX idx_config_tenant ON system_config (tenant_id, is_public);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL     PRIMARY KEY,
    entity_name VARCHAR(100)  NOT NULL,
    entity_id   VARCHAR(50),
    action      VARCHAR(20)   NOT NULL,
    performed_by VARCHAR(100),
    tenant_id   VARCHAR(100)  NOT NULL,
    old_value   TEXT,
    new_value   TEXT,
    description TEXT,
    ip_address  VARCHAR(50),
    timestamp   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log (entity_name, tenant_id, timestamp DESC);

-- Seed: default system config for 'default' tenant
INSERT INTO system_config (tenant_id, config_key, config_value, config_type, label, is_public) VALUES
    ('default', 'company.name',        'ERP Platform',        'TEXT',  'Company Name',      TRUE),
    ('default', 'company.logoUrl',     '',                    'URL',   'Logo URL',          TRUE),
    ('default', 'theme.primaryColor',  '#1976D2',             'COLOR', 'Primary Color',     TRUE),
    ('default', 'theme.secondaryColor','#424242',             'COLOR', 'Secondary Color',   TRUE),
    ('default', 'theme.accentColor',   '#FF4081',             'COLOR', 'Accent Color',      TRUE),
    ('default', 'theme.fontFamily',    'Roboto, sans-serif',  'TEXT',  'Font Family',       TRUE),
    ('default', 'layout.sidebarModules','["customers","products","orders","stock"]', 'JSON', 'Enabled Modules', TRUE)
ON CONFLICT DO NOTHING;
