import { validate } from './core';

// import _ from 'lodash';

// // belum selesai, sementara di disable dulu
// export const check = (params) => {
//     return (req, res, next) => {
//         const resBody = validate(params, req.body);
//         const resQuery = validate(params, req.query);
//         const resParams = validate(params, req.params);
//         const result = _.unionBy(resBody, resQuery, resParams, 'field');
//         req.validationResult = result;
//         next();
//     }
// }

const check = (req, res, next, params, source) => {
  const result = validate(params, source);

  if (result.length > 0) {
    res.status(422).json({
      message: 'Requested data is not valid',
      error: result
    });
  } else {
    return next();
  }
};

export const checkBody = params => (req, res, next) => {
  check(req, res, next, params, req.body);
};

export const checkQuery = params => (req, res, next) => {
  check(req, res, next, params, req.query);
};

export const checkParams = params => (req, res, next) => {
  check(req, res, next, params, req.params);
};
