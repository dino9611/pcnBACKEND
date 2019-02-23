import { checkBody } from '../lib/validator';
import express from 'express';
import { JobCategory } from '../database/models';
import sequelize from '../database/sequelize';
import {
  basicAuth,
  errorResponse,
  pagingParams,
  responseStatus,
  tokenAuth
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

// router.use(tokenAuth);

router.get('/', basicAuth, pagingParams, (req, res) => {
  const { offset, limit, category } = req.query;
  let whereClause = {};

  if (category) {
    whereClause = Object.assign(whereClause, {
      category: { [Op.like]: `%${category}%` }
    });
  }

  JobCategory.findAll({
    where: whereClause,
    attributes: [ 'category' ],
    offset,
    limit
  }).
    then(result => {
      JobCategory.count({ where: whereClause }).then(total => {
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

router.get('/:id', basicAuth, (req, res) => {
  JobCategory.findByPk(req.params.id, {
    attributes: [ 'category' ]
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

router.post('/', tokenAuth, checkBody([{ field: 'category' }]), (req, res) => {
  try {
    const { category } = req.body;

    JobCategory.create({
      category
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

router.put('/:id', tokenAuth, (req, res) => {
  JobCategory.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { category } = req.body;

      obj.
        update({
          category: category || obj.category
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

router.delete('/:id', tokenAuth, (req, res) => {
  JobCategory.findByPk(req.params.id).
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

export const JobCategoryRouter = router;
