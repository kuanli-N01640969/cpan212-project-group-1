import mongoose from "mongoose";
import { DailyLog } from "../models/DailyLog.js";
import { MealEntry, MEAL_CATEGORIES } from "../models/MealEntry.js";
import { HttpError } from "../utils/http-error.js";
import { findByIdOr404 } from "../utils/findByIdOr404.js";

// The server calculates this: servings * caloriesPerServing (clients can't send it)
const calcCalories = (servings, caloriesPerServing) =>
    Math.round(servings * caloriesPerServing * 100) / 100;

// Escapes regex special characters so user search text (e.g., "chicken (grilled)")
// is treated as literal text instead of breaking MongoDB $regex queries.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/logs/:logId/meals - List all meals for one daily log
export async function getMealsForLog(req, res, next) {
    try {
        const log = await findByIdOr404(DailyLog, req.params.logId, "Daily log");
        const filter = { dailyLogId: log._id };

        // Optional allowlisted category filter: ?category=breakfast
        if (req.query.category !== undefined && req.query.category !== "") {
        if (typeof req.query.category !== "string") {
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Invalid query parameters",
                    details: [{ field: "category", message: "category must be a single string value" }],
            },
            });
        }

        const category = req.query.category.trim().toLowerCase();
        if (!MEAL_CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Invalid query parameters",
                    details: [
                    {
                        field: "category",
                        message: `category must be one of: ${MEAL_CATEGORIES.join(", ")}`,
                    },
                    ],
                },
            });
            }
            filter.category = category;
        }

        // Optional case-insensitive foodName search: ?search=banana
        if (typeof req.query.search === "string" && req.query.search.trim() !== "") {
            filter.foodName = mongoose.trusted({ $regex: escapeRegex(req.query.search.trim()), $options: "i" });
        }

        // .populate() resolves the dailyLogId ObjectId reference to include parent log date and goal.
        const meals = await MealEntry.find(filter)
        .sort({ createdAt: 1, _id: 1 })
        .populate("dailyLogId", "date targetCalories");

        res.status(200).json({
            success: true,
            count: meals.length,
            data: meals,
        });
    } catch (err) {
        next(err);
    }
}

// POST /api/logs/:logId/meals - Add a meal entry to a daily log (body already checked by validateMeal)
export async function addMealToLog(req, res, next) {
    try {
        const log = await findByIdOr404(DailyLog, req.params.logId, "Daily log");

        const { category, foodName, fdcId, servings, servingSize, servingSizeUnit, caloriesPerServing } = req.body;
        
        const newMeal = await MealEntry.create({
            dailyLogId: log._id,
            userId: log.userId,
            category,
            foodName,
            fdcId,
            servings,
            servingSize,
            servingSizeUnit,
            caloriesPerServing,
            calculatedCalories: calcCalories(servings, caloriesPerServing),
        });

        res.status(201).json({ success: true, data: newMeal });
    } catch (err) {
        next(err);
    }
}

// GET /api/meals/:id - Get one meal entry
export async function getMealById(req, res, next) {
    try {
        const { id } = req.params;
        
        if (!mongoose.isObjectIdOrHexString(id)) {
            throw new HttpError(404, `Meal entry with ID ${id} not found`);
        }

        const meal = await MealEntry.findById(id).populate("dailyLogId", "date targetCalories");
        
        if (!meal) throw new HttpError(404, `Meal entry with ID ${id} not found`);

        res.status(200).json({ success: true, data: meal });
    } catch (err) {
        next(err);
    }
}

// PUT /api/meals/:id - Update a meal entry and recalculate its calories (body checked by validateUpdateMeal)
export async function updateMeal(req, res, next) {
    try {
        const meal = await findByIdOr404(MealEntry, req.params.id, "Meal entry");

        const allowedFields = ["category", "foodName", "fdcId", "servings", "servingSize", "servingSizeUnit", "caloriesPerServing"];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) meal[field] = req.body[field];
        }

        meal.calculatedCalories = calcCalories(meal.servings, meal.caloriesPerServing);
        
        // .save() runs Mongoose schema validation automatically before persisting.
        const updatedMeal = await meal.save();

        res.status(200).json({ success: true, data: updatedMeal });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/meals/:id - Delete a meal entry, responds 204 with no body
export async function deleteMeal(req, res, next) {
    try {
        const meal = await findByIdOr404(MealEntry, req.params.id, "Meal entry");
        await meal.deleteOne();

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
