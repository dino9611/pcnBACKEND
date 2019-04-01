import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import {
  StudentInvitation,
  StudentInvitationReschedule
} from '../database/models';

const router = express.Router();

const Op = sequelize.Op;

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit } = req.query;
  const whereClause = {};

  StudentInvitationReschedule.findAll({
    where: whereClause,
    offset,
    limit
  }).
    then(result => {
      StudentInvitationReschedule.count({ where: whereClause }).then(total => {
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
  StudentInvitationReschedule.findByPk(req.params.id).
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
    { field: 'studentInvitationId' },
    { field: 'scheduleDate' },
    { field: 'proposedBy' }
  ]),
  (req, res) => {
    try {
      const {
        studentInvitationId,
        scheduleDate,
        status,
        location,
        message,
        proposedBy
      } = req.body;

      // StudentInvitationReschedule.create({
      //   studentInvitationId,
      //   status: 'proposed',
      //   scheduleDate,
      //   location: location || '',
      //   message: message || '',
      //   proposedBy
      // })

      sequelize.
        transaction(tr => {
          return StudentInvitationReschedule.create(
            {
              studentInvitationId,
              status: status || 'proposed',
              scheduleDate,
              location: location || '',
              message: message || '',
              proposedBy
            },
            { transaction: tr }
          ).then(result => {
            return StudentInvitation.update(
              {
                status: 'rescheduled',
                updatedBy: proposedBy
              },
              {
                where: { id: studentInvitationId },
                transaction: tr
              }
            ).then(() => {
              return StudentInvitationReschedule.update(
                {
                  status: 'rescheduled'
                },
                {
                  where: {
                    id: { [Op.ne]: result.id },
                    studentInvitationId,
                    status: 'proposed'
                  },
                  transaction: tr
                }
              ).then(() => {
                return result;
              });

              // return result;
            });

            // let siStatus = 'proposed';

            // if (status === 'accepted') {
            //   siStatus = 'interview_accepted';

            // } else if (status === 'proposed') {
            //   return StudentInvitationReschedule.update(
            //     {
            //       status: 'rescheduled'
            //     },
            //     {
            //       where: {
            //         id: { [Op.ne]: result.id },
            //         studentInvitationId,
            //         status: 'proposed'
            //       },
            //       transaction: tr
            //     }
            //   ).then(() => {
            //     return result;
            //   });
            // }
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
  StudentInvitationReschedule.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        status,
        scheduleDate,
        location,
        message,
        proposedBy,
        interviewRejectedReason
      } = req.body;

      sequelize.
        transaction(tr => {
          return obj.
            update(
              {
                status: status || obj.status,
                scheduleDate: scheduleDate || obj.scheduleDate,
                location: location || obj.location,
                message: message || obj.message,
                proposedBy: proposedBy || obj.proposedBy
              },
              { transaction: tr }
            ).
            then(() => {
              if (status === 'accepted') {
                return StudentInvitation.update(
                  { status: 'interview_accepted', updatedBy: proposedBy },
                  { where: { id: obj.studentInvitationId }, transaction: tr }
                );
              } else if (status === 'rejected') {
                return StudentInvitation.update(
                  {
                    status: 'interview_rejected',
                    interviewRejectedReason: interviewRejectedReason || '',
                    updatedBy: proposedBy
                  },
                  { where: { id: obj.studentInvitationId }, transaction: tr }
                );
              }

              return obj;
            });
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
  StudentInvitationReschedule.findByPk(req.params.id).
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

export const StudentInvitationRescheduleRouter = router;
