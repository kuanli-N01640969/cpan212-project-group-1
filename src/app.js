import express from 'express';
import logRoutes from '../api/routes/logRoutes.js';
import mealRoutes from '../api/routes/mealRoutes.js';
import mealItemRoutes from '../api/routes/mealItemRoutes.js';
import usdaRoutes from '../api/routes/usdaRoutes.js';
import { notFound } from "../api/middleware/notFound.js";
import { errorHandler } from "../api/middleware/errorHandler.js";

export const app = express();

// app.use method adds middleware functions to the application's request-response processing pipeline
// Order matters: Express runs middleware and routes top to bottom.

app.use(express.json());

//the importing file can name the imported variable whatever it wants
app.use('/api/logs', logRoutes);
app.use('/api/logs', mealRoutes);
app.use('/api/meals', mealItemRoutes);
app.use('/api/usda', usdaRoutes);

// These two stay last: notFound catches anything no route matched,
// errorHandler catches anything thrown along the way.

// 3. 404 Not Found Middleware (Must go AFTER all valid routes)
app.use(notFound);
// 4. Global Error Handler (Must be the very last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});