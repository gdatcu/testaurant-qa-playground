# 🍕 Testaurant QA Playground – PLUS (PHP + MySQL)

A **demo application** for QA automation engineers to **learn and practice test automation**.  
<<<<<<< HEAD
It simulates a restaurant ordering system with **frontend + backend API**.
=======
It simulates a restaurant ordering system with a full frontend, a complete set of UI testing challenges, and a backend API.
>>>>>>> d0acc127ab35fa178bf68a4d9fd03584f41a1b06

👉 Hosted at: [apps.qualiadept.eu/testaurant](https://apps.qualiadept.eu/testaurant)

---

## ✨ Features
- 📝 **Menu filtering & search:** `GET /api/menu?category=&q=&page=&limit=`
- 🍔 **Categories endpoint:** `GET /api/categories`
- 📦 **Inventory & VAT:** each item has `stock`, `vat_rate`, `image_url`
- 🎟️ **Coupons:** validate/apply discounts
- 💰 **Cart pricing:** server-side quote without placing an order
- 🛒 **Checkout:** delivery/pickup, coupons, idempotency with `Idempotency-Key`
- 📜 **Order history:** track status changes
- 🔑 **Admin CRUD:** manage menu items, availability, coupons, stock
- 📊 **Stats & dashboard:** revenue, top sellers, orders per day
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
mysql -u testaurant_user -pqa_pass_123 testaurant < api/seed.sql
```

<<<<<<< HEAD
### 2. Configuration
```bash
cp api/config.php.example api/config.php
```
Edit with your DB credentials and secrets.
=======
### 2. API Config
>>>>>>> d0acc127ab35fa178bf68a4d9fd03584f41a1b06

### 3. Run API
```bash
cd api
php -S 0.0.0.0:8080 api.php
```

<<<<<<< HEAD
### 4. Open Frontend
```bash
open frontend-v3/index.html
```
Set **API Base URL** (top-right) if not default (e.g. `/testaurant/api`).

---

## 📡 Endpoints (overview)
=======
### 3. Web Server

Point your web server (Apache/Nginx) document root to the project's root directory.
Ensure `mod_rewrite` is enabled for clean URLs.

---
>>>>>>> d0acc127ab35fa178bf68a4d9fd03584f41a1b06

- `GET /api/health`
- `GET /api/categories`
- `GET /api/menu?category=&q=&page=&limit=`
- `POST /api/quote`
- `POST /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders?page=1&limit=20` (admin)
- `PUT /api/orders/{id}/status` (admin)
- `POST /api/menuitems` (admin)
- `PUT /api/menuitems/{id}` (admin)
- `PUT /api/menuitems/{id}/availability` (admin)
- `PUT /api/menuitems/{id}/stock` (admin)
- `POST /api/menuitems/{id}/restock` (admin)
- `POST /api/coupons` (admin)
- `GET /api/rates` (admin)
- `POST /api/rates` (admin)
- `GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD&currency=EUR` (admin)
- `POST /api/webhooks/payment`

<<<<<<< HEAD
👉 Full OpenAPI specs: [`docs/Testaurant_API_OpenAPI3.yaml`](docs/Testaurant_API_OpenAPI3.yaml) & [`docs/Testaurant_API_OpenAPI3.json`](docs/Testaurant_API_OpenAPI3.json)

=======
* `GET /api/health`
* `GET /api/menu`
* `GET /api/menu/{id}`
* `GET /api/categories`
* `POST /api/quote`
* `POST /api/orders`
* `GET /api/orders/{id}`
* `GET /api/orders` (admin)
* `PUT /api/orders/{id}/status` (admin)
* `POST /api/menuitems` (admin)
* `PUT /api/menuitems/{id}` (admin)
* `PUT /api/menuitems/{id}/availability` (admin)
* `PUT /api/menuitems/{id}/stock` (admin)
* `POST /api/menuitems/{id}/restock` (admin)
* `POST /api/coupons` (admin)
* `GET /api/rates` (admin)
* `POST /api/rates` (admin)
* `GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD&currency=EUR` (admin)
* `POST /api/webhooks/payment`

👉 Full OpenAPI specs: [`api_specs/Testaurant_API_OpenAPI3.yaml`](https://www.google.com/search?q=api_specs/Testaurant_API_OpenAPI3.yaml) & [`api_specs/Testaurant_API_OpenAPI3.json`](https://www.google.com/search?q=api_specs/Testaurant_API_OpenAPI3.json)

>>>>>>> d0acc127ab35fa178bf68a4d9fd03584f41a1b06
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
<<<<<<< HEAD
All **admin endpoints** require:
```
X-API-Key: qa-squad
```
You can change this in `api/config.php`.

---

## 🧪 QA Automation Playground
- Dedicated UI playground at [`/navigation.html`](https://apps.qualiadept.eu/testaurant/navigation.html)  
- Postman collection + environment in `/docs/`  
- OpenAPI 3.0 specs for Swagger/Redoc  
- Chaos hooks for resilience testing  
- Perfect for **API, UI, and load test automation practice**

---

## ⚠️ Security
- Do not commit `api/config.php` (add to `.gitignore`)
- Rotate secrets if leaked
- Use HTTPS in production

---

## 📄 License
© 2025 [QualiAdept](https://qualiadept.eu). For educational & QA automation practice.  
=======

All **admin endpoints** require an `X-API-Key` header.
The default key is:

```
qa-squad
```

`````
>>>>>>> d0acc127ab35fa178bf68a4d9fd03584f41a1b06
