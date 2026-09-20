# E-commerce API

A production-style REST API for an e-commerce platform, built as a backend learning project. It covers authentication, a searchable product catalog, cart management, Stripe-powered checkout, and an admin panel — with the kind of hardening (rate limiting, structured logging, transactional stock handling) you'd expect from a real backend, not just a CRUD demo.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Makefile Commands](#makefile-commands)
- [Key Design Decisions](#key-design-decisions)
- [License](#license)

## Features

- **Authentication** — registration, login, JWT access + refresh tokens with rotation, httpOnly refresh cookie, logout revocation
- **Product catalog** — full-text search, category filtering, price range, sorting, pagination
- **Categories** — organize products in categories, to enable filtering by category
- **Cart** — add, update, remove, clear, with live stock validation and computed totals
- **Checkout & payments** — Stripe integration, race-safe stock deduction via atomic DB transactions, webhook-driven order confirmation
- **Addresses** — saved shipping addresses with automatic default-address management
- **Admin panel** — product/category/inventory management, order status management with automatic restocking, revenue dashboard, low-stock alerts, user account management
- **Hardened by default** — rate limiting (stricter on auth routes), Helmet, CORS, structured logging, graceful shutdown
- **Fully documented** — interactive Swagger UI generated directly from the Zod validators, so the docs can't drift out of sync with the code
- **Dockerized** — multi-stage build, non-root runtime user, health checks, migrations run automatically on container start

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20, TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh, rotation), bcrypt |
| Validation | Zod |
| Payments | Stripe |
| Docs | OpenAPI 3.0 via `@asteasolutions/zod-to-openapi` + Swagger UI |
| Logging | Winston + Morgan |
| Testing | Postman |
| Containerization | Docker, Docker Compose |

## Project Structure

```bash
docker/
└── entrypoint.sh              # DB migrations executing and running app at container start

prisma/
├── schema.prisma              # data model
└── migrations/                # migration history

src/
├── config/                    # Prisma client, Stripe client
├── controllers/               # thin HTTP layer — calls services, formats responses
├── docs/                      # OpenAPI schema definitions and path registrations
├── middlewares/               # auth, validation, rate limiting, error handling, logging
├── routes/                    # route definitions per resource
├── services/                  # business logic — the only layer that talks to Prisma
├── types/                     # shared TypeScript types, Express Request augmentation
├── utils/                     # AppError, response formatter, logger, slugify
├── validators/                # Zod schemas — the single source of truth for both
│                              # request validation AND the generated API docs
├── app.ts                     # Express app assembly (middleware order matters — see comments)
└── server.ts                  # entry point, graceful shutdown handling

└── .dockerignore              # files that are excluded from docker image
└── .env.example               # example of a valid environment variables
└── .gitignore                 # files that are ignored by git (node_modules, .env, ...)
└──  docker-compose.yaml       # defines application services
└──  Dockerfile                # instructions for building the application
└──  Makefile                  # compose automation
└──  package-lock.json         # package version controller
└──  package.json              # dependencies and app configuration
└──  prisma.config.ts          # Prisma ORM configuration
└──  README.md                 # introduction and user guide for repository
└──  tsconfig.json             # typescript configuration
```

Each module (auth, products, categories, cart, orders, addresses, admin) follows the same layering: `route → middleware (auth/validation) → controller → service → Prisma`. Controllers never contain business logic or touch Prisma directly.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker, if you're using the containerized setup)
- A Stripe account (free) for test-mode API keys
- Docker & Docker Compose (optional, for the containerized setup)

### Local Setup

```bash
git clone https://github.com/Mohamed-ait-alla/ecomerce-api.git
cd ecommerce-api
npm install

cp .env.example .env
# fill in DATABASE_URL, JWT secrets, Stripe keys, etc. — see Environment Variables below

npx prisma migrate dev
npx prisma generate

npm run dev
```

The API is now running at `http://localhost:3000`. Check `http://localhost:3000/health` to confirm.

### Docker Setup

A `Makefile` wraps the common Docker Compose commands:

```bash
cp .env.example .env
# fill in your values

make build   # build the API image
make up      # start Postgres + API (migrations run automatically on startup)
make logs    # tail logs from both containers
make ps      # see container status
make down    # stop containers
make clean   # stop containers, remove volumes and orphaned containers
make fclean  # full teardown, including images and build cache
make re      # fclean + build + up, in one step
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | `development`, `production`, or `test` | `development` |
| `PORT` | Port the server listens on | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ecommerce` |
| `DATABASE_USER` | Database user | postgres |
| `DATABASE_PASSWORD` | Database password | — |
| `DATABASE_NAME` | Database name | ecommerece |
| `JWT_ACCESS_SECRET` | Signing secret for access tokens (32+ chars) | — |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens (32+ chars) | — |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor | `10` |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `CURRENCY` | Currency code for Stripe payment intents | `usd` |
| `TAX_RATE` | Flat tax rate applied at checkout (0–1) | `0` |
| `SHIPPING_COST` | Flat shipping cost added at checkout | `5` |

Generate strong JWT secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note:** there is intentionally no API endpoint to promote a user to `ADMIN` — this is a deliberate security decision, not an oversight. Promote a user directly in the database (e.g. via `npx prisma studio`) after registering their account normally.

## API Documentation

Once the server is running, interactive documentation is available at:

```
http://localhost:3000/api-docs
```

## Testing

This project is tested manually via Postman rather than an automated test suite.

A typical manual test pass follows the natural dependency order between modules:

1. **Auth** — register a user, confirm the access/refresh tokens come back; log in with the same credentials; hit `/auth/me` with the access token.
2. **Catalog** — promote a user to `ADMIN` directly in the database (see [Environment Variables](#environment-variables)), then create a category and a product; confirm both are visible via the public `GET` endpoints.
3. **Cart** — add the product to a regular user's cart, update its quantity, confirm stock limits are enforced.
4. **Addresses** — add a shipping address for the user.
5. **Checkout** — check out the cart, confirm a `PENDING` order is created with a Stripe `clientSecret`; trigger a test webhook event (via the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe trigger payment_intent.succeeded`) and confirm the order flips to `PAID`.
6. **Admin** — check the dashboard reflects the new order's revenue, adjust inventory, and confirm the low-stock endpoint picks up any product near its threshold.

## Key Design Decisions

A few decisions worth knowing about if you're reading through the code:

- **Snapshotted order data** — `OrderItem` stores the product name and price at time of purchase, independent of the live `Product` record, so price changes or product deletions never alter historical orders.
- **Soft deletes on products** — deleting a product sets `isActive: false` rather than removing the row, since past orders reference it.
- **Atomic stock decrement at checkout** — uses a conditional `UPDATE ... WHERE stock >= quantity` inside a database transaction, so two simultaneous checkouts for the last unit of a product can't both succeed. See `src/services/order.service.ts`.
- **Refresh token rotation** — every refresh invalidates the previous refresh token and issues a new one, limiting the damage if a token is ever stolen.
- **No self-service admin promotion** — by design, there's no endpoint that lets any account become an admin; it must be done directly against the database.
- **Docs generated from validators, not hand-written** — the OpenAPI spec in `src/docs/openapi.ts` references the actual Zod schemas used for request validation, so the documentation can't silently drift from what the API really accepts.

## License

This project was built as a personal learning exercise. Feel free to use it as a reference or starting point for your own work.
