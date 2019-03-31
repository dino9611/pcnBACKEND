import config from '../config.json';
import express from 'express';
import fs from 'fs';
import { validate } from '../lib/validator/core';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus,
  uploader
} from '../helper';
import { Student, StudentHiredReport, StudentResignedReport, User } from '../database/models';

const router = express.Router();
const hostName = config.HOSTNAME;
const path = '/files/student/resigned';

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit } = req.query;
  const whereClause = {};

  StudentResignedReport.findAll({
    where: whereClause,
    include: [
      {
        model: Student,
        as: 'student',
        attributes: [
          'slug',
          'name',
          'phoneNumber',
          'province',
          'city',
          'address',
          'birthDate',
          'gender',
          'isAvailable'
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: [ 'email', 'profilePicture', 'type' ]
          }
        ]
      }
    ],
    offset,
    limit
  }).
    then(result => {
      StudentResignedReport.count({ where: whereClause }).then(total => {
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
  StudentResignedReport.findByPk(req.params.id).
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
  (req, res) => {
    const upload = uploader(path, 'SR', {
      profilePicture: 'pdf|doc|docx'
    }).fields([{ name: 'suratResign' }]);

    try {
      upload(req, res, err => {
        // check upload image process
        if (err) {
          return errorResponse(err.message, res, err.message);
        }

        const { suratResign } = req.files;
        const {
          id,
          studentId,
          hiringPartnerId,
          reason,
          resignationDate
        } = req.body;
        const suratResignPath = suratResign ?
          `${path}/${suratResign[0].filename}` :
          null;

        // form validation
        const validationResult = validate(
          [
            { field: 'id' },
            { field: 'hiringPartnerId' },
            { field: 'studentId' }
          ],
          req.body
        );

        if (validationResult.length > 0) {
          if (suratResignPath) {
            fs.unlinkSync(`./src/public${suratResignPath}`);
          }

          return res.status(422).json({
            status: responseStatus.NOT_VALID,
            message: 'Requested data is not valid',
            result: validationResult
          });
        }

        try {
          StudentResignedReport.create({
            id,
            studentId,
            hiringPartnerId,
            reason: reason || '',
            resignationDate,
            suratResign: suratResign ?
              `${hostName}${suratResignPath}` :
              null
          }).
            then(result => {
              StudentHiredReport.update({
                resigned: true
              }, {
                where: { id }
              }).then(() => {
                return res.json({
                  status: responseStatus.SUCCESS,
                  message: 'Data Saved !',
                  result: {
                    id: result.id
                  }
                });
              }).
                catch(error => {
                  if (suratResignPath) {
                    fs.unlinkSync(`./src/public${suratResignPath}`);
                  }

                  return errorResponse(error, res);
                });
            }).
            catch(error => {
              if (suratResignPath) {
                fs.unlinkSync(`./src/public${suratResignPath}`);
              }

              return errorResponse(error, res);
            });
        } catch (error) {
          if (suratResignPath) {
            fs.unlinkSync(`./src/public${suratResignPath}`);
          }

          return errorResponse(error, res);
        }
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', (req, res) => {
  StudentResignedReport.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        reason,
        resignationDate
      } = req.body;

      obj.
        update({
          reason: reason || obj.reason,
          resignationDate: resignationDate || obj.resignationDate
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

router.delete('/:id', (req, res) => {
  StudentResignedReport.findByPk(req.params.id).
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

export const StudentResignedReportRouter = router;
