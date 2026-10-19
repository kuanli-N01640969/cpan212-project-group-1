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
