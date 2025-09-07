# 🍕 Testaurant QA Playground – PLUS (PHP + MySQL)

A **demo application** for QA automation engineers to **learn and practice test automation**.  
It simulates a restaurant ordering system with API + frontend. 

👉 Hosted at: [app.qualiadept.eu/testaurant](https://apps.qualiadept.eu/testaurant)

---

## ✨ Features
- 📝 **Menu filtering & search:** `GET /api/menu?category=&q=&page=&limit=`
- 🍔 **Categories endpoint:** `GET /api/categories`
- 📦 **Inventory & VAT:** each item has `stock`, `vat_rate`, `image_url`
- 🎟️ **Coupons:** validate/apply discounts
- 💰 **Cart pricing:** server-side quote without placing an order
- 🛒 **Checkout:** supports delivery/pickup, coupons, idempotency with `Idempotency-Key`
- 📜 **Order history:** track status changes
- 🔑 **Admin CRUD:** manage menu items, availability, coupons, stock
- 📊 **Stats & dashboard:** revenue, top-selling items, orders per day
- 💳 **Payment webhook (simulated):** update payment status
- 🧪 **Chaos hooks:** add latency (`?slow=1000`) or failure (`?chaos=1`)

---

## 🚀 Quick Start

### 1. Database
```sql
CREATE DATABASE testaurant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'testaurant_user'@'%' IDENTIFIED BY 'qa_pass_123';
GRANT ALL PRIVILEGES ON testaurant.* TO 'testaurant_user'@'%';
FLUSH PRIVILEGES;
```
```bash
mysql -u testaurant_user -p testaurant < api/seed.sql
```

### 2. Configuration
Copy template and edit secrets:
```bash
cp api/config.php.example api/config.php
```

### 3. Run API
```bash
cd api
php -S 0.0.0.0:8080 api.php
```

### 4. Open Frontend
```bash
open frontend-v3/index.html
```
Set **API Base URL** in top-right if different (e.g. `/testaurant/api`).

---

## 📡 Endpoints (overview)

- `GET /api/health`
- `GET /api/categories`
- `GET /api/menu?category=&q=&page=&limit=`
- `GET /api/coupons/validate?code=SUMMER10`
- `POST /api/cart/price`
- `POST /api/checkout`
- `GET /api/orders?page=1&limit=20` (admin)
- `GET /api/orders/{id}/history`
- `POST /api/orders/{id}/status` (admin)
- `POST /api/menu` (admin)
- `PUT /api/menuitems/{id}` (admin)
- `POST /api/menuitems/{id}/availability` (admin)
- `PUT /api/menuitems/{id}/stock` (admin)
- `POST /api/menuitems/{id}/restock` (admin)
- `POST /api/coupons` (admin)
- `GET /api/rates` (admin)
- `POST /api/rates` (admin)
- `GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD&currency=EUR` (admin)
- `POST /api/webhooks/payment`

👉 Full OpenAPI specs: [`docs/Testaurant_API_OpenAPI3.yaml`](docs/Testaurant_API_OpenAPI3.yaml) & [`docs/Testaurant_API_OpenAPI3.json`](docs/Testaurant_API_OpenAPI3.json)

---

## 📦 Example Checkout Request
```json
{
  "customerName": "John Tester",
  "customerPhone": "+40123456789",
  "items": [
    { "id": 1, "qty": 2 },
    { "id": 3, "qty": 1 }
  ],
  "paymentMethod": "card",
  "deliveryMethod": "delivery",
  "addressLine1": "Str. QA 10",
  "city": "București",
  "postalCode": "010101",
  "couponCode": "SUMMER10"
}
```
Optional header:  
```
Idempotency-Key: any-unique-string
```

---

## 🔑 Admin Access
All **admin endpoints** require a header:
```
X-API-Key: YOUR_ADMIN_KEY
```
Set this in `api/config.php`.

---

## 🧪 QA Automation Playground
- Ready Postman collection + environment in `/docs/`
- OpenAPI 3.0 specs for Swagger/Redoc
- Chaos hooks for resilience testing
- Perfect for **API, UI, and load test automation practice**

---

## ⚠️ Security
- Never commit your real `api/config.php` (use `.gitignore`)
- Rotate secrets if leaked
- Use HTTPS in production

---

## 📄 License
© 2025 [QualiAdept](https://qualiadept.eu). For educational & QA automation practice.  
