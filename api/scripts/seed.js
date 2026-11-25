import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { DailyLog } from "../models/DailyLog.js";
import { MealEntry } from "../models/MealEntry.js";

const SEED_USER_ID = "user-1";

// Mirrors the server-side calorie calculation in mealController.js.
const calcCalories = (servings, caloriesPerServing) =>
    Math.round(servings * caloriesPerServing * 100) / 100;

// 12 logs across November 2026 (spans 2 pages at the default limit=10)
// with varied targetCalories (1750–2500) to exercise sorting and range filters.
const SEED_DATA = [
    {
        date: "2026-11-13",
        targetCalories: 2000,
        meals: [
            {
            category: "breakfast",
            foodName: "Oats, rolled, dry",
            fdcId: 173904,
            servings: 1,
            servingSize: 80,
            servingSizeUnit: "g",
            caloriesPerServing: 303,
            },
            {
            category: "lunch",
            foodName: "Chicken breast, grilled",
            fdcId: 171477,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 165,
            },
        ],
    },
    {
        date: "2026-11-14",
        targetCalories: 2200,
        meals: [
            {
            category: "breakfast",
            foodName: "Bananas, raw",
            fdcId: 173944,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 89,
            },
            {
            category: "dinner",
            foodName: "Atlantic salmon, baked",
            fdcId: 175168,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 208,
            },
        ],
    },
    {
        date: "2026-11-15",
        targetCalories: 1850,
        meals: [
            {
            category: "lunch",
            foodName: "Greek yogurt, plain, nonfat",
            fdcId: 170903,
            servings: 1,
            servingSize: 170,
            servingSizeUnit: "g",
            caloriesPerServing: 100,
            },
            {
            category: "breakfast",
            foodName: "Almonds, raw",
            fdcId: 170567,
            servings: 1,
            servingSize: 28,
            servingSizeUnit: "g",
            caloriesPerServing: 164,
            },
        ],
    },
    {
        date: "2026-11-16",
        targetCalories: 2400,
        meals: [
            {
            category: "breakfast",
            foodName: "Eggs, scrambled",
            fdcId: 172187,
            servings: 2,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 149,
            },
            {
            category: "dinner",
            foodName: "Brown rice, cooked",
            fdcId: 169704,
            servings: 2,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 123,
            },
        ],
    },
    {
        date: "2026-11-17",
        targetCalories: 1900,
        meals: [
            {
            category: "lunch",
            foodName: "Turkey breast, roasted",
            fdcId: 171496,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 135,
            },
        ],
    },
    {
        date: "2026-11-18",
        targetCalories: 2100,
        meals: [
            {
            category: "breakfast",
            foodName: "Apples, raw, with skin",
            fdcId: 171688,
            servings: 1,
            servingSize: 182,
            servingSizeUnit: "g",
            caloriesPerServing: 95,
            },
            {
            category: "dinner",
            foodName: "Beef sirloin steak, grilled",
            fdcId: 174036,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 212,
            },
        ],
    },
    {
        date: "2026-11-19",
        targetCalories: 1750,
        meals: [
            {
            category: "breakfast",
            foodName: "Chia seeds, dried",
            fdcId: 170554,
            servings: 1,
            servingSize: 28,
            servingSizeUnit: "g",
            caloriesPerServing: 138,
            },
        ],
    },
    {
        date: "2026-11-20",
        targetCalories: 2500,
        meals: [
            {
            category: "lunch",
            foodName: "Chicken thighs, roasted",
            fdcId: 172386,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 209,
            },
            {
            category: "breakfast",
            foodName: "Peanut butter, smooth",
            fdcId: 172470,
            servings: 1,
            servingSize: 32,
            servingSizeUnit: "g",
            caloriesPerServing: 190,
            },
        ],
    },
    {
        date: "2026-11-21",
        targetCalories: 2000,
        meals: [
            {
            category: "dinner",
            foodName: "Tofu, firm, cooked",
            fdcId: 172449,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 144,
            },
        ],
    },
    {
        date: "2026-11-22",
        targetCalories: 2300,
        meals: [
            {
            category: "lunch",
            foodName: "Avocado, raw",
            fdcId: 171705,
            servings: 1,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 160,
            },
        ],
    },
    {
        date: "2026-11-23",
        targetCalories: 1800,
        meals: [
            {
            category: "dinner",
            foodName: "Broccoli, steamed",
            fdcId: 170379,
            servings: 2,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 35,
            },
        ],
    },
    {
        date: "2026-11-24",
        targetCalories: 2200,
        meals: [
            {
            category: "breakfast",
            foodName: "Bananas, raw",
            fdcId: 173944,
            servings: 1,
            servingSize: 118,
            servingSizeUnit: "g",
            caloriesPerServing: 105,
            },
            {
            category: "lunch",
            foodName: "Chicken breast, grilled",
            fdcId: 171477,
            servings: 2,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 165,
            },
            {
            category: "dinner",
            foodName: "Sweet potato, baked",
            fdcId: 168483,
            servings: 1.5,
            servingSize: 100,
            servingSizeUnit: "g",
            caloriesPerServing: 90,
            },
            {
            category: "breakfast",
            foodName: "Blueberries, raw",
            fdcId: 171711,
            servings: 1,
            servingSize: 148,
            servingSizeUnit: "g",
            caloriesPerServing: 84,
            },
        ],
    },
];

async function seed() {
    try {
        await connectDatabase();

        let logsUpserted = 0;
        let mealsUpserted = 0;

        for (const entry of SEED_DATA) {
            // Upsert each daily log by (userId, date) so re-running never creates duplicate days.
            const log = await DailyLog.findOneAndUpdate(
                { userId: SEED_USER_ID, date: entry.date },
                {
                    $set: {
                    userId: SEED_USER_ID,
                    date: entry.date,
                    targetCalories: entry.targetCalories,
                    },
                },
                {
                    upsert: true,
                    returnDocument: "after",
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );
            logsUpserted += 1;

            for (const meal of entry.meals) {
            // Upsert each meal by (dailyLogId, category, foodName) to keep meals idempotent too.
            await MealEntry.findOneAndUpdate(
                {
                    dailyLogId: log._id,
                    category: meal.category,
                    foodName: meal.foodName,
                },
                {
                    $set: {
                        dailyLogId: log._id,
                        userId: log.userId,
                        category: meal.category,
                        foodName: meal.foodName,
                        fdcId: meal.fdcId,
                        servings: meal.servings,
                        servingSize: meal.servingSize,
                        servingSizeUnit: meal.servingSizeUnit,
                        caloriesPerServing: meal.caloriesPerServing,
                        calculatedCalories: calcCalories(meal.servings, meal.caloriesPerServing),
                    },
                },
                {
                    upsert: true,
                    returnDocument: "after",
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );
            mealsUpserted += 1;
            }
        }

    const [totalLogs, totalMeals] = await Promise.all([
        DailyLog.countDocuments(),
        MealEntry.countDocuments(),
    ]);

    console.log(`Seed complete: processed ${logsUpserted} logs and ${mealsUpserted} meals.`);
    console.log(`Database totals -> DailyLogs: ${totalLogs}, MealEntries: ${totalMeals}`);
    } catch (err) {
        console.error("Seed failed:", err);
        process.exitCode = 1;
    } finally {
        // Always close the Mongoose connection pool so the CLI script exits cleanly.
        await mongoose.disconnect();
    }
}

await seed();