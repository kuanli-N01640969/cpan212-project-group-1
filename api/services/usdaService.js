import { HttpError } from "../utils/http-error.js";

const USDA_API_KEY = process.env.USDA_API_KEY;
const BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

const TIMEOUT_MS = 5000; // 5 sec deadline for USDA to respond

const cache = new Map(); // Creates a fast, temporary key-value storage directly in your server's memory.
const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour; it doesnt re-search for the same food multiple times and retuns the save result

//API Key Guard: Checks immediately if the key exists, throwing a clean 500 error if it's missing.
async function fetchFromUSDA(query) {
  if (!USDA_API_KEY) {
    throw new HttpError(
      500,
      "USDA_API_KEY is missing from environment variables.",
    );
  }

  const url = `${BASE_URL}?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`USDA API answered with status ${res.status}`);
  }

  const data = await res.json();
  return data.foods || [];
}
export async function searchFoodFromUSDA(query) {
  const normalizedQuery = query.trim().toLowerCase();

  const cached = cache.get(normalizedQuery);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`USDA cache hit for query: "${normalizedQuery}"`);
    return cached.foods;
  }

  console.log(
    `USDA cache miss for query: "${normalizedQuery}", calling external API`,
  );
  let rawFoods;
  try {
    rawFoods = await fetchFromUSDA(normalizedQuery);
  } catch (error) {
    console.error(`USDA lookup failed: ${error.name}: ${error.message}`);

    if (error.name === "TimeoutError") {
      throw new HttpError(
        504,
        "The USDA service took too long to answer, try again later",
      );
    }
    throw new HttpError(
      502,
      "The USDA service is not responding, try again later",
    );
  }

  const simplifiedFoods = rawFoods.map((food) => {
    const nutrients = food.foodNutrients || [];

    const getNutrientValue = (name) => {
      const n = nutrients.find(
        (item) =>
          item.nutrientName &&
          item.nutrientName.toLowerCase().includes(name.toLowerCase()),
      );
      return n ? n.value : 0;
    };

    return {
      fdcId: food.fdcId,
      description: food.description,
      calories: getNutrientValue("Energy"),
      protein: getNutrientValue("Protein"),
      carbs: getNutrientValue("Carbohydrate"),
      fat: getNutrientValue("Total lipid (fat)"),
    };
  });

  cache.set(normalizedQuery, {
    foods: simplifiedFoods,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return simplifiedFoods;
}
