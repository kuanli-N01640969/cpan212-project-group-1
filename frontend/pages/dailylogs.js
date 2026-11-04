
import { useState, useEffect } from "react";
import { getAllLogs, createLog, updateLog } from "../services/logApi";
import { getMealsForLog, addMealToLog, deleteMeal, updateMeal } from "../services/mealApi";
import { searchFood } from "../services/usdaApi";


export default function DailyLogs() {
  const [logs, setLogs] = useState([]);
  const [meals, setMeals] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState("");
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [category, setCategory] = useState("breakfast");
  const [grams, setGrams] = useState("100");
  const [foodMessage, setFoodMessage] = useState("");
  const [editingMealId, setEditingMealId] = useState(null);
  const [editGrams, setEditGrams] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getAllLogs();
        setLogs(data);

        if (data.length > 0) {
          const log = data[0];
          setSelectedLog(log);

          setCalorieGoal(log.targetCalories.toString());

          const mealData = await getMealsForLog(log._id);
          setMeals(mealData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  // Calculate total calories
  const consumed = meals.reduce(
    (total, meal) => total + meal.calculatedCalories,
    0
  );

  // Calculate remaining calories
  const remaining = selectedLog
    ? selectedLog.targetCalories - consumed
    : 0;

  async function handleSaveGoal() {
    const goal = Number(calorieGoal);

    if (!calorieGoal.trim() || !Number.isInteger(goal) || goal <= 0) {
    setMessage("Please enter a valid calorie goal");
    return;
    }

    try {
    setMessage("");

      if (selectedLog) {
        // Update existing daily log
        const updatedLog = await updateLog(
          selectedLog._id,
          { targetCalories: goal }
        );

        setSelectedLog(updatedLog);
      } else {
        // Create a new daily log
        const today = new Date().toLocaleDateString("en-CA");

        const newLog = await createLog(today, goal);

        setSelectedLog(newLog);
        setLogs([...logs, newLog]);
        setMeals([]);
      }

      setMessage("Calorie goal saved successfully!");
    } catch (err) {
      setMessage("Failed to save calorie goal");
    }
  }

  async function handleFoodSearch() {
    if (!foodQuery.trim()) {
      setFoodMessage("Please enter a food item");
      return;
    }

    try {
      setFoodMessage("");
      setSelectedFood(null);

      const results = await searchFood(foodQuery);
      setFoodResults(results);
    } catch (err) {
      setFoodMessage(err.message);
    }
  }

  async function handleAddFood() {
    if (!selectedLog || !selectedFood) {
      setFoodMessage("Please select a food item");
      return;
    }

    const quantity = Number(grams);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFoodMessage("Please enter a valid quantity");
      return;
    }

    const caloriesPerServing = selectedFood.calories;

    if (!Number.isFinite(caloriesPerServing) ||
        caloriesPerServing < 0) {
      setFoodMessage("Invalid calorie information");
      return;
    }

    const mealData = {
      category: category,
      foodName: selectedFood.description,
      fdcId: selectedFood.fdcId,
      servings: quantity / 100,
      servingSize: 100,
      servingSizeUnit: "g",
      caloriesPerServing: caloriesPerServing
    };

    try {
      await addMealToLog(selectedLog._id, mealData);

      const updatedMeals = await getMealsForLog(
        selectedLog._id
      );

      setMeals(updatedMeals);
      setFoodMessage("Food successfully added to meal!");

      setSelectedFood(null);
      setFoodResults([]);
      setFoodQuery("");
      setGrams("100");
    } catch (err) {
      setFoodMessage(err.message);
    }
  }

  //delete food item
  async function handleDeleteMeal(mealId) {

    try {
      await deleteMeal(mealId);

      setMeals(meals.filter((meal) => meal._id !== mealId));

      setFoodMessage("Food deleted successfully!");
    } catch (err) {
      setFoodMessage(err.message);
    }
  }

  //Edit existing food item in meal
  function handleEditMeal(meal) {
    setEditingMealId(meal._id);

    // Convert servings back to grams
    setEditGrams(
      String(meal.servings * meal.servingSize)
    );
  }

  async function handleSaveEdit(meal) {
    const quantity = Number(editGrams);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFoodMessage("Please enter a valid quantity");
      return;
    }

    try {
      const updatedMeal = await updateMeal(meal._id, {
        servings: quantity / meal.servingSize
      });

      setMeals((previousMeals) =>
        previousMeals.map((item) =>
          item._id === meal._id ? updatedMeal : item
        )
      );

      setEditingMealId(null);
      setFoodMessage("Food updated successfully!");
    } catch (err) {
      setFoodMessage(err.message);
    }
  }

  return (
    <div className="dailyLogs">
      <h1>Daily Calorie Tracker</h1>

      <div className="logSection">
        <h3>Set Daily Calorie Goal</h3>

        <input
          type="number"
          placeholder="Enter calorie goal"
          value={calorieGoal}
          onChange={(event) => setCalorieGoal(event.target.value)}
          min="1"
        />

        <button onClick={handleSaveGoal}>
          Save
        </button>

        {message && <p>{message}</p>}
      </div>

      {loading && <p>Loading daily logs...</p>}
      {error && <p>{error}</p>}

      {selectedLog && (
        <div>

          <div className="logSection">      
            <h3>Add Food</h3>

            <div>
              <input
                type="text"
                placeholder="Search for food..."
                value={foodQuery}
                onChange={(event) => setFoodQuery(event.target.value)}
              />

              <button onClick={handleFoodSearch}>
                Search
              </button>
            </div>
          </div>

          {foodResults.length > 0 && (
            <div>
              <h4>Search Results</h4>

              {foodResults.map((food) => (
                <div className="foodResult" key={food.fdcId}>
                  <p>
                    {food.description} - {food.calories} cal
                    (serving basis not verified)
                  </p>

                  <button onClick={() => setSelectedFood(food)}>
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFood && (
            <div>
              <h4>Selected Food: {selectedFood.description}</h4>

              <label>Meal Category: </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>

              <br />

              <label>Quantity (grams): </label>
              <input
                type="number"
                value={grams}
                min="1"
                onChange={(event) => setGrams(event.target.value)}
              />

              <p>
                Estimated Calories: {
                  ((Number(grams) / 100) * selectedFood.calories)
                    .toFixed(2)
                }
              </p>

              <button onClick={handleAddFood}>
                Add Food
              </button>
            </div>
          )}

          {foodMessage && <p>{foodMessage}</p>}


          <h1>Daily Meals</h1>

          {["breakfast", "lunch", "dinner"].map((category) => (
            <div className="logSection" key={category}>
              <h3>
                {category.charAt(0).toUpperCase() +
                  category.slice(1)}
              </h3>

              {meals
                .filter((meal) => meal.category === category)
                .map((meal) => (
                  <div className="mealItem" key={meal._id}>
                    <span>
                      {meal.foodName} - {meal.calculatedCalories} cal
                    </span>

                    {editingMealId === meal._id ? (
                      <div>
                        <input
                          type="number"
                          value={editGrams}
                          onChange={(event) => setEditGrams(event.target.value)}
                          min="1"
                          placeholder="Grams"
                        />

                        <button onClick={() => handleSaveEdit(meal)}>
                          Save
                        </button>

                        <button onClick={() => setEditingMealId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mealButtons">
                        <button onClick={() => handleEditMeal(meal)}>
                          Edit
                        </button>

                        <button onClick={() => handleDeleteMeal(meal._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
          <div className="logSection calorieSummary">
            <h2>Current daily log date: {selectedLog.date}</h2>
            <h3>Calorie Summary</h3>
            <p>Daily Goal: {selectedLog.targetCalories} cal</p>
            <p>Consumed: {consumed} cal</p>

            <p>
              {remaining >= 0
                ? `${remaining} calories remaining`
                : `${Math.abs(remaining)} calories over goal`}
            </p>
          </div>
        </div>
      )}

      {!loading && !selectedLog && !error && (
        <p>No daily logs found.</p>
      )}
    </div>
  );
}

          