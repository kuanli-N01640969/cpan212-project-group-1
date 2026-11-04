# Frontend - Milestone 3

## How to Run the Project

This project consists of two applications:
- Backend: Node.js and Express API
- Frontend: Next.js application

Both applications must be running for the calorie tracker to work properly.

### 1. Install Dependencies

Open a terminal in the root project folder and install the backend dependencies:

```bash
npm install
```

Navigate to the frontend folder and install its dependencies:

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

In the root project folder, create a `.env` file containing:

```env
PORT=4000
USDA_API_KEY=your_usda_api_key
```

| Variable | Description |
|---|---|
| `PORT` | Port used by the Express backend (default: 4000) |
| `USDA_API_KEY` | API key used to retrieve nutritional information from the USDA FoodData Central API |

A USDA API key can be obtained from https://fdc.nal.usda.gov/api-key-signup.

The `.env` file should not be committed to GitHub because it contains a private API key.

### 3. Start the Backend

Open a terminal in the root project folder and run:

```bash
npm run dev
```

The Express backend will run at:

http://localhost:4000

### 4. Start the Frontend

Open a second terminal, navigate to the frontend folder, and run:

```bash
cd frontend
npm run dev
```

The Next.js frontend will run at:

http://localhost:3000

Open this address in your browser to use the calorie tracker.

### 5. Using the Application

Once both servers are running, users can:

- Sign In to access the Daily Logs page.
- Set or update their daily calorie goal.
- Search for foods using the USDA API.
- Add foods to breakfast, lunch, or dinner by entering quantities in grams.
- Edit or delete existing food entries.
- View their total consumed and remaining calories.
- Search for nutritional information on the Nutritional Information page.
- Read about the app and team



