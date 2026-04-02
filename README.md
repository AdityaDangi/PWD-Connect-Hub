# 🏗️ PWD Connect Hub — Dangi Brother's Company

> A professional construction project management platform for managing PWD projects, contractors, labor, materials, pricing, and payments — all in one place.

## 🌐 Live Demo

🔗 **Deployed:** [https://pwd-connect-hub.up.railway.app](https://pwd-connect-hub.up.railway.app)
🖥️ **Local:** [http://localhost:3000](http://localhost:3000)

---

## 📸 Features

- 📊 **Dashboard** — Live stats for projects, contractors, labor, materials & payments
- 📁 **Projects** — Full CRUD with budget tracking, progress, and contractor assignment
- 👷 **Contractors** — Manage verified contractors with ratings and license info
- 🦺 **Labor** — Track skilled workers, daily rates, and project assignments
- 🧱 **Materials** — Inventory management with stock status and supplier info
- 💰 **Pricing** — Rate schedule with GST support for materials, labor & equipment
- 💳 **Payments** — Record and track payments with status (Paid / Pending)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Deployment | Railway |

---

## 📁 Project Structure

```
pwd-connect-hub/
├── backend/
│   ├── server.js        # Express server & API routes
│   ├── db.js            # SQLite setup & seed data
│   └── routes/          # Route handlers (projects, contractors, etc.)
├── frontend/
│   ├── index.html       # Single-page app
│   ├── css/style.css    # Styles
│   └── js/app.js        # Frontend logic
├── package.json
└── railway.json         # Railway deployment config
```

---

## ☁️ Deployment (Railway)

This project is deployed on [Railway](https://railway.app) with a persistent volume for SQLite.

| Variable | Value |
|----------|-------|
| `DB_PATH` | `/data/pwd_hub.db` |
| Volume mount | `/data` |

---

## 👤 Author

**Aditya Dangi** — Dangi Brother's Company
📧 18adityadangi@gmail.com
📞 9896092421
