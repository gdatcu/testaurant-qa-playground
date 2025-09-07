-- Reset
DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS menu_items;

CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  category VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 9.00,
  stock INT NOT NULL DEFAULT 100,
  image_url VARCHAR(255),
  available TINYINT(1) DEFAULT 1
);

CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  type ENUM('percent','fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  active TINYINT(1) DEFAULT 1,
  min_subtotal DECIMAL(10,2) DEFAULT 0.00,
  expires_at DATETIME NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  address_line1 VARCHAR(120),
  city VARCHAR(60),
  postal_code VARCHAR(20),
  delivery_method ENUM('pickup','delivery') DEFAULT 'pickup',
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('created','preparing','ready','delivered','cancelled') DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(id)
);

CREATE TABLE order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash','card') NOT NULL,
  status ENUM('authorized','captured','failed') NOT NULL,
  transaction_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE idempotency_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idem_key VARCHAR(80) UNIQUE NOT NULL,
  order_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO menu_items (name, description, category, price, vat_rate, stock, image_url, available) VALUES
('Margherita Pizza', 'Tomato, mozzarella, basil', 'Pizza', 28.00, 9.00, 50, NULL, 1),
('Pepperoni Pizza', 'Pepperoni, mozzarella', 'Pizza', 33.00, 9.00, 50, NULL, 1),
('Carbonara Pasta', 'Egg, pancetta, pecorino', 'Pasta', 35.50, 9.00, 50, NULL, 1),
('Caesar Salad', 'Romaine, croutons, parmesan', 'Salad', 24.00, 9.00, 50, NULL, 1),
('Lemonade', 'Freshly squeezed', 'Drinks', 12.00, 19.00, 100, NULL, 1),
('Espresso', 'Single shot', 'Drinks', 9.50, 19.00, 100, NULL, 1);

INSERT INTO coupons (code, type, value, active, min_subtotal) VALUES
('SUMMER10', 'percent', 10.00, 1, 50.00),
('WELCOME5', 'fixed', 5.00, 1, 0.00);
