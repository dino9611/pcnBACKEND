import { Certification } from '../database/models';
import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

// router.use(jwtAuth);

router.get('/', publicAuth, pagingParams, (req, res) => {
  const { offset, limit, certification } = req.query;
  let whereClause = {};

  if (certification) {
    whereClause = Object.assign(whereClause, {
      certification: { [Op.like]: `%${certification}%` }
    });
  }

  Certification.findAll({
    where: whereClause,
    attributes: [ 'id', 'certification' ],
    offset,
    limit,
    order: [[ 'certification' ]]
  }).
    then(result => {
      Certification.count({ where: whereClause }).then(total => {
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

router.get('/:id', publicAuth, (req, res) => {
  Certification.findByPk(req.params.id, {
    attributes: [ 'id', 'certification' ]
  }).
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

router.post('/', jwtAuth, checkBody([{ field: 'certification' }]), (req, res) => {
  try {
    const { certification } = req.body;

    Certification.create({
      certification
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
});

router.put('/:id', jwtAuth, (req, res) => {
  Certification.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { certification } = req.body;

      obj.
        update({
          certification: certification || obj.certification
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

router.delete('/:id', jwtAuth, (req, res) => {
  Certification.findByPk(req.params.id).
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

export const CertificationRouter = router;
