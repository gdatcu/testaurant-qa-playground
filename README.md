````markdown
# 🍕 Testaurant QA Playground – PLUS (PHP + MySQL)

A **demo application** for QA automation engineers to **learn and practice test automation**.  
It simulates a restaurant ordering system with a full frontend, a complete set of UI testing challenges, and a backend API.

👉 Hosted at: [apps.qualiadept.eu/testaurant](https://apps.qualiadept.eu/testaurant)

---

## 🧭 UI Test Automation Playground

This project includes a comprehensive set of dedicated pages for practicing UI automation. It covers a wide range of scenarios, from basic element interactions to advanced, modern web challenges.

➡️ **[Launch the UI Playground](https://apps.qualiadept.eu/testaurant/navigation.html)**

### Test Categories Available:
* **Basic Form Elements:** Practice with standard inputs, logins, checkboxes, radio buttons, dropdowns, file uploads, and complex forms.
* **User Interactions:** Test skills with links, static & dynamic tables, hover actions, drag and drop, keyboard events, and various mouse clicks.
* **Advanced Scenarios:** Tackle challenges like browser alerts, frames, widgets, dynamic content, slow-loading elements, accordions, Shadow DOM, SVG, and A/B testing.

---

## 🧪 API Features
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

## 🚀 API Quick Start

### 1. Database
```sql
CREATE DATABASE testaurant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'testaurant_user'@'%' IDENTIFIED BY 'qa_pass_123';
GRANT ALL PRIVILEGES ON testaurant.* TO 'testaurant_user'@'%';
FLUSH PRIVILEGES;
````

```bash
# Then import the seed file
mysql -u testaurant_user -pqa_pass_123 testaurant < api/seed.sql
```

### 2. API Config

Copy `api/config.php.example` to `api/config.php` and fill in your database credentials.

### 3. Web Server

Point your web server (Apache/Nginx) document root to the project's root directory.
Ensure `mod_rewrite` is enabled for clean URLs.

---

## 📄 API Documentation

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

All **admin endpoints** require an `X-API-Key` header.
The default key is:

```
qa-squad
```

`````
