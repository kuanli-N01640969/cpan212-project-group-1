import mongoose from "mongoose";
import { DailyLog } from "../models/DailyLog.js";
import { MealEntry } from "../models/MealEntry.js";
import { HttpError } from "../utils/http-error.js";
import { findByIdOr404 } from "../utils/findByIdOr404.js";
import { parseLogQuery } from "../utils/parseLogQuery.js";

// GET /api/logs - List daily logs with allowlisted filtering, sorting, and pagination
export async function getAllLogs(req, res, next) {
  try {
    const { filter, sort, page, limit, skip, errors } = parseLogQuery(req.query);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: "Invalid query parameters",
          details: errors,
        },
      });
    }

    // Run the page query and total count in parallel so pagination metadata stays accurate.
    const [logs, total] = await Promise.all([
      DailyLog.find(filter).sort(sort).skip(skip).limit(limit),
      DailyLog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/logs/:id - Retrieve a single daily log by ID
export async function getLogById(req, res, next) {
  try {
    const log = await findByIdOr404(DailyLog, req.params.id, "Daily log");

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/logs - Create a new daily log
export async function createLog(req, res, next) {
  try {
    // Pick only allowed fields from req.body so clients cannot overwrite userId or timestamps.
    const { date, targetCalories } = req.body;

    const newLog = await DailyLog.create({
      date,
      targetCalories,
    });

    res.status(201).json({
      success: true,
      data: newLog,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/logs/:id - Update an existing daily log
export async function updateLog(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      throw new HttpError(404, `Daily log with ID ${id} not found`);
    }

    const updates = {};
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.targetCalories !== undefined) updates.targetCalories = req.body.targetCalories;

    // returnDocument: "after" returns the updated document (Mongoose 9 standard);
    // runValidators: true ensures schema validation still runs on updates.
    const updatedLog = await DailyLog.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedLog) {
      throw new HttpError(404, `Daily log with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      data: updatedLog,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/logs/:id - Delete a daily log and cascade-delete all of its meal entries
export async function deleteLog(req, res, next) {
  try {
    const log = await findByIdOr404(DailyLog, req.params.id, "Daily log");

    // Remove child meals first so no orphaned MealEntry documents remain in MongoDB.
    await MealEntry.deleteMany({ dailyLogId: log._id });
    await log.deleteOne();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/*
## 5. Endpoint List
|Method|Path|Description|Success Code|Error Code|
|---|---|---|---|---|
GET | /api/nutrition/search | Search USDA database for food items and return simplified nutrition data | Success: 200 OK | Errors: 400, 500 |
GET | /api/logs | List all daily logs for the signed-in user | Success: 200 OK | Errors: 401, 500 |
GET | /api/logs/:id | Get details for a single daily log by ID | Success: 200 OK | Errors: 401, 404, 500 |
POST| /api/logs | Create a new daily log with a target calorie goal | Success: 201 Created | Errors: 400, 401, 500 |
PUT | /api/logs/:id | Update a daily log's target calorie goal | Success: 200 OK | Errors: 400, 401, 404, 500 |
DELETE | /api/logs/:id | Delete a daily log and all associated meal entries | Success: 200 OK | Errors: 401, 404, 500 |
GET | /api/logs/:logId/meals | List all meal entries for a specific daily log | Success: 200 OK | Errors: 401, 404, 500 |
GET | /api/meals/:id | Get details for a single meal entry | Success: 200 OK | Errors: 401, 404, 500 |
POST | /api/logs/:logId/meals | Create a new meal entry (calculates portion calories) | Success: 201 Created | Errors: 400, 401, 404, 500 |
PUT | /api/meals/:id | Update a meal entry (recalculates portion calories) | Success: 200 OK | Errors: 400, 401, 404, 500 |
DELETE | /api/meals/:id | Delete a meal entry from a daily log | Success: 200 OK | Errors: 401, 404, 500 |


https://www.youtube.com/watch?v=UuhnalzKwE0&t=14s

https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes

*/