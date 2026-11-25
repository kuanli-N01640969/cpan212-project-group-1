import mongoose from "mongoose";

//Matches compound indexes in DailyLog ({ field: 1, _id: 1 })
const ALLOWED_SORT_FIELDS = new Set(["date", "targetCalories", "createdAt"]);

//Pagination default values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

//Validate query date format 
function isValidDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

//Parses a non-negative integer string
function parseWholeNumber(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    return null;
  }
  return Number.parseInt(value.trim(), 10);
}

//Validates req.query for GET /api/logs and returns Mongoose-ready query options
export function parseLogQuery(query) {
    const filter = {};
    const errors = [];

    //Date range filter
    const { from, to } = query;
    const dateRange = {};

    if (from !== undefined && from !== "") {
        if (!isValidDateString(from)) {
            errors.push({ field: "from", message: "Valid date format required YYYY-MM-DD" });
        } else {
            dateRange.$gte = from;
        }
    }

    if (to !== undefined && to !== "") {
        if (!isValidDateString(to)) {
            errors.push({ field: "to", message: "Valid date format required YYYY-MM-DD" });
        } else {
            dateRange.$lte = to;
        }
    }

    if (dateRange.$gte && dateRange.$lte && dateRange.$gte > dateRange.$lte) {
        errors.push({ field: "from", message: "From date cannot be after to date" });
    }

    // mongoose.trusted() lets our validated server-built $gte/$lte operators run
    // while mongoose.set("sanitizeFilter", true) still blocks untrusted client operators.
    if (Object.keys(dateRange).length > 0) {
        filter.date = mongoose.trusted(dateRange);
    }

    //targetCalories range filter
    const { minCalories, maxCalories } = query;
    const calorieRange = {};
    let parsedMin = null;
    let parsedMax = null;

    if (minCalories !== undefined && minCalories !== "") {
        parsedMin = parseWholeNumber(minCalories);
        if (parsedMin === null) {
            errors.push({ field: "minCalories", message: "Must be whole number that is 0 or greater" });
        } else {
            calorieRange.$gte = parsedMin;
        }
    }

    if (maxCalories !== undefined && maxCalories !== "") {
        parsedMax = parseWholeNumber(maxCalories);
        if (parsedMax === null) {
            errors.push({ field: "maxCalories", message: "maxCalories must be a whole number 0 or greater" });
        } else {
            calorieRange.$lte = parsedMax;
        }
    }

    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
        errors.push({ field: "minCalories", message: "minCalories cannot be greater than maxCalories" });
    }

    if (Object.keys(calorieRange).length > 0) {
        filter.targetCalories = mongoose.trusted(calorieRange);
    }

    //Allowlisted sorting 
    let sort = { date: -1, _id: -1 };

    if (query.sort !== undefined && query.sort !== "") {
        if (typeof query.sort !== "string") {
            errors.push({ field: "sort", message: "sort must be a single string value" });
        } else {
            const raw = query.sort.trim();
            const direction = raw.startsWith("-") ? -1 : 1;
            const field = raw.startsWith("-") ? raw.slice(1) : raw;

            if (!ALLOWED_SORT_FIELDS.has(field)) {
                errors.push({
                    field: "sort",
                    message: `sort must be one of: ${[...ALLOWED_SORT_FIELDS].join(", ")} (optional leading "-" for descending)`,
                });
            } else {
                sort = { [field]: direction, _id: direction };
            }
        }
    }

    //Pagination
    let page = DEFAULT_PAGE;
    if (query.page !== undefined && query.page !== "") {
        const parsedPage = parseWholeNumber(query.page);
        if (parsedPage === null || parsedPage < 1) {
            errors.push({ field: "page", message: "page must be a whole number 1 or greater" });
        } else {
            page = parsedPage;
        }
    }

    let limit = DEFAULT_LIMIT;
    if (query.limit !== undefined && query.limit !== "") {
        const parsedLimit = parseWholeNumber(query.limit);
        if (parsedLimit === null || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
            errors.push({
                field: "limit",
                message: `limit must be a whole number between 1 and ${MAX_LIMIT}`,
            });
        } else {
            limit = parsedLimit;
        }
    }

    const skip = (page - 1) * limit;

    return { filter, sort, page, limit, skip, errors };
}