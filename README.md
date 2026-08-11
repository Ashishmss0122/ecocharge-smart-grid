# EcoCharge Hub

Build a complete full-stack web application called:

ECOCHARGE — Smart EV Charging Station Management System

IMPORTANT:

This is a college DevOps project. Build it as a REAL working full-stack application, not just a static UI or mockup.

TECH STACK

Frontend:

- React 18

- Vite

- Tailwind CSS

- React Router

- Framer Motion

- Lucide React

- Recharts

- Axios

Backend:

- Node.js

- Express.js

- REST APIs

- JWT authentication

- bcryptjs

- express-validator

- CORS

- dotenv

Database:

- MySQL

- mysql2 connection pool

Do NOT use MongoDB.

Do NOT use Firebase.

Do NOT use Supabase.

Do NOT use Flutter.

PROJECT STRUCTURE

EcoCharge/

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── layouts/

│   │   ├── services/

│   │   ├── contexts/

│   │   ├── hooks/

│   │   ├── utils/

│   │   └── App.jsx

│   └── package.json

│

├── backend/

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── models/

│   │   ├── routes/

│   │   ├── services/

│   │   └── app.js

│   ├── server.js

│   └── package.json

│

├── database/

│   ├── schema.sql

│   └── seed.sql

│

├── .env.example

├── docker-compose.yml

├── README.md

└── .github/

    └── workflows/

        └── ci.yml

==================================================

1. PRODUCT VISION

==================================================

EcoCharge is a smart EV charging station management platform.

The system connects three types of users:

1. EV User

2. Charging Station Owner

3. System Administrator

The main user journey should be:

Register/Login

→ User Dashboard

→ Find Charging Station

→ View Station Details

→ Check Charger Availability

→ Select Charger

→ Select Date & Time

→ Book Charger

→ Booking Confirmation

→ Generate QR Code

→ Simulate Charging Session

→ View Charging Cost

→ Complete Session

→ View Charging History

==================================================

2. VISUAL DESIGN

==================================================

Create a premium modern EV-tech interface.

Do NOT make it look like a generic CRUD college project.

Theme:

Primary background:

#071A17

Secondary background:

#0B2A24

Primary green:

#20C997

Bright accent:

#39E75F

Mint:

#B8F5D0

White:

#F5FFFA

Muted:

#8FAFA5

Use:

- dark green background

- emerald/eco green highlights

- subtle gradients

- glassmorphism cards

- soft glowing borders

- clean rounded cards

- smooth hover animations

- Framer Motion page transitions

- modern dashboard layout

- responsive design

Typography should feel modern and professional.

Use Lucide icons.

Avoid excessive neon effects.

The UI should look like a real commercial EV platform.

Brand:

ECOCHARGE

Tagline:

"Charge Smarter. Drive Greener."

==================================================

3. LANDING PAGE

==================================================

Create a beautiful landing page.

Hero:

ECOCHARGE

"Charge Smarter. Drive Greener."

Subtitle:

"Find, reserve and manage EV charging stations from one intelligent platform."

Buttons:

[Find a Charging Station]

[Get Started]

Show a visual EV charging illustration/card.

Include sections:

- How EcoCharge Works

- Smart Charging

- Station Discovery

- Easy Reservation

- Charging Analytics

- Why EcoCharge

- Call To Action

- Footer

Use subtle animations.

==================================================

4. AUTHENTICATION

==================================================

Create:

/login

/register

Registration fields:

Name

Email

Phone

Password

Confirm Password

Role

Roles:

EV User

Station Owner

Admin should NOT be selectable during public registration.

Implement:

- JWT authentication

- bcrypt password hashing

- protected routes

- role-based access control

- logout

- persistent login using localStorage

==================================================

5. DATABASE

==================================================

Create MySQL schema.

Tables:

users

vehicles

stations

chargers

bookings

charging_sessions

payments

reviews

complaints

Use proper:

- Primary keys

- Foreign keys

- indexes

- timestamps

- status fields

- constraints

Relationships:

User

→ Vehicles

Station

→ Chargers

User

→ Bookings

Charger

→ Bookings

Booking

→ Charging Session

Charging Session

→ Payment

User

→ Reviews

User

→ Complaints

==================================================

6. SEED DATA

==================================================

Create realistic Hyderabad EV charging stations.

Include at least:

1. EcoCharge Gachibowli

2. GreenVolt Hitech City

3. ChargeHub Madhapur

4. EV Power Banjara Hills

5. RapidCharge Secunderabad

Each station should have:

- name

- address

- latitude

- longitude

- operating hours

- rating

- amenities

- chargers

- charger type

- charging speed

- price per kWh

- availability

Example:

DC Fast Charger

60 kW

₹15/kWh

AC Charger

22 kW

₹10/kWh

Use realistic availability data.

==================================================

7. USER DASHBOARD

==================================================

Create a premium dashboard.

Display:

Current Vehicle

Battery Level

Nearby Stations

Recommended Station

Upcoming Booking

Recent Charging Sessions

Total Energy Used

Total Amount Spent

Example:

Battery:

42%

Nearby:

EcoCharge Gachibowli

2.4 km

4/6 chargers available

₹15/kWh

★★★★★

[View Station]

==================================================

8. STATION DISCOVERY

==================================================

Create:

/stations

Allow users to:

- search stations

- filter by distance

- filter by price

- filter by charger type

- filter by charging speed

- filter by availability

- sort by distance

- sort by price

- sort by rating

Create both:

List View

Map-style View

Do not require a real Google Maps API yet.

For now create a beautiful interactive map-style visualization using station coordinates/cards.

Make the architecture ready for future Google Maps integration.

==================================================

9. STATION DETAILS

==================================================

Create:

/stations/:id

Display:

Station Name

Address

Distance

Rating

Opening Hours

Amenities

Available Chargers

Charger cards:

Charger #01

DC Fast

60 kW

₹15/kWh

AVAILABLE

[Reserve]

==================================================

10. BOOKING SYSTEM

==================================================

Create:

/booking/:stationId

User selects:

Charger

Date

Start Time

Duration

Show:

Estimated Energy

Estimated Charging Cost

Charging Speed

Example:

Duration:

30 minutes

Estimated Energy:

30 kWh

Estimated Cost:

₹450

Prevent double booking.

A charger cannot have overlapping active bookings.

Create REST API:

POST /api/bookings

GET /api/bookings

GET /api/bookings/:id

PUT /api/bookings/:id/cancel

==================================================

11. BOOKING CONFIRMATION

==================================================

After successful booking:

Show a beautiful digital ticket.

Include:

EcoCharge

Booking ID

Station

Charger

Date

Time

Duration

Estimated Cost

Generate a QR code containing the booking ID.

Button:

[View Booking]

==================================================

12. CHARGING SESSION SIMULATION

==================================================

Create:

/charging/:bookingId

This is a SIMULATION only.

Do NOT require real EV hardware.

Display:

Battery:

42%

Animated charging progress:

42%

→

45%

→

50%

→

60%

→

70%

→

78%

Show:

Charging Duration

Energy Consumed

Current Cost

Charging Speed

Example:

Battery:

78%

Energy:

24.6 kWh

Cost:

₹369

Add:

[Start Charging]

[Stop Charging]

When stopped:

Generate final charging summary.

==================================================

13. PAYMENT

==================================================

Do NOT integrate a real payment gateway yet.

Create a simulated payment flow.

Display:

Energy Used

Price/kWh

Service Fee

Total

Example:

Energy: 24.6 kWh

Rate: ₹15/kWh

Total:

₹369

Button:

[Pay Now]

Then show:

Payment Successful ✓

Generate receipt.

==================================================

14. CHARGING HISTORY

==================================================

Create:

/history

Show previous sessions.

Each card:

Station

Date

Energy

Duration

Cost

Status

Add charts using Recharts:

Energy Usage

Monthly Spending

Charging Sessions

==================================================

15. USER PROFILE

==================================================

Create:

/profile

Allow:

Edit Profile

Manage Vehicles

Saved Stations

Charging Preferences

Logout

==================================================

16. STATION OWNER PORTAL

==================================================

Create separate owner dashboard:

/owner

Owner can:

View Stations

Add Station

Edit Station

Delete Station

Add Chargers

Edit Charger

Change Charger Price

Enable/Disable Charger

Mark Charger Under Maintenance

Dashboard metrics:

Total Stations

Total Chargers

Available Chargers

Today's Bookings

Today's Revenue

Monthly Revenue

Add charts using Recharts.

==================================================

17. ADMIN DASHBOARD

==================================================

Create:

/admin

Admin can view:

Total Users

Total Stations

Total Chargers

Total Bookings

Total Revenue

Active Sessions

Admin can:

Manage Users

Manage Station Owners

Approve Stations

Reject Stations

View Complaints

View Platform Analytics

Create attractive analytics charts.

==================================================

18. SMART FEATURES

==================================================

Build the architecture for smart recommendation.

DO NOT depend on an external AI API for the first version.

Create a recommendation algorithm.

Score stations based on:

Distance

Price

Charging Speed

Availability

Rating

Estimated Waiting Time

Example:

Station A

Distance: 2 km

Price: ₹15

Availability: High

Rating: 4.8

Recommendation:

"Best overall choice"

Show:

WHY THIS STATION?

✓ Short distance

✓ Fast charger available

✓ Low estimated waiting time

==================================================

19. WAIT TIME ESTIMATION

==================================================

Create a simple backend service.

Estimate waiting time using:

number of chargers

active sessions

queued bookings

available chargers

Example:

Estimated Waiting Time

8 minutes

If no waiting:

"Available Now"

==================================================

20. BACKEND API

==================================================

Create clean REST APIs.

Authentication:

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

Stations:

GET /api/stations

GET /api/stations/:id

POST /api/stations

PUT /api/stations/:id

DELETE /api/stations/:id

Chargers:

GET /api/stations/:id/chargers

POST /api/chargers

PUT /api/chargers/:id

Bookings:

POST /api/bookings

GET /api/bookings

GET /api/bookings/:id

PUT /api/bookings/:id/cancel

Charging:

POST /api/charging/start

PUT /api/charging/:id/progress

POST /api/charging/:id/stop

Payments:

POST /api/payments

GET /api/payments/:id

Recommendations:

GET /api/recommendations

==================================================

21. ERROR HANDLING

==================================================

Implement proper:

- API error handling

- validation

- loading states

- empty states

- authentication errors

- database errors

- duplicate booking errors

Frontend should show clean toast notifications.

==================================================

22. DEVOPS

==================================================

This is an important requirement.

Create:

Dockerfile for backend.

docker-compose.yml containing:

Node.js backend

MySQL

Create:

.github/workflows/ci.yml

CI pipeline should:

1. Checkout repository

2. Install frontend dependencies

3. Build frontend

4. Install backend dependencies

5. Run backend tests

6. Verify build

Use environment variables.

Create:

.env.example

Never hardcode database passwords or JWT secrets.

==================================================

23. TESTING

==================================================

Create backend tests for:

- registration

- login

- station retrieval

- booking creation

- duplicate booking prevention

- booking cancellation

- charging session

- cost calculation

- recommendation scoring

Use Jest + Supertest.

==================================================

24. GIT-FRIENDLY DEVELOPMENT

==================================================

Organize the project so four team members can work independently.

Suggested areas:

Member 1:

Frontend/User Experience

Member 2:

Backend/API/Authentication

Member 3:

MySQL/Booking/Charging Logic

Member 4:

Owner/Admin/DevOps/Testing

Do not put everything into one huge component.

Use reusable components and services.

==================================================

25. IMPORTANT DEVELOPMENT PRIORITY

==================================================

Do NOT try to make every feature fully advanced immediately.

FIRST PRIORITY:

1. Project setup

2. MySQL connection

3. Authentication

4. Station listing

5. Station details

6. Charger availability

7. Booking

8. QR confirmation

SECOND PRIORITY:

9. Charging simulation

10. Payment simulation

11. History

12. Owner dashboard

13. Admin dashboard

THIRD PRIORITY:

14. Smart recommendations

15. Wait-time prediction

16. Analytics

17. Docker

18. GitHub Actions

19. Deployment

Make the FIRST working flow:

Login

→ Dashboard

→ Stations

→ Station Details

→ Charger

→ Booking

→ QR Confirmation

fully functional before adding unnecessary advanced features.

==================================================

26. IMPORTANT OUTPUT REQUIREMENT

==================================================

After implementation:

1. Install all dependencies.

2. Verify frontend builds successfully.

3. Verify backend starts successfully.

4. Verify MySQL connection configuration.

5. Create schema.sql and seed.sql.

6. Create README.md with exact setup instructions.

7. Clearly list all environment variables.

8. Clearly list all API endpoints.

9. Do not leave obvious placeholder errors.

10. Keep the UI polished and responsive.

If a real external service such as Google Maps or payment gateway requires an API key, use a clean mock/simulation for now and document where the API key would later be added.

The final result should feel like a realistic commercial EV charging platform rather than a basic college CRUD application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ecocharge-smart-grid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3424edfa-7e54-4c40-9ef4-582d60d3a008).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
