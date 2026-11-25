import { createApiError } from "./apiError";

const API_URL = "http://localhost:4000/api/logs";
const MEAL_ITEM_URL = "http://localhost:4000/api/meals";

// Get all meals for a daily log
export async function getMealsForLog(logId) {
  const response = await fetch(
    `${API_URL}/${logId}/meals`
  );

  if (!response.ok) {
    throw await createApiError(response, "Failed to fetch meals");
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
      body: JSON.stringify(mealData),
    }
  );

  if (!response.ok) {
    throw await createApiError(response, "Failed to add meal");
  }

  const result = await response.json();
  return result.data;
}

//Delete meal from daily log
export async function deleteMeal(mealId) {
  const response = await fetch(
    `${MEAL_ITEM_URL}/${mealId}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw await createApiError(response, "Failed to delete meal");
  }

  return true;
}
//Update meal item
export async function updateMeal(mealId, mealData) {
  const response = await fetch(
    `${MEAL_ITEM_URL}/${mealId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mealData),
    }
  );

  if (!response.ok) {
    throw await createApiError(response, "Failed to update meal");
  }

  const result = await response.json();
  return result.data;
}