# ECOCHARGE — Smart EV Charging Station Management System

A real, working full-stack EV charging platform: three roles (EV User, Station Owner, Admin), live database, real bookings, simulated charging and payments, analytics, and smart recommendations.

## Stack note (important)

This environment runs one React app with a built-in backend (server functions) and a managed Postgres database — it cannot run a separate Express process or MySQL. So the app is built here as a genuinely functional full-stack system: real auth, real tables, real API layer, real persistence. Where your brief says "Express route", the equivalent is a typed server function; where it says MySQL, it is Postgres with the same schema, keys, indexes and constraints.

## Design

Dark eco-tech theme, glassmorphism, soft glow borders, Framer Motion transitions, Lucide icons, Recharts charts, fully responsive.

Palette: bg `#071A17`, surface `#0B2A24`, primary `#20C997`, accent `#39E75F`, mint `#B8F5D0`, text `#F5FFFA`, muted `#8FAFA5`. All as design tokens — no hardcoded colors in components.

## Data model

`profiles`, `user_roles`, `vehicles`, `stations`, `chargers`, `bookings`, `charging_sessions`, `payments`, `reviews`, `complaints`, `saved_stations` — with foreign keys, indexes, status enums, timestamps, row-level security per role, and grants.

Roles live in a separate `user_roles` table with a security-definer `has_role()` check (never on the profile row) so owners/admins can't be spoofed from the client.

Seeded with 5 realistic Hyderabad stations (EcoCharge Gachibowli, GreenVolt Hitech City, ChargeHub Madhapur, EV Power Banjara Hills, RapidCharge Secunderabad), each with coordinates, hours, rating, amenities, and a mix of DC Fast (60 kW, ₹15/kWh) and AC (22 kW, ₹10/kWh) chargers.

## Pages

Public: `/` landing (hero, how it works, features, why, CTA, footer), `/login`, `/register` (EV User or Station Owner only).

EV User: `/dashboard` (vehicle, battery, nearby + recommended station, upcoming booking, totals), `/stations` (search + filters for distance/price/type/speed/availability, sort, list view and coordinate-based map view), `/stations/:id`, `/booking/:stationId`, `/booking/:id/confirmation` (digital ticket + QR), `/charging/:bookingId` (animated simulation, start/stop, live energy and cost), `/payment/:sessionId` (breakdown, pay, receipt), `/history` (session cards + Recharts energy/spend/session charts), `/profile` (edit profile, vehicles, saved stations, preferences).

Owner `/owner`: metrics (stations, chargers, availability, today's bookings, today's and monthly revenue), station CRUD, charger CRUD with price, enable/disable, maintenance state, revenue charts.

Admin `/admin`: platform totals, active sessions, user and owner management, station approve/reject, complaints, analytics charts.

## Core logic

- Booking overlap check enforced server-side plus a database exclusion constraint — a charger can never be double-booked.
- Cost = energy (kW × hours) × price/kWh + service fee, computed server-side.
- Wait-time service from charger count, active sessions, queued bookings → "Available Now" or "~N minutes".
- Recommendation scoring over distance, price, speed, availability, rating, wait time, with a "Why this station?" reason list.

## Technical notes

- API layer as typed server functions grouped by domain (auth, stations, chargers, bookings, charging, payments, recommendations, admin, owner), mirroring your REST endpoint list one-to-one.
- Zod validation on every input; toast notifications; loading, empty, and error states throughout.
- Signup signs in instantly (no email confirmation) for demos.
- Reusable components and services split so four members can work in parallel: UI/pages, auth/API, booking/charging logic, owner/admin/analytics.
- README with setup, environment variables, full endpoint list, schema overview, and a DevOps section (Dockerfile, docker-compose, GitHub Actions CI) documented for your submission, noting where Maps/payment gateway keys would plug in later.

## Build order

1. Database + seed, auth, roles, landing/login/register
2. Stations, details, chargers, booking, QR confirmation
3. Charging simulation, payment, history
4. Owner and admin dashboards
5. Recommendations, wait time, analytics, docs
