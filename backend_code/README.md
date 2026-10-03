# Order Agent — Backend

Spring Boot 3.2.0 / Java 17 API for the purchasing-agent order tracking platform.
Same conventions as `finance-tracker/backend_code` (JWT stateless auth, Controller →
Service → Repository → Entity, DTOs, `GlobalExceptionHandler`).

## Roles

- **CUSTOMER** — self-registers via `/api/auth/register`. Can track cart items and
  view their own. This is also who the browser extension logs in as.
- **STAFF** — processes orders (view/update status, tracking number, notes).
- **ADMIN** — everything STAFF can do, plus creating STAFF/ADMIN accounts.

A bootstrap ADMIN is seeded on first run from `admin.bootstrap-email` /
`admin.bootstrap-password` (env vars `ADMIN_BOOTSTRAP_EMAIL` /
`ADMIN_BOOTSTRAP_PASSWORD`, defaults in `application.properties` — **change these
for anything beyond local dev**). Log in as that admin, then `POST
/api/staff/users` to create real staff accounts.

## Run locally

```bash
docker-compose -f docker-compose-backend.yml up -d   # Postgres on localhost:5433
mvn spring-boot:run                                   # API on localhost:8081
```

(Port 5433/8081 instead of finance-tracker's 5432/8080 so both can run side by side.)

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Customer signup → returns JWT |
| POST | `/api/auth/login` | public | Login (any role) → returns JWT + role |
| POST | `/api/cart-items` | CUSTOMER | Extension reports an add-to-cart event |
| GET | `/api/cart-items/me` | CUSTOMER | Customer's own tracked items |
| GET | `/api/staff/cart-items?status=` | STAFF/ADMIN | List all customers' items, optional status filter |
| GET | `/api/staff/cart-items/{id}` | STAFF/ADMIN | Item detail |
| PATCH | `/api/staff/cart-items/{id}` | STAFF/ADMIN | Update status/trackingNumber/staffNotes |
| POST | `/api/staff/users` | ADMIN | Create a STAFF/ADMIN account |

`CartItemStatus`: `NEW → PURCHASED → SHIPPED → DELIVERED`, or `CANCELLED` at any point.
Moving into `PURCHASED`/`SHIPPED`/`DELIVERED` auto-stamps the matching timestamp field.

## Next steps (not built yet)

- **staff_frontend/** — React app for staff to work the queue (build order: this is next).
- **customer_frontend/** — React app for customers to track their items.
- The existing `order-tracking-extension` (built earlier, in `D:\workspace\order-tracking-extension`)
  needs updating to match this API: change its trigger from "order submitted" to
  "added to cart" (`加入购物车` / `加入采购车` labels), add a login-based popup that
  calls `POST /api/auth/login` and stores the returned JWT, and point its POST at
  `http://localhost:8081/api/cart-items` with `Authorization: Bearer <token>`.
