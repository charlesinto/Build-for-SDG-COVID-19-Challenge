import express from 'express';
import { calculateImpact, getLogs } from '../controller/covidController';

const router = express.Router();

router.post('/', calculateImpact);
router.post('/:format', calculateImpact);
router.get('/', getLogs);
router.get('/:format', getLogs);

export default router;
