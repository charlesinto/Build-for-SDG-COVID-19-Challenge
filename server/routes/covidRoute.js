import express from 'express';
import { calculateImpact, getLogs } from '../controller/covidController';

const router = express.Router();

router.post('/', calculateImpact);
router.post('/:format', calculateImpact);
router.get('/logs', getLogs);

export default router;
