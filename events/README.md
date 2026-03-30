# Event Locator Backend (Summative Project)

Node.js backend for a multi-user event locator app with authentication, event CRUD, location-based search, category preferences, i18n, queue-based notifications, favorites, reviews, and unit tests.

## Tech Stack

- Node.js + Express
- MySQL 8 (relational + geospatial distance via `ST_Distance_Sphere`)
- Redis + BullMQ (asynchronous notifications)
- i18next (internationalization)
- JWT + bcryptjs (authentication)
- Jest + Supertest (testing)

## Implemented Features (Assignment Mapping)

### 1) User Management
- Secure registration with bcrypt password hashing
- Login with JWT token generation
- User profile update (latitude, longitude, preferred language)
- Preferred categories support

### 2) Event Management (CRUD)
- Create event with title, description, date/time, coordinates, categories
- Get all events and single event
- Update and delete event (owner-only)

### 3) Location-Based Search + Category Filter
- Radius search endpoint uses MySQL geospatial distance:
	- `ST_Distance_Sphere(point(event_lng, event_lat), point(user_lng, user_lat))`
- Optional category filtering with `categoryIds`

### 4) Multilingual Support (i18n)
- Language files: English (`en`) and Spanish (`es`)
- Request language via header `x-language: en|es` or query `?lang=en|es`
- Localized API success/error messages

### 5) Notification System (Queue)
- Uses Redis + BullMQ queue `eventNotifications`
- Event creation queues notification job
- Upcoming events queue endpoint supports delayed jobs
- Worker included in `src/worker.js`

### 6) Unit Testing
- Auth service tests
- Search/controller tests
- Notification queue tests
- Health endpoint integration test

### 7) Additional Features Implemented
- Favorites (save/remove/list)
- Ratings & reviews

## Project Structure

```text
.
├── db/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── app.js
│   ├── server.js
│   ├── worker.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── locales/
└── tests/
```

## Database Schema (Normalized)

Defined in `db/schema.sql`.

Main entities and relationships:
- `users` (1) -> (M) `events` via `creator_id`
- `events` (M) <-> (M) `categories` via `event_categories`
- `users` (M) <-> (M) `categories` via `user_preferences`
- `users` (M) <-> (M) `events` via `favorites`
- `users` (1) -> (M) `reviews`, `events` (1) -> (M) `reviews`
- `notification_logs` stores queued/sent tracking

Normalization notes:
- Many-to-many relationships are separated into junction tables
- No repeated category/event preference columns inside base tables
- Unique constraints: email, category name, one review per user/event

## Environment Variables

Configured in `.env`:

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=levi
DB_PASSWORD=Levis250@
DB_NAME=app_event
JWT_SECRET=secret
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Setup Instructions

1. Create MySQL database tables:

```sql
SOURCE db/schema.sql;
SOURCE db/seed.sql;
```

2. Install dependencies:

```bash
npm install
```

3. Run API server:

```bash
npm run dev
```

4. Run queue worker (separate terminal):

```bash
node src/worker.js
```

5. Run tests:

```bash
npm test
```

## API Endpoints

Base path: `/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users
- `GET /users/me`
- `PATCH /users/me`
- `PUT /users/preferences`

### Categories
- `GET /categories`
- `POST /categories`

### Events
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `GET /events/search?latitude=..&longitude=..&radiusKm=..&categoryIds=1,2`
- `POST /events/notifications/upcoming`

### Reviews
- `GET /events/:eventId/reviews`
- `POST /events/:eventId/reviews`

### Favorites
- `GET /favorites`
- `POST /favorites/:eventId`
- `DELETE /favorites/:eventId`

## Technical Choices (Why)

- **MySQL chosen**: Relational, easy normalization, and supports geospatial distance function needed for radius search.
- **BullMQ + Redis**: Reliable queued async processing; suitable for notification fan-out and delayed jobs.
- **i18next**: Lightweight, mature i18n support and request-level language detection.
- **Repository + Service split**: Keeps controllers thin and easier to test.
- **Jest + Supertest**: Fast and straightforward for unit/integration backend tests.

## Challenges and Solutions

- **Challenge:** Supporting location search with MySQL (without PostGIS).
	- **Solution:** Used `ST_Distance_Sphere` on lat/long with indexed coordinate columns.
- **Challenge:** Matching event notifications to user preferences.
	- **Solution:** Normalized `user_preferences` and query users by preferred category IDs.
- **Challenge:** Multi-language messages across endpoints.
	- **Solution:** Centralized i18next middleware and locale JSON files.

## Video Demo Checklist (max 5 minutes)

- Show registration/login and JWT usage
- Show profile update + preferred categories
- Show event CRUD (including coordinates)
- Show radius + category search
- Show i18n response change with `x-language`
- Show notification queue trigger + worker logs
- Show test run (`npm test`)

## Notes

- Your instructor allows MySQL (PostgreSQL/PostGIS not mandatory), so this project is implemented with MySQL as requested.
