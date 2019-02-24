import { checkBody } from '../lib/validator';
import express from 'express';
import { JobRole } from '../database/models';
import sequelize from '../database/sequelize';
import {
  basicAuth,
  errorResponse,
  pagingParams,
  responseStatus,
  tokenAuth
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

// router.use(tokenAuth);

router.get('/', basicAuth, pagingParams, (req, res) => {
  const { offset, limit, role } = req.query;
  let whereClause = {};

  if (role) {
    whereClause = Object.assign(whereClause, {
      role: { [Op.like]: `%${role}%` }
    });
  }

  JobRole.findAll({
    where: whereClause,
    attributes: [ 'role' ],
    offset,
    limit
  }).
    then(result => {
      JobRole.count({ where: whereClause }).then(total => {
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

router.get('/:id', basicAuth, (req, res) => {
  JobRole.findByPk(req.params.id, {
    attributes: [ 'role' ]
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

router.post('/', tokenAuth, checkBody([{ field: 'role' }]), (req, res) => {
  try {
    const { role } = req.body;

    JobRole.create({
      role
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
});

router.put('/:id', tokenAuth, (req, res) => {
  JobRole.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { role } = req.body;

      obj.
        update({
          role: role || obj.role
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

router.delete('/:id', tokenAuth, (req, res) => {
  JobRole.findByPk(req.params.id).
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

export const JobRoleRouter = router;
