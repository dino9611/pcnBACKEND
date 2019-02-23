import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import { Skill } from '../database/models';
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
  const { offset, limit, skill } = req.query;
  let whereClause = {};

  if (skill) {
    whereClause = Object.assign(whereClause, {
      skill: { [Op.like]: `%${skill}%` }
    });
  }

  Skill.findAll({
    where: whereClause,
    attributes: [ 'skill' ],
    offset,
    limit
  }).
    then(result => {
      Skill.count({ where: whereClause }).then(total => {
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
  Skill.findByPk(req.params.id, {
    attributes: [ 'skill' ]
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

router.post('/', tokenAuth, checkBody([{ field: 'skill' }]), (req, res) => {
  try {
    const { skill } = req.body;

    Skill.create({
      skill
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
  Skill.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { skill } = req.body;

      obj.
        update({
          skill: skill || obj.skill
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
  Skill.findByPk(req.params.id).
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

export const SkillRouter = router;
