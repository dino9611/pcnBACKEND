import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import { Certification, StudentCertification } from '../database/models';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';

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

  StudentCertification.findAll({
    where: whereClause,
    offset,
    limit,
    include: [
      { model: Certification, as: 'certification', attributes: [ 'id', 'certification' ]}
    ],
    order: [[ 'position', 'ASC' ]]
  }).
    then(result => {
      StudentCertification.count({ where: whereClause }).then(total => {
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
  StudentCertification.findByPk(req.params.id).
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
    { field: 'certificationId' }
  ]),
  (req, res) => {
    try {
      const {
        studentResumeId,
        certificationId,
        position
      } = req.body;

      StudentCertification.create({
        studentResumeId,
        certificationId,
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

            if (dt.certificationId) {
              updatedData = {
                updatedData,
                ...{ certificationId: dt.certificationId }
              };
            }
            if (dt.position !== 'undefined' || dt.position !== undefined) {
              updatedData = {
                updatedData,
                ...{ position: dt.position }
              };
            }

            processList.push(
              StudentCertification.update(updatedData, {
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
    StudentCertification.findByPk(req.params.id).
      then(obj => {
        if (!obj) {
          return res.json({
            status: responseStatus.NOT_FOUND,
            message: 'Data not found !'
          });
        }
        const {
          certificationId,
          position
        } = req.body;

        obj.
          update({
            certificationId: certificationId || obj.certificationId,
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
  StudentCertification.findByPk(req.params.id).
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

export const StudentCertificationRouter = router;
