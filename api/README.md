# API Backend - Milestone 2

## Setup Instructions
1. Run `npm install` inside the `api/` folder.
2. Create a `.env` file based on `.env.example` and add your USDA API key. (use the following: cp .env.example .env)
3. Run `npm run dev` to start the server on port 4000.
** Key has been provided separately.
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
