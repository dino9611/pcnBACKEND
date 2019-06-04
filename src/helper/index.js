export * from './auth';
export * from './encryption';
export * from './slug';
export * from './uploader';
export * from './mail';
import config from '../config.json';
import logger from '../log/logger';

export const responseStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_VALID: 'NOT_VALID'
};

export const pagingParams = (req, res, next) => {
  const { all, page, pagesize } = req.query;
  let offset = null;
  let limit = null;

  if (all === undefined) {
    const pSize = pagesize || config.DATAPERREQUEST || 15;

    offset = parseInt(((page || 1) - 1) * pSize, 10);
    limit = parseInt(pSize, 10);
  }
  req.query.offset = offset;
  req.query.limit = limit;

  next();
};

export const errorResponse = (error, res, customMessage) => {
  const errData = {
    errorMessage: error.message,
    error
  };

  logger.error(JSON.stringify(errData));

  return res.status(500).json({
    status: responseStatus.ERROR,
    message:
      customMessage ||
      'There\'s an error on the server. Please contact the administrator.'
  });
};
