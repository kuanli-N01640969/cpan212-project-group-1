## M2 Video recordings
Maliki Cornwall-Douglas and Abeer Rashid: https://youtu.be/SH_FgKN1pHE
- live demo
- Abeer Rashid @AbeerRashid
- Maliki Cornwall-Douglas @MalikiC-D

## M3 Video recordings

Owen Fedchenko (owenfdeds): https://youtu.be/gTUOPDgXm9k
- live demo

# cpan212-project-group-1
# Calorie Goal Tracker
## Team Members
- Kuan Yi Li @kuanli-N01640969
- Abeer Rashid @AbeerRashid
- Owen Fedchenko @owenfeds
- Maliki Cornwall-Douglas @MalikiC-D

## M2 EXPRESS REST API
### Abeer Rashid (AbeerRashid)
- **AI Use:** For the development of the M2 portion, I utilized AI-assisted tools (Google Gemini) to brainstorm for architectural design patterns, debugging support, and understanding concepts bette to implement them into the design. Also to better understand how it ties together in simple terms to make navigation better for myself.

### Maliki Cornwall-Douglas (MalikiC-D)

# API Backend - Milestone 2

Express 5 REST API for the Calorie Goal Tracker. Data is stored in memory (it resets every time the server restarts) and food lookups come from the USDA FoodData Central API.

## Setup

1. Use Node 24.
2. From the **project root** (the folder with `package.json`), install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and make sure it contains your own USDA key under the name the server reads, `USDA_API_KEY` (free key: https://fdc.nal.usda.gov/api-key-signup.html):
   ```
   PORT=4000
   USDA_API_KEY=your_key_here
   ```
   `.env` is git-ignored. Never commit it or paste your key into the README.
5. Start the server on port 4000:
   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 4000) | Port the server listens on |
| `USDA_API_KEY` | Yes, for `/api/usda/search` | USDA FoodData Central API key |

## Endpoints

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/logs` | List all daily logs | 200 | 500 |
| GET | `/api/logs/:id` | Get one daily log | 200 | 404 |
| POST | `/api/logs` | Create a daily log (`date`, `targetCalories`) | 201 | 400 |
| PUT | `/api/logs/:id` | Update a daily log | 200 | 400, 404 |
| DELETE | `/api/logs/:id` | Delete a daily log and its meals | 204 | 404 |
| GET | `/api/logs/:logId/meals` | List the meals for a log | 200 | 404 |
| POST | `/api/logs/:logId/meals` | Add a meal to a log | 201 | 400, 404 |
| GET | `/api/meals/:id` | Get one meal entry | 200 | 404 |
| PUT | `/api/meals/:id` | Update a meal entry (recalculates calories) | 200 | 400, 404 |
| DELETE | `/api/meals/:id` | Delete a meal entry | 204 | 404 |
| GET | `/api/usda/search?query=apple` | Search USDA foods (cached for 1 hour) | 200 | 400, 500, 502, 504 |

Validation errors (400) return `error.details`, a list of each bad field and why it failed.

## Testing (curl, run in Git Bash)

Start the server first (`npm run dev`). The sample data has log `log-1` and meal `meal-1`. Restart the server to reset the data.

### Daily logs

```bash
# List all logs -> 200
curl -i http://localhost:4000/api/logs

# Get one log -> 200
curl -i http://localhost:4000/api/logs/log-1

# Create a log -> 201
curl -i -X POST http://localhost:4000/api/logs -H "Content-Type: application/json" -d '{"date":"2026-10-19","targetCalories":2200}'

# Update a log -> 200
curl -i -X PUT http://localhost:4000/api/logs/log-1 -H "Content-Type: application/json" -d '{"targetCalories":2500}'
```

### Meals

```bash
# List the meals for a log -> 200
curl -i http://localhost:4000/api/logs/log-1/meals

# Add a meal to a log -> 201
curl -i -X POST http://localhost:4000/api/logs/log-1/meals -H "Content-Type: application/json" -d '{"category":"dinner","foodName":"Salmon","fdcId":175167,"servings":2,"servingSize":100,"servingSizeUnit":"g","caloriesPerServing":208}'

# Get one meal -> 200
curl -i http://localhost:4000/api/meals/meal-1

# Update a meal -> 200
curl -i -X PUT http://localhost:4000/api/meals/meal-1 -H "Content-Type: application/json" -d '{"servings":3}'
```

### USDA search (run the same search twice; the server terminal shows a cache miss, then a cache hit)

```bash
# First call -> 200 (terminal logs a cache miss)
curl -i "http://localhost:4000/api/usda/search?query=apple"

# Second call -> 200 (terminal logs a cache hit)
curl -i "http://localhost:4000/api/usda/search?query=apple"

# Missing query -> 400
curl -i "http://localhost:4000/api/usda/search"
```

### Validation failures -> 400

```bash
# Empty body when creating a log -> 400
curl -i -X POST http://localhost:4000/api/logs -H "Content-Type: application/json" -d '{}'

# Bad values when creating a log -> 400
curl -i -X POST http://localhost:4000/api/logs -H "Content-Type: application/json" -d '{"date":"2026-13-45","targetCalories":-5}'

# Bad value when updating a log -> 400
curl -i -X PUT http://localhost:4000/api/logs/log-1 -H "Content-Type: application/json" -d '{"targetCalories":"lots"}'

# Bad values when creating a meal -> 400
curl -i -X POST http://localhost:4000/api/logs/log-1/meals -H "Content-Type: application/json" -d '{"category":"snack","foodName":"","fdcId":1.5,"servings":0,"servingSize":100,"servingSizeUnit":"g","caloriesPerServing":-1}'

# Bad value when updating a meal -> 400
curl -i -X PUT http://localhost:4000/api/meals/meal-1 -H "Content-Type: application/json" -d '{"servings":"lots"}'
```

### Not found -> 404

```bash
# Unknown log ID -> 404
curl -i http://localhost:4000/api/logs/does-not-exist

# Unknown meal ID -> 404
curl -i http://localhost:4000/api/meals/does-not-exist

# Meals for an unknown log -> 404
curl -i http://localhost:4000/api/logs/does-not-exist/meals

# Update an unknown log -> 404
curl -i -X PUT http://localhost:4000/api/logs/does-not-exist -H "Content-Type: application/json" -d '{"targetCalories":2500}'

# Update an unknown meal -> 404
curl -i -X PUT http://localhost:4000/api/meals/does-not-exist -H "Content-Type: application/json" -d '{"servings":3}'

# Route that doesn't exist -> 404
curl -i http://localhost:4000/api/not-a-route
```

### Deletes

Run these last, because they remove sample data.

```bash
# Delete a meal -> 204
curl -i -X DELETE http://localhost:4000/api/meals/meal-1

# Delete a log (also removes its meals) -> 204
curl -i -X DELETE http://localhost:4000/api/logs/log-1

# Delete an unknown log -> 404
curl -i -X DELETE http://localhost:4000/api/logs/does-not-exist
```

---

## M4: Database Persistence (MongoDB & Mongoose)

### Environment Setup
1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Fill in your local secrets in `.env` (never commit `.env`):
   ```env
   PORT=4000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/calorie_tracker?retryWrites=true&w=majority
   USDA_API_KEY=<your-usda-api-key>
   ```
3. Install dependencies and seed the database:
   ```bash
   npm install
   npm run seed
   ```
4. Start the Express API (port `4000`) and Next.js frontend (port `3000`) in separate terminals:
   ```bash
   # Terminal 1 (project root)
   npm run dev

   # Terminal 2 (frontend)
   cd frontend
   npm install
   npm run dev
   ```

### Data Models & Indexes (`api/models/`)
| Model | Collection | Key Fields & Validation | Relationships & Indexes |
| :--- | :--- | :--- | :--- |
| **`DailyLog`** (`DailyLog.js`) | `dailylogs` | `userId` (default `"user-1"`), `date` (`YYYY-MM-DD`, required), `targetCalories` (integer, `1`–`5000`), `timestamps: true` | Compound indexes on `{ date: 1, _id: 1 }`, `{ targetCalories: 1, _id: 1 }`, and `{ createdAt: 1, _id: 1 }` for deterministic pagination; `toJSON` strips `__v` while preserving `_id`. |
| **`MealEntry`** (`MealEntry.js`) | `mealentries` | `dailyLogId` (`ObjectId`, required), `userId`, `category` (`breakfast` \| `lunch` \| `dinner`), `foodName`, `fdcId`, `servings`, `servingSize`, `servingSizeUnit`, `caloriesPerServing`, `calculatedCalories` (server-calculated), `timestamps: true` | References `DailyLog` via `dailyLogId` (`ref: "DailyLog"`). Resolved with `.populate("dailyLogId", "date targetCalories")` on read; cascade-deleted when the parent `DailyLog` is removed. |

### Querying, Filtering, Sorting & Pagination
* **`GET /api/logs`** (validated in `api/utils/parseLogQuery.js`):
  * **Date range:** `?from=YYYY-MM-DD&to=YYYY-MM-DD`
  * **Calorie goal range:** `?minCalories=1800&maxCalories=2500`
  * **Allowlisted sorting:** `?sort=-date` (default), `date`, `-targetCalories`, `targetCalories`, `-createdAt`, `createdAt` (paired with `_id` tie-breaking to match compound indexes)
  * **Pagination:** `?page=1&limit=10` (`limit` capped at `50`); returns `count`, `total`, `page`, `limit`, `totalPages`, `hasNextPage`, and `hasPrevPage`
* **`GET /api/logs/:logId/meals`**:
  * Supports optional `?category=breakfast|lunch|dinner` and case-insensitive `?search=<foodName>` (regex-escaped).
* **Query Safety:** `mongoose.set("sanitizeFilter", true)` is enabled globally in `api/config/database.js`, and server-validated range/regex operators are explicitly marked with `mongoose.trusted(...)`.

### Error Handling
* **`api/middleware/mongooseErrorHandler.js`** (registered right before `errorHandler.js` in `src/app.js`) maps Mongoose `ValidationError` and `CastError` into `400 Bad Request` responses with `{ success: false, error: { code, message, details: [{ field, message }] } }`.
* **`api/utils/findByIdOr404.js`** validates `ObjectId` format before querying so invalid or missing IDs consistently return `404 Not Found`.

### Seed Script (`api/scripts/seed.js`)
Run from the project root:
```bash
npm run seed
```
Upserts **12 daily logs** (spanning 2 pages at the default `limit=10`) and **21 meal entries** across `breakfast`, `lunch`, and `dinner` using `findOneAndUpdate(..., { upsert: true, runValidators: true })`. Re-running the script updates records in place and produces zero duplicates.

### Frontend Integration (`frontend/`)
* **`frontend/components/LogBrowser.js`**: URL-synced filter, sort, and pagination controls on `/dailylogs` driven by Next.js `router.query` (with shallow routing so browser refreshes and Back/Forward preserve state), plus daily log creation and deletion.
* **`frontend/services/apiError.js`**, **`logApi.js`**, **`mealApi.js`**: Extracts structured API error payloads (`message` + `details`) to render inline field-level errors directly next to form inputs.

### AI Usage
For the development of Milestone 4, I used AI-assisted tools (Google Gemini) to brainstorm how to structure the MongoDB/Mongoose integration cleanly alongside my teammates' existing routes and frontend components without breaking compatibility. I also used it as a learning and debugging reference to better understand concepts like schema validation, query sanitization, indexing, and URL-synced pagination in simpler terms, as well as to troubleshoot minor syntax bugs and local testing issues.