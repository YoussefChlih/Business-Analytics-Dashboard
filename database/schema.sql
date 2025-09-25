-- Database schema for Business Analytics Dashboard

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('database', 'api', 'file', 'csv')),
    connection_config JSONB,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    last_sync TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard widgets table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('chart', 'table', 'kpi', 'metric')),
    config JSONB,
    position INTEGER,
    size JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert rules table
CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    rule_id INTEGER REFERENCES alert_rules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    conditions JSONB,
    triggered_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample business data tables
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    items_count INTEGER DEFAULT 1,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    query_config JSONB NOT NULL,
    schedule_config JSONB,
    format VARCHAR(50) DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
    is_active BOOLEAN DEFAULT true,
    last_generated TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Data quality metrics table
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN ('completeness', 'accuracy', 'consistency', 'validity')),
    metric_value DECIMAL(5,2),
    threshold_value DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'good' CHECK (status IN ('good', 'warning', 'critical')),
    details JSONB,
    measured_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);

-- Insert some sample data
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0VbLj6VrpK', 'Admin', 'User', 'admin'),
('user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0VbLj6VrpK', 'Regular', 'User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Sample customers
INSERT INTO customers (first_name, last_name, email, phone, city, country) VALUES
('John', 'Doe', 'john.doe@example.com', '+1234567890', 'New York', 'USA'),
('Jane', 'Smith', 'jane.smith@example.com', '+1234567891', 'Los Angeles', 'USA'),
('Bob', 'Johnson', 'bob.johnson@example.com', '+1234567892', 'Chicago', 'USA'),
('Alice', 'Brown', 'alice.brown@example.com', '+1234567893', 'Houston', 'USA'),
('Charlie', 'Wilson', 'charlie.wilson@example.com', '+1234567894', 'Phoenix', 'USA')
ON CONFLICT (email) DO NOTHING;

-- Sample products
INSERT INTO products (name, description, price, category, stock_quantity, sku) VALUES
('Wireless Headphones', 'High-quality wireless headphones', 99.99, 'Electronics', 50, 'WH001'),
('Smartphone', 'Latest model smartphone', 699.99, 'Electronics', 25, 'SP001'),
('Coffee Mug', 'Ceramic coffee mug', 12.99, 'Home & Kitchen', 100, 'CM001'),
('Laptop', 'High-performance laptop', 1299.99, 'Electronics', 15, 'LP001'),
('Book', 'Bestselling novel', 14.99, 'Books', 200, 'BK001')
ON CONFLICT (sku) DO NOTHING;

-- Sample orders (only if customers exist)
INSERT INTO orders (customer_id, order_number, status, total_amount, items_count, created_at)
SELECT 
    c.id,
    'ORD' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY c.id) AS TEXT), 6, '0'),
    CASE 
        WHEN RANDOM() < 0.1 THEN 'cancelled'
        WHEN RANDOM() < 0.2 THEN 'pending'
        WHEN RANDOM() < 0.4 THEN 'processing'
        WHEN RANDOM() < 0.7 THEN 'shipped'
        ELSE 'delivered'
    END,
    ROUND((RANDOM() * 500 + 50)::numeric, 2),
    FLOOR(RANDOM() * 5 + 1)::integer,
    NOW() - (RANDOM() * INTERVAL '90 days')
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE customer_id = c.id)
LIMIT 20;