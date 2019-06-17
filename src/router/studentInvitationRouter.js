import { checkBody } from '../lib/validator';
import express from 'express';
import moment from 'moment';
import sequelize from '../database/sequelize';
// import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import {
  HiringPartner,
  Student,
  StudentInvitation,
  StudentInvitationReschedule,
  User
} from '../database/models';

const router = express.Router();
const Op = sequelize.Op;

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit, status, studentId, hiringPartnerId } = req.query;
  let whereClause = {
    scheduleDate: {
      [Op.gte]: moment()
        .subtract(7, 'days')
        .toDate()
    }
  };

  if (status) {
    if (Array.isArray(status)) {
      const statuses = status.map(val => {
        return {
          status: val
        };
      });

      whereClause = { ...whereClause, [Op.or]: statuses };
    } else {
      whereClause = { ...whereClause, status };
    }
  }
  if (studentId) {
    whereClause = { ...whereClause, studentId };
  }
  if (hiringPartnerId) {
    whereClause = { ...whereClause, hiringPartnerId };
  }

  StudentInvitation.findAll({
    where: whereClause,
    offset,
    limit,
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
            attributes: ['email', 'profilePicture', 'type']
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
          'linkedin',
          'useHiringFee'
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['email', 'profilePicture', 'type']
          }
        ]
      },
      {
        model: StudentInvitationReschedule,
        as: 'studentInvitationReschedule',
        order: [['createdAt', 'DESC']],
        limit: 1
      }
    ],
    order: [['updatedAt', 'DESC']]
  })
    .then(result => {
      StudentInvitation.count({ where: whereClause }).then(total => {
        res.json({
          status: responseStatus.SUCCESS,
          message: 'Get data success !',
          result: result || [],
          total
        });
      });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.get('/:id', (req, res) => {
  StudentInvitation.findByPk(req.params.id)
    .then(result => {
      res.json({
        status: result ? responseStatus.SUCCESS : responseStatus.NOT_FOUND,
        message: result ? 'Get data success !' : 'Data not found',
        result: result || {}
      });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.post(
  '/',
  checkBody([
    { field: 'studentId' },
    { field: 'hiringPartnerId' },
    { field: 'scheduleDate' },
    { field: 'location' }
  ]),
  (req, res) => {
    try {
      const {
        studentId,
        hiringPartnerId,
        scheduleDate,
        location,
        message,
        interviewRejectedReason,
        updatedBy,
        rejectedReason
      } = req.body;

      StudentInvitation.create({
        studentId,
        hiringPartnerId,
        status: 'new',
        scheduleDate,
        location,
        message: message || '',
        interviewRejectedReason: interviewRejectedReason || '',
        updatedBy: updatedBy || '',
        rejectedReason: rejectedReason || ''
      })
        .then(result => {
          return res.json({
            status: responseStatus.SUCCESS,
            message: 'Data Saved !',
            result: {
              id: result.id
            }
          });
        })
        .catch(error => {
          return errorResponse(error, res);
        });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', (req, res) => {
  StudentInvitation.findByPk(req.params.id)
    .then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        studentId,
        status,
        scheduleDate,
        location,
        message,
        interviewRejectedReason,
        updatedBy,
        rejectedReason
      } = req.body;

      obj
        .update({
          studentId: studentId || obj.studentId,
          status: status || obj.status,
          scheduleDate: scheduleDate || obj.scheduleDate,
          location: location || obj.location,
          message: message || obj.message,
          interviewRejectedReason:
            interviewRejectedReason || obj.interviewRejectedReason,
          updatedBy: updatedBy || obj.updatedBy,
          rejectedReason: rejectedReason || obj.rejectedReason
        })
        .then(() =>
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data updated !',
            result: {
              id: obj.id
            }
          })
        )
        .catch(error => {
          return errorResponse(error, res);
        });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.delete('/:id', (req, res) => {
  StudentInvitation.findByPk(req.params.id)
    .then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }

      obj
        .destroy()
        .then(() => {
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data deleted !',
            result: {
              id: obj.id
            }
          });
        })
        .catch(error => {
          return errorResponse(error, res);
        });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

export const StudentInvitationRouter = router;
