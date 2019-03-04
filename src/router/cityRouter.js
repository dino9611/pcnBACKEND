import { checkBody } from '../lib/validator';
import { City } from '../database/models';
import express from 'express';
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
  const { offset, limit, city, provinceId } = req.query;
  let whereClause = {};

  if (city) {
    whereClause = Object.assign(whereClause, {
      city: { [Op.like]: `%${city}%` }
    });
  }

  if (provinceId) {
    whereClause = Object.assign(whereClause, {
      provinceId
    });
  }
  City.findAll({
    where: whereClause,
    attributes: [ 'city' ],
    offset,
    limit
  }).
    then(result => {
      City.count({ where: whereClause }).then(total => {
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
  City.findByPk(req.params.id, {
    attributes: [ 'city' ]
  }).
    then(result => {
      res.json({
        status: result ? responseStatus.SUCCESS : responseStatus.NOT_FOUND,
        message: result ? 'Get data success !' : 'Data not found',
        result
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.post('/', checkBody([{ field: 'city' }]), (req, res) => {
  try {
    const { city } = req.body;

    City.create({
      city
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
  City.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { city } = req.body;

      obj.
        update({
          name: city || obj.city
        }).
        then(() =>
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data updated !',
            result: {
              id: obj.id,
              name: obj.name
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
  City.findByPk(req.params.id).
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
              name: obj.name
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

export const CityRouter = router;
