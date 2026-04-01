

## 5) Step-by-Step Demo Script (What to Say in Presentation)

Use this speaking script while clicking each request in Postman.

### Demo intro (say this first)
"Hello, my name is Sarah Kasande. In this demo I will test all Event Locator API endpoints using Postman, including authentication, user profile, categories, events, search, reviews, favorites, notifications, and cleanup."

### 1. Health Check
Request: `GET /api/health`

Say:
"First, I verify that the API server is running. The health endpoint returns success with status 200."

### 2. Register User
Request: `POST /api/auth/register`

Say:
"Now I register a new user with the name Sarah Kasande and email s.kasande@alustudent.com. If the user already exists, 409 is also acceptable."

### 3. Login User
Request: `POST /api/auth/login`

Say:
"Next, I log in with Sarah’s credentials. The API returns a JWT token, and Postman automatically stores it in the token variable."

### 4. Get Profile
Request: `GET /api/users/me`

Say:
"Now I fetch the current user profile using the Bearer token to confirm authentication is working."

### 5. Update Profile
Request: `PATCH /api/users/me`

Say:
"I update location and language preferences for the logged-in user. This demonstrates profile update functionality."

### 6. Update Category Preferences
Request: `PUT /api/users/preferences`

Say:
"Now I update preferred category IDs to personalize Sarah’s event recommendations."

### 7. List Categories
Request: `GET /api/categories`

Say:
"I list available categories to confirm category retrieval and to identify IDs for event creation."

### 8. Create Category
Request: `POST /api/categories`

Say:
"Here I create a new category called Workshop. This confirms category creation works for authenticated users."

### 9. Create Event
Request: `POST /api/events`

Say:
"Now I create an event with title, description, event date, location coordinates, and category IDs. Postman saves the returned event ID automatically."

### 10. List Events
Request: `GET /api/events`

Say:
"I retrieve all events to verify the newly created event appears in the list."

### 11. Get Event by ID
Request: `GET /api/events/{{eventId}}`

Say:
"I fetch one event by ID to validate the detail endpoint."

### 12. Search by Location + Category
Request: `GET /api/events/search?...`

Say:
"This endpoint searches events by latitude, longitude, radius in kilometers, and category. It demonstrates geospatial filtering."

### 13. Update Event
Request: `PATCH /api/events/{{eventId}}`

Say:
"Now I update the event title and description to confirm event update functionality."

### 14. Add Review
Request: `POST /api/events/{{eventId}}/reviews`

Say:
"I submit a 5-star review and comment for the event."

### 15. List Reviews
Request: `GET /api/events/{{eventId}}/reviews`

Say:
"I retrieve all reviews for this event to verify the posted review is saved."

### 16. Add Favorite
Request: `POST /api/favorites/{{eventId}}`

Say:
"Now I add this event to Sarah’s favorites list."

### 17. List Favorites
Request: `GET /api/favorites`

Say:
"I fetch favorites to verify the event was successfully bookmarked."

### 18. Queue Upcoming Notifications
Request: `POST /api/events/notifications/upcoming`

Say:
"This request queues notifications for upcoming events within the next 24 hours."

### 19. Remove Favorite
Request: `DELETE /api/favorites/{{eventId}}`

Say:
"I remove the event from favorites as part of cleanup."

### 20. Delete Event
Request: `DELETE /api/events/{{eventId}}`

Say:
"Finally, I delete the created event to keep the system clean after testing."

### Demo closing (say this last)
"This completes the full API demo: authentication, user profile, categories, events CRUD, search, reviews, favorites, and notification queue endpoints are all tested successfully."

---

## 6) Example Request Bodies (Postman Raw JSON)

### Register
```json
{
  "name": "Sarah Kasande",
  "email": "s.kasande@alustudent.com",
  "password": "{{userPassword}}",
  "latitude": -1.9441,
  "longitude": 30.0619,
  "preferredLanguage": "en",
  "preferredCategoryIds": [1]
}
```

### Login
```json
{
  "email": "s.kasande@alustudent.com",
  "password": "{{userPassword}}"
}
```

### Create Event
```json
{
  "title": "Kigali JS Meetup",
  "description": "Node.js and API design session",
  "eventDate": "2026-05-15T10:00:00.000Z",
  "latitude": -1.9441,
  "longitude": 30.0619,
  "categoryIds": [1]
}
```

### Add Review
```json
{
  "rating": 5,
  "comment": "Great event, very practical!"
}
```

### Queue Notifications
```json
{
  "hours": 24
}
```

---

## 7) Built-In Postman Tests (Already Included)

The collection already has automated tests for key checks:

- Health status = `200`
- Register status = `201` or `409`
- Login status = `200` and token exists
- Create event status = `201` and event ID exists
- Auto-save:
  - `token` from login response
  - `eventId` from create-event response

---

## 8) Demo Script (One-Command API Walkthrough)

Script path: `scripts/demo_api.sh`

### Make executable
```bash
chmod +x scripts/demo_api.sh
```

### Run with defaults
```bash
./scripts/demo_api.sh
```

### Run with custom variables
```bash
BASE_URL=http://localhost:3000 \
EMAIL=s.kasande@alustudent.com \
PASSWORD=password123 \
NAME="Sarah Kasande" \
./scripts/demo_api.sh
```

The script demonstrates:
- Health check
- Register/login
- Profile + category operations
- Event create/search/update
- Review + favorite flow
- Notification queue trigger
- Cleanup (remove favorite + delete event)

---

## 9) Quick Pre-Run Checklist

Before running Postman collection or demo script:

1. API server is running on `http://localhost:3000`
2. Database is up and migrated
3. Seed/category data exists (especially category id `1`)
4. Redis/queue service is running (for notification endpoint)

---

## 10) Submission Usage Note

For assignment/demo submission, include:

- `postman/EventLocator.postman_collection.json`
- `postman/EventLocator.postman_environment.json`
- `scripts/demo_api.sh`
- This document: `POSTMAN_TEST_AND_DEMO_DOC.md`

This is the exact test format reviewers can run directly.
