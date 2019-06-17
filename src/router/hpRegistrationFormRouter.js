import { checkBody } from '../lib/validator';
import express from 'express';
import { HPRegistrationForm } from '../database/models';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

// router.use(publicAuth);

router.get('/', publicAuth, pagingParams, (req, res) => {
  const { offset, limit, value, key } = req.query;
  let whereClause = {};

  if (value) {
    whereClause = Object.assign(whereClause, {
      value: { [Op.like]: `%${value}%` }
    });
  }
  if (key) {
    whereClause = Object.assign(whereClause, {
      key
    });
  }

  HPRegistrationForm.findAll({
    where: whereClause,
    attributes: [
      'id',
      'key',
      'value'
    ],
    offset,
    limit
  }).
    then(result => {
      HPRegistrationForm.count({ where: whereClause }).then(total => {
        res.json({
          status: responseStatus.SUCCESS,
          message: 'Get data success !',
          result: result || [],
          total
        });
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.get('/:id', publicAuth, (req, res) => {
  HPRegistrationForm.findByPk(req.params.id, {
    attributes: [
      'id',
      'key',
      'value'
    ]
  }).
    then(result => {
      res.json({
        status: result ? responseStatus.SUCCESS : responseStatus.NOT_FOUND,
        message: result ? 'Get data success !' : 'Data not found',
        result: result || {}
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.post(
  '/',
  jwtAuth,
  checkBody([
    { field: 'key' },
    { field: 'value' }
  ]),
  (req, res) => {
    try {
      const {
        key,
        value
      } = req.body;

      HPRegistrationForm.create({
        key,
        value
      }).
        then(result => {
          return res.json({
            status: responseStatus.SUCCESS,
            message: 'Data Saved !',
            result: {
              id: result.id
            }
          });
        }).
        catch(error => {
          return errorResponse(error, res);
        });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', jwtAuth, (req, res) => {
  HPRegistrationForm.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        key,
        value
      } = req.body;

      obj.
        update({
          key: key || obj.key,
          value: value || obj.value
        }).
        then(() =>
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data updated !',
            result: {
              id: obj.id
            }
          })).
        catch(error => {
          return errorResponse(error, res);
        });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.delete('/:id', jwtAuth, (req, res) => {
  HPRegistrationForm.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }

      obj.
        destroy().
        then(() => {
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data deleted !',
            result: {
              id: obj.id
            }
          });
        }).
        catch(error => {
          return errorResponse(error, res);
        });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

export const HPRegistrationFormRouter = router;
