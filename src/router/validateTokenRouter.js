import express from 'express';
import {
  jwtAuth,
  responseStatus
} from '../helper';

const router = express.Router();

router.post('/', jwtAuth, (req, res) => {
  return res.json({
    status: responseStatus.SUCCESS
  });
});

export const ValidateTokenRouter = router;
