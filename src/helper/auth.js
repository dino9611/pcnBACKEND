import config from '../config.json';
import jwt from 'jsonwebtoken';
import { responseStatus } from './';
const jwtKey = config.JWTKEY || 'careernetwork';

export const createJWTToken = payload => {
  return jwt.sign(payload, jwtKey, { expiresIn: '3h' });
};

export const validateBearerToken = (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    // let success = true;
    jwt.verify(req.token, jwtKey, (error, decoded) => {
      if (error) {
        // success = false;
        return res.status(401).json({
          status: responseStatus.UNAUTHORIZED,
          message: 'User not authorized.'
        });
      }
      req.user = decoded;
      next();
    });

    // next();
  } else {
    return next();
  }
};

export const auth = (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    // let success = true;
    jwt.verify(req.token, jwtKey, (error, decoded) => {
      if (error) {
        // success = false;
        return res.status(401).json({
          status: responseStatus.UNAUTHORIZED,
          message: 'User not authorized.'
        });
      }
      req.user = decoded;
      next();
    });
  } else {
    return next();
  }
};
