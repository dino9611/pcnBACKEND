import { checkBody } from '../lib/validator';
import express from 'express';
import { StudentWorkExperience } from '../database/models';
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

  StudentWorkExperience.findAll({
    where: whereClause,
    offset,
    limit
  }).
    then(result => {
      StudentWorkExperience.count({ where: whereClause }).then(total => {
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
  StudentWorkExperience.findByPk(req.params.id).
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
    { field: 'jobTitle' },
    { field: 'company' },
    { field: 'from' },
    { field: 'to' }
  ]),
  (req, res) => {
    try {
      const {
        studentResumeId,
        jobTitle,
        company,
        from,
        to,
        description
      } = req.body;

      StudentWorkExperience.create({
        studentResumeId,
        jobTitle,
        company,
        from,
        to,
        description: description || ''
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
  StudentWorkExperience.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        jobTitle,
        company,
        from,
        to,
        description
      } = req.body;

      obj.
        update({
          jobTitle: jobTitle || obj.jobTitle,
          company: company || obj.company,
          from: from || obj.from,
          to: to || obj.to,
          description: description || obj.description
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
  StudentWorkExperience.findByPk(req.params.id).
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

export const StudentWorkExperienceRouter = router;
