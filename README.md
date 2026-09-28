# EVE Healthcare Backend Assignment

Backend API for a healthcare diagnostic booking system.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcryptjs
- Jest
- Supertest

## Features

- User signup and login
- JWT-based authentication
- Diagnostic centres
- Diagnostic tests
- Centre-test mapping with prices
- Test bookings
- Simulated payments
- Payment webhooks
- Idempotent webhook processing
- Booking cancellation
- Input validation
- Authorization checks
- Automated API tests

## Project Structure

```text
src/
├── config/
│   └── database.js
├── controllers/
│   ├── auth.controller.js
│   ├── centre.controller.js
│   ├── test.controller.js
│   ├── booking.controller.js
│   └── payment.controller.js
├── middleware/
│   └── auth.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── centre.routes.js
│   ├── test.routes.js
│   ├── booking.routes.js
│   └── payment.routes.js
├── app.js
└── server.js

prisma/
└── schema.prisma

tests/
└── api.test.js