import { randomUUID } from "node:crypto";
import { dailyLogs, mealEntries } from "../data/mockData.js";

// Builds a 404 the same way logController does (errorHandler turns it into JSON)
function notFound(message) {
    const error = new Error(message);
    error.status = 404;
    return error;
}

// The server calculates this: servings * caloriesPerServing (clients can't send it)
const calcCalories = (servings, caloriesPerServing) =>
    Math.round(servings * caloriesPerServing * 100) / 100;

// GET /api/logs/:logId/meals - List all meals for one daily log
export function getMealsForLog(req, res, next) {
    try {
        const { logId } = req.params;
        if (!dailyLogs.find(l => l._id === logId)) throw notFound(`Daily log with ID ${logId} not found`);

        const meals = mealEntries.filter(m => m.dailyLogId === logId);
        res.status(200).json({ success: true, count: meals.length, data: meals });
    } catch (err) {
        next(err);
    }
}

// POST /api/logs/:logId/meals - Add a meal entry to a daily log (body already checked by validateMeal)
export function addMealToLog(req, res, next) {
    try {
        const { logId } = req.params;
        const log = dailyLogs.find(l => l._id === logId);
        if (!log) throw notFound(`Daily log with ID ${logId} not found`);

        const { category, foodName, fdcId, servings, servingSize, servingSizeUnit, caloriesPerServing } = req.body;
        const now = new Date().toISOString();

        const newMeal = {
            _id: randomUUID(),
            dailyLogId: logId,
            userId: log.userId,
            category,
            foodName: foodName.trim(),
            fdcId,
            servings,
            servingSize,
            servingSizeUnit: servingSizeUnit.trim(),
            caloriesPerServing,
            calculatedCalories: calcCalories(servings, caloriesPerServing),
            createdAt: now,
            updatedAt: now
        };

        mealEntries.push(newMeal);
        res.status(201).json({ success: true, data: newMeal });
    } catch (err) {
        next(err);
    }
}

// GET /api/meals/:id - Get one meal entry
export function getMealById(req, res, next) {
    try {
        const { id } = req.params;
        const meal = mealEntries.find(m => m._id === id);
        if (!meal) throw notFound(`Meal entry with ID ${id} not found`);

        res.status(200).json({ success: true, data: meal });
    } catch (err) {
        next(err);
    }
}

// PUT /api/meals/:id - Update a meal entry and recalculate its calories (body checked by validateUpdateMeal)
export function updateMeal(req, res, next) {
    try {
        const { id } = req.params;
        const meal = mealEntries.find(m => m._id === id);
        if (!meal) throw notFound(`Meal entry with ID ${id} not found`);

        const fields = ["category", "foodName", "fdcId", "servings", "servingSize", "servingSizeUnit", "caloriesPerServing"];
        for (const field of fields) {
            if (req.body[field] !== undefined) meal[field] = req.body[field];
        }

        meal.calculatedCalories = calcCalories(meal.servings, meal.caloriesPerServing);
        meal.updatedAt = new Date().toISOString();

        res.status(200).json({ success: true, data: meal });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/meals/:id - Delete a meal entry, responds 204 with no body
export function deleteMeal(req, res, next) {
    try {
        const { id } = req.params;
        const index = mealEntries.findIndex(m => m._id === id);
        if (index === -1) throw notFound(`Meal entry with ID ${id} not found`);

        mealEntries.splice(index, 1);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
