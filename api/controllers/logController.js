import { randomUUID } from "node:crypto";
import { dailyLogs, mealEntries } from "../data/mockData.js";

// GET /api/logs - Retrieve all daily logs
export function getAllLogs(req, res, next) {
    try { //In the future, this will be DailyLog.find() from MongoDB
        res.status(200).json({
            success: true,
            count: dailyLogs.length,
            data: dailyLogs
        });
    } catch (err) { // passes to notFound
        next(err); //passes to errorHandler
    }
}

// GET /api/logs/:id - Retrieve a single daily log by ID
export function getLogById (req, res, next) {
    try { //In the future, this will be DailyLog.find() from MongoDB
        const { id } = req.params;
        const log = dailyLogs.find(l => l._id === id);

        if (!log) {
            const error = new Error(`Daily log with ID ${id} not found`);
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (err) {
        next(err); // Automatically caught by our error handler
    }
}

// POST /api/logs - Create a new daily log (body already checked by validateLog)
export function createLog(req, res, next) {
    try {
        const { date, targetCalories } = req.body;
        const now = new Date().toISOString();

        const newLog = {
            _id: randomUUID(),
            userId: "user-1", // no auth yet, so logs belong to the sample user
            date,
            targetCalories,
            createdAt: now,
            updatedAt: now
        };

        dailyLogs.push(newLog);

        res.status(201).json({
            success: true,
            data: newLog
        });
    } catch (err) {
        next(err);
    }
}

// PUT /api/logs/:id - Update an existing daily log (body already checked by validateUpdateLog)
export function updateLog(req, res, next) {
    try {
        const { id } = req.params;
        const { date, targetCalories } = req.body;

        const log = dailyLogs.find(l => l._id === id);

        if (!log) {
            const error = new Error(`Daily log with ID ${id} not found`);
            error.status = 404;
            throw error;
        }
        if (date !== undefined) log.date = date;
        if (targetCalories !== undefined) log.targetCalories = targetCalories;
        log.updatedAt = new Date().toISOString();

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (err) {
        next(err);
    }
}

// DELETE /api/logs/:id - Delete a daily log (and its meals), responds 204 with no body
export function deleteLog(req, res, next) {
    try {
        const { id } = req.params;
        const index = dailyLogs.findIndex(l => l._id === id);

        if (index === -1) {
            const error = new Error(`Daily log with ID ${id} not found`);
            error.status = 404;
            throw error;
        }

        dailyLogs.splice(index, 1);

        // remove this log's meals too so none are left orphaned
        for (let i = mealEntries.length - 1; i >= 0; i--) {
            if (mealEntries[i].dailyLogId === id) mealEntries.splice(i, 1);
        }

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