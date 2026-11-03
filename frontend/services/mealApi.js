const API_URL = "http://localhost:4000/api/logs";

// Get all meals for a daily log
export async function getMealsForLog(logId) {
  const response = await fetch(
    `${API_URL}/${logId}/meals`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meals");
  }

  const result = await response.json();
  return result.data;
}

// Add a meal to a daily log
export async function addMealToLog(logId, mealData) {
  const response = await fetch(
    `${API_URL}/${logId}/meals`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mealData)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add meal");
  }

  const result = await response.json();
  return result.data;
}