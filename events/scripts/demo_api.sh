#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-demo.$(date +%s)@example.com}"
PASSWORD="${PASSWORD:-password123}"
NAME="${NAME:-Demo User}"

echo "== Event Locator API Demo =="
echo "BASE_URL=$BASE_URL"
echo "EMAIL=$EMAIL"

json_get() {
  local body="$1"
  local expr="$2"
  echo "$body" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d); const path='$expr'.split('.'); let cur=j; for (const p of path){ if(!p) continue; cur=cur?.[p]; } console.log(cur===undefined?'':cur);});"
}

call() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local body="${4:-}"

  if [[ -n "$token" && -n "$body" ]]; then
    curl -sS -X "$method" "$url" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$body"
  elif [[ -n "$token" ]]; then
    curl -sS -X "$method" "$url" -H "Authorization: Bearer $token"
  elif [[ -n "$body" ]]; then
    curl -sS -X "$method" "$url" -H "Content-Type: application/json" -d "$body"
  else
    curl -sS -X "$method" "$url"
  fi
}

echo "\n1) Health"
HEALTH=$(call GET "$BASE_URL/api/health")
echo "$HEALTH"

echo "\n2) Register"
REGISTER_BODY=$(cat <<JSON
{"name":"$NAME","email":"$EMAIL","password":"$PASSWORD","latitude":-1.9441,"longitude":30.0619,"preferredLanguage":"en","preferredCategoryIds":[1]}
JSON
)
REGISTER_RES=$(call POST "$BASE_URL/api/auth/register" "" "$REGISTER_BODY" || true)
echo "$REGISTER_RES"

echo "\n3) Login"
LOGIN_BODY=$(cat <<JSON
{"email":"$EMAIL","password":"$PASSWORD"}
JSON
)
LOGIN_RES=$(call POST "$BASE_URL/api/auth/login" "" "$LOGIN_BODY")
echo "$LOGIN_RES"
TOKEN=$(json_get "$LOGIN_RES" "data.token")
if [[ -z "$TOKEN" ]]; then
  echo "Login failed: token missing"
  exit 1
fi

echo "\n4) Get Me"
ME_RES=$(call GET "$BASE_URL/api/users/me" "$TOKEN")
echo "$ME_RES"

echo "\n5) List Categories"
CATS=$(call GET "$BASE_URL/api/categories")
echo "$CATS"

echo "\n6) Create Category"
CREATE_CAT=$(call POST "$BASE_URL/api/categories" "$TOKEN" '{"name":"Workshop"}' || true)
echo "$CREATE_CAT"

echo "\n7) Create Event"
CREATE_EVENT_BODY=$(cat <<JSON
{"title":"Kigali JS Meetup","description":"Node.js practical session","eventDate":"2026-05-15T10:00:00.000Z","latitude":-1.9441,"longitude":30.0619,"categoryIds":[1]}
JSON
)
CREATE_EVENT=$(call POST "$BASE_URL/api/events" "$TOKEN" "$CREATE_EVENT_BODY")
echo "$CREATE_EVENT"
EVENT_ID=$(json_get "$CREATE_EVENT" "data.id")
if [[ -z "$EVENT_ID" ]]; then
  echo "Event creation failed: event id missing"
  exit 1
fi

echo "\n8) Search Events"
SEARCH=$(call GET "$BASE_URL/api/events/search?latitude=-1.9441&longitude=30.0619&radiusKm=20&categoryIds=1")
echo "$SEARCH"

echo "\n9) Add Review"
ADD_REVIEW=$(call POST "$BASE_URL/api/events/$EVENT_ID/reviews" "$TOKEN" '{"rating":5,"comment":"Excellent event"}')
echo "$ADD_REVIEW"

echo "\n10) Add Favorite"
ADD_FAV=$(call POST "$BASE_URL/api/favorites/$EVENT_ID" "$TOKEN")
echo "$ADD_FAV"

echo "\n11) List Favorites"
LIST_FAV=$(call GET "$BASE_URL/api/favorites" "$TOKEN")
echo "$LIST_FAV"

echo "\n12) Queue Upcoming Notifications"
QUEUE=$(call POST "$BASE_URL/api/events/notifications/upcoming" "$TOKEN" '{"hours":24}')
echo "$QUEUE"

echo "\n13) Cleanup (remove favorite + delete event)"
DEL_FAV=$(call DELETE "$BASE_URL/api/favorites/$EVENT_ID" "$TOKEN")
echo "$DEL_FAV"
DEL_EVENT=$(call DELETE "$BASE_URL/api/events/$EVENT_ID" "$TOKEN")
echo "$DEL_EVENT"

echo "\nDemo complete."
