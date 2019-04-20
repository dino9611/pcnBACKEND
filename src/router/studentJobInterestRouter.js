import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import { JobRole, StudentJobInterest } from '../database/models';

const router = express.Router();

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit, studentResumeId } = req.query;
  let whereClause = {};

  if (studentResumeId) {
    whereClause = Object.assign(whereClause, {
      studentResumeId
    });
  }

  StudentJobInterest.findAll({
    where: whereClause,
    offset,
    limit,
    include: [{ model: JobRole, as: 'jobRole', attributes: [ 'id', 'jobRole' ]}],
    order: [[ 'highlight', 'DESC' ]]
  }).
    then(result => {
      StudentJobInterest.count({ where: whereClause }).then(total => {
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

router.get('/:id', (req, res) => {
  StudentJobInterest.findByPk(req.params.id).
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
  checkBody([{ field: 'studentResumeId' }, { field: 'jobRoleId' }]),
  (req, res) => {
    try {
      const { studentResumeId, jobRoleId, experience, highlight } = req.body;

      StudentJobInterest.create({
        studentResumeId,
        jobRoleId,
        experience: experience || 0,
        highlight
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

router.put('/:id', (req, res) => {
  if (req.params.id === 'bulk') {
    const data = req.body;

    if (Array.isArray(data)) {
      sequelize.
        transaction(tr => {
          const processList = [];

          for (const dt of data) {
            let updatedData = {};

            if (dt.jobRoleId) {
              updatedData = {
                updatedData,
                ...{ jobRoleId: dt.jobRoleId }
              };
            }
            if (dt.experience) {
              updatedData = {
                updatedData,
                ...{ experience: dt.experience }
              };
            }
            if (dt.highlight !== 'undefined' || dt.highlight !== undefined) {
              updatedData = {
                updatedData,
                ...{ highlight: dt.highlight }
              };
            }

            processList.push(
              StudentJobInterest.update(updatedData, {
                where: { id: dt.id },
                transaction: tr
              })
            );
          }

          return Promise.all(processList);
        }).
        then(() => {
          return res.json({
            message: 'Data Saved !',
            result: {
              status: responseStatus.SUCCESS,
              message: 'Data updated !'
            }
          });
        }).
        catch(error => {
          return errorResponse(error, res);
        });
    }
  } else {
    StudentJobInterest.findByPk(req.params.id).
      then(obj => {
        if (!obj) {
          return res.json({
            status: responseStatus.NOT_FOUND,
            message: 'Data not found !'
          });
        }
        const { jobRoleId, experience, highlight } = req.body;

        obj.
          update({
            jobRoleId: jobRoleId || obj.jobRoleId,
            experience: experience || obj.experience,
            highlight: highlight === 'undefined' ? obj.highlight : highlight
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
  }
});

router.delete('/:id', (req, res) => {
  StudentJobInterest.findByPk(req.params.id).
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

export const StudentJobInterestRouter = router;
