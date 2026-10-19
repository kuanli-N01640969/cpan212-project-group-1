import { Router } from "express";
import { getMealById, updateMeal, deleteMeal } from "../controllers/mealController.js";
import { validateUpdateMeal } from "../middleware/validateMeal.js";

const router = Router();

// Mounted at /api/meals in src/app.js
router.get('/:id', getMealById);
router.put('/:id', validateUpdateMeal, updateMeal);
router.delete('/:id', deleteMeal);

export default router;
