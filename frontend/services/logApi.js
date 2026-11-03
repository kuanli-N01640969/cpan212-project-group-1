const API_URL = "http://localhost:4000/api/logs";

// GET all logs
export async function getAllLogs() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }

  const result = await response.json();
  return result.data;
}

// GET one log
export async function getLogById(id) {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch log");
  }

  const result = await response.json();
  return result.data;
}

// POST create log
export async function createLog(date, targetCalories) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      date,
      targetCalories
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create log");
  }

  const result = await response.json();
  return result.data;
}

// PUT update log
export async function updateLog(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error("Failed to update log");
  }

  const result = await response.json();
  return result.data;
}

// DELETE log
export async function deleteLog(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete log");
  }

  return true;
}