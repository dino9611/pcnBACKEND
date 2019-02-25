import { checkBody } from '../lib/validator';
import express from 'express';
import { StudentInvitationReschedule } from '../database/models';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';

const router = express.Router();

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
        location,
        message,
        proposedBy
      } = req.body;

      StudentInvitationReschedule.create({
        studentInvitationId,
        status: 'proposed',
        scheduleDate,
        location: location || '',
        message: message || '',
        proposedBy
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
        proposedBy
      } = req.body;

      obj.
        update({
          status: status || obj.status,
          scheduleDate: scheduleDate || obj.scheduleDate,
          location: location || obj.location,
          message: message || obj.message,
          proposedBy: proposedBy || obj.proposedBy
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
