import { checkBody } from '../lib/validator';
import express from 'express';
import { StudentHiredReport } from '../database/models';
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

  StudentHiredReport.findAll({
    where: whereClause,
    offset,
    limit
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
    { field: 'studentId' },
    { field: 'hiringPartnertId' },
    { field: 'startDate' }
  ]),
  (req, res) => {
    try {
      const {
        studentId,
        hiringPartnerId,
        jobTitle,
        location,
        startDate,
        salary
      } = req.body;

      StudentHiredReport.create({
        studentId,
        hiringPartnerId,
        jobTitle: jobTitle || '',
        location: location || '',
        startDate: startDate || '',
        salary: salary || 0
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
      const {
        jobTitle,
        location,
        startDate,
        salary
      } = req.body;

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
