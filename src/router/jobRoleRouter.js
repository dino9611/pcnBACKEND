import { checkBody } from '../lib/validator';
import express from 'express';
import { JobRole } from '../database/models';
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

// router.use(jwtAuth);

router.get('/', publicAuth, pagingParams, (req, res) => {
  const { offset, limit, jobRole } = req.query;
  let whereClause = {};

  if (jobRole) {
    whereClause = Object.assign(whereClause, {
      jobRole: { [Op.like]: `%${jobRole}%` }
    });
  }

  JobRole.findAll({
    where: whereClause,
    attributes: [ 'jobRole' ],
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

router.get('/:id', publicAuth, (req, res) => {
  JobRole.findByPk(req.params.id, {
    attributes: [ 'jobRole' ]
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

router.post('/', jwtAuth, checkBody([{ field: 'jobRole' }]), (req, res) => {
  try {
    const { jobRole } = req.body;

    JobRole.create({
      jobRole
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

router.put('/:id', jwtAuth, (req, res) => {
  JobRole.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { jobRole } = req.body;

      obj.
        update({
          jobRole: jobRole || obj.jobRole
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
