import { checkBody } from '../lib/validator';
import express from 'express';
import { Program } from '../database/models';
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
  const { offset, limit, program } = req.query;
  let whereClause = {};

  if (program) {
    whereClause = Object.assign(whereClause, {
      program: { [Op.like]: `%${program}%` }
    });
  }

  Program.findAll({
    where: whereClause,
    attributes: [ 'program' ],
    offset,
    limit
  }).
    then(result => {
      Program.count({ where: whereClause }).then(total => {
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
  Program.findByPk(req.params.id, {
    attributes: [ 'program' ]
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

router.post('/', tokenAuth, checkBody([{ field: 'program' }]), (req, res) => {
  try {
    const { program } = req.body;

    Program.create({
      program
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
  Program.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { program } = req.body;

      obj.
        update({
          program: program || obj.program
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
  Program.findByPk(req.params.id).
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

export const ProgramRouter = router;
