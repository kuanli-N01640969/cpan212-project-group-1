
import { useState } from "react";
import { searchFood } from "../services/usdaApi";

export default function NutritionInfo() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      setError("Please enter a food item");
      return;
    }

    setLoading(true);
    setError("");
    setFoods([]);

    try {
      const results = await searchFood(query);
      setFoods(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nutritionInfo">
      <h1>Nutritional Information</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for food item..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {loading && <p>Searching...</p>}
      {error && <p>{error}</p>}

      {foods.map((food) => (
        <div key={food.fdcId}>
          <h3>{food.description}</h3>
          <p>Calories: {food.calories}</p>
          <p>Protein: {food.protein} g</p>
          <p>Carbs: {food.carbs} g</p>
          <p>Fat: {food.fat} g</p>
          <hr />
        </div>
      ))}
    </div>
  );
}
