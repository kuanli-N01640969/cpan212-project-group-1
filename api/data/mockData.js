// Initial mock data arrays mirroring our DailyLog and MealEntry schemas

export let dailyLogs = [
    {
        _id: "log-1",
        userId: "user-1",
        date: "2026-10-17",
        targetCalories: 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export let mealEntries = [
    {
        _id: "meal-1",
        dailyLogId: "log-1",
        userId: "user-1",
        category: "breakfast",
        foodName: "Bananas, raw",
        fdcId: 1102653,
        servings: 2,
        servingSize: 100,
        servingSizeUnit: "g",
        caloriesPerServing: 89,
        calculatedCalories: 178, // calculated as servings * caloriesPerServing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];