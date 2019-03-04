import { checkBody } from '../lib/validator';
import express from 'express';
import { Province } from '../database/models';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  pagingParams,
  publicAuth,
  responseStatus
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

router.use(publicAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit, province } = req.query;
  let whereClause = {};

  if (province) {
    whereClause = Object.assign(whereClause, {
      province: { [Op.like]: `%${province}%` }
    });
  }

  Province.findAll({
    where: whereClause,
    attributes: [ 'id', 'province' ],
    offset,
    limit
  }).
    then(result => {
      Province.count({ where: whereClause }).then(total => {
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
  Province.findByPk(req.params.id, {
    attributes: [ 'province' ]
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

router.post('/', checkBody([{ field: 'province' }]), (req, res) => {
  try {
    const { province } = req.body;

    Province.create({
      province
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

router.put('/:id', (req, res) => {
  Province.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { province } = req.body;

      obj.
        update({
          province: province || obj.province
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
  Province.findByPk(req.params.id).
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
              id: obj.id,
              province: obj.province
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

export const ProvinceRouter = router;
