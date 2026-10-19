import { Router } from "express";
import { getAllLogs, getLogById, createLog, updateLog, deleteLog } from "../controllers/logController.js";
import { validateLog, validateUpdateLog } from '../middleware/validateLog.js';

const router = Router();

router.get('/', getAllLogs);

router.get('/:id', getLogById);

router.post('/', validateLog, createLog);

// PUT and DELETE routes for a specific log ID
router.put('/:id', validateUpdateLog, updateLog);
router.delete('/:id', deleteLog);

export default router;