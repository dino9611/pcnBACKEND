import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import { Skill, StudentSkill } from '../database/models';

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

  StudentSkill.findAll({
    where: whereClause,
    offset,
    limit,
    include: [
      { model: Skill, as: 'skill', attributes: [ 'id', 'skill' ]}
    ],
    order: [[ 'position' ]]
  }).
    then(result => {
      StudentSkill.count({ where: whereClause }).then(total => {
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
  StudentSkill.findByPk(req.params.id).
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
  checkBody([
    { field: 'studentResumeId' },
    { field: 'skillId' }
  ]),
  (req, res) => {
    try {
      const {
        studentResumeId,
        skillId,
        position
      } = req.body;

      StudentSkill.create({
        studentResumeId,
        skillId,
        position: position || 0
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

            if (dt.skillId) {
              updatedData = {
                updatedData,
                ...{ skillId: dt.skillId }
              };
            }
            if (dt.position !== 'undefined' || dt.position !== undefined) {
              updatedData = {
                updatedData,
                ...{ position: dt.position }
              };
            }

            processList.push(
              StudentSkill.update(updatedData, {
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
    StudentSkill.findByPk(req.params.id).
      then(obj => {
        if (!obj) {
          return res.json({
            status: responseStatus.NOT_FOUND,
            message: 'Data not found !'
          });
        }
        const {
          skillId,
          position
        } = req.body;

        obj.
          update({
            skillId: skillId || obj.skillId,
            position: position || obj.position
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
  StudentSkill.findByPk(req.params.id).
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

export const StudentSkillRouter = router;
