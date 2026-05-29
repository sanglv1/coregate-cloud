ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

CREATE TABLE IF NOT EXISTS download_tokens (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(128) NOT NULL,
    token VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (order_id, product_id)
);
