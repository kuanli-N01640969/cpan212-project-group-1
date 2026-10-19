// Validation for MealEntry bodies. Sends 400 with a list of every bad field.
const CATEGORIES = ['breakfast', 'lunch', 'dinner'];

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

// field name -> [check function, error message]
const RULES = {
    category: [(v) => CATEGORIES.includes(v), 'category must be one of: breakfast, lunch, dinner'],
    foodName: [isNonEmptyString, 'foodName must be a non-empty string'],
    fdcId: [(v) => Number.isInteger(v) && v > 0, 'fdcId must be a positive whole number'],
    servings: [(v) => isNumber(v) && v > 0, 'servings must be a number greater than 0'],
    servingSize: [(v) => isNumber(v) && v > 0, 'servingSize must be a number greater than 0'],
    servingSizeUnit: [isNonEmptyString, 'servingSizeUnit must be a non-empty string (e.g. "g")'],
    caloriesPerServing: [(v) => isNumber(v) && v >= 0, 'caloriesPerServing must be a number 0 or greater']
};

function checkFields(body, requireAll) {
    const details = [];
    for (const [field, [isValid, message]] of Object.entries(RULES)) {
        if (body[field] === undefined) {
            if (requireAll) details.push({ field, message: `${field} is required` });
        } else if (!isValid(body[field])) {
            details.push({ field, message });
        }
    }
    return details;
}

// POST /api/logs/:logId/meals
export function validateMeal(req, res, next) {
    const details = checkFields(req.body ?? {}, true);
    if (details.length) {
        return res.status(400).json({ error: { message: 'Validation failed', details } });
    }
    next();
}

// PUT /api/meals/:id  (anything sent must be valid; at least one field required)
export function validateUpdateMeal(req, res, next) {
    const body = req.body ?? {};
    const details = checkFields(body, false);
    if (!Object.keys(RULES).some((field) => body[field] !== undefined)) {
        details.push({ field: 'body', message: `send at least one of: ${Object.keys(RULES).join(', ')}` });
    }
    if (details.length) {
        return res.status(400).json({ error: { message: 'Validation failed', details } });
    }
    next();
}
