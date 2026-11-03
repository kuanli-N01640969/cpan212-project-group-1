const API_URL = "http://localhost:4000/api/usda";

export async function searchFood(query) {
  const response = await fetch(
    `${API_URL}/search?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search foods");
  }

  const result = await response.json();
  return result.data;
}