import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import { HiringPartner, Student, StudentHiredReport, StudentInvitation, User } from '../database/models';

const router = express.Router();

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit, resigned } = req.query;
  let whereClause = {};

  if (resigned !== 'undefined') {
    const status = resigned === 'true';

    whereClause = { ...whereClause, resigned: status };
  }

  StudentHiredReport.findAll({
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
      },
      {
        model: HiringPartner,
        as: 'hiringPartner',
        attributes: [
          'slug',
          'name',
          'phoneNumber',
          'province',
          'city',
          'address',
          'summary',
          'teamSize',
          'profileVideo',
          'website',
          'facebook',
          'linkedin'
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
    limit,
    order: [[ 'updatedAt', 'DESC' ]]
  }).
    then(result => {
      StudentHiredReport.count({ where: whereClause }).then(total => {
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
  StudentHiredReport.findByPk(req.params.id).
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
    { field: 'id' },
    { field: 'studentId' },
    { field: 'hiringPartnerId' },
    { field: 'startDate' }
  ]),
  (req, res) => {
    try {
      const {
        id,
        studentId,
        hiringPartnerId,
        jobTitle,
        location,
        startDate,
        salary
      } = req.body;

      sequelize.
        transaction(tr => {
          return StudentHiredReport.create({
            id,
            studentId,
            hiringPartnerId,
            jobTitle: jobTitle || '',
            location: location || '',
            startDate: startDate || '',
            salary: salary || 0
          }, { transaction: tr }).then(result => {
            return StudentInvitation.update({
              status: 'hired',
              updatedBy: 'hiring-partner'
            }, {
              where: { id },
              transaction: tr
            }).then(() => {
              return result;
            });
          });
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
  StudentHiredReport.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { jobTitle, location, startDate, salary } = req.body;

      obj.
        update({
          jobTitle: jobTitle || obj.jobTitle,
          location: location || obj.location,
          startDate: startDate || obj.startDate,
          salary: salary || obj.salary
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
  StudentHiredReport.findByPk(req.params.id).
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

export const StudentHiredReportRouter = router;
