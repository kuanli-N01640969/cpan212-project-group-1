import { Router } from "express";
import { getMealsForLog, addMealToLog } from "../controllers/mealController.js";
import { validateMeal } from "../middleware/validateMeal.js";

const router = Router();

// GET /api/logs/:logId/meals
router.get('/:logId/meals', getMealsForLog);

// POST /api/logs/:logId/meals
router.post('/:logId/meals', validateMeal, addMealToLog);

export default router;
