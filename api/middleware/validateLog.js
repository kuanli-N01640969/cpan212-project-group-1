// Validation for DailyLog bodies. Sends 400 with a list of every bad field.
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);

// "2026-10-19" is valid; "2026-13-45" or "banana" is not
function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function checkFields(body, requireAll) {
    const details = [];

    if (body.date === undefined) {
        if (requireAll) details.push({ field: 'date', message: 'date is required' });
    } else if (!isValidDate(body.date)) {
        details.push({ field: 'date', message: 'date must be a real date in YYYY-MM-DD format' });
    }

    if (body.targetCalories === undefined) {
        if (requireAll) details.push({ field: 'targetCalories', message: 'targetCalories is required' });
    } else if (!isNumber(body.targetCalories) || body.targetCalories <= 0) {
        details.push({ field: 'targetCalories', message: 'targetCalories must be a number greater than 0' });
    }

    return details;
}

// POST /api/logs
export function validateLog(req, res, next) {
    const details = checkFields(req.body ?? {}, true); // Express 5: req.body is undefined if no JSON was sent
    if (details.length) {
        return res.status(400).json({ error: { message: 'Validation failed', details } });
    }
    next();
}

// PUT /api/logs/:id  (anything sent must be valid; at least one field required)
export function validateUpdateLog(req, res, next) {
    const body = req.body ?? {};
    const details = checkFields(body, false);
    if (body.date === undefined && body.targetCalories === undefined) {
        details.push({ field: 'body', message: 'send at least one of: date, targetCalories' });
    }
    if (details.length) {
        return res.status(400).json({ error: { message: 'Validation failed', details } });
    }
    next();
}
