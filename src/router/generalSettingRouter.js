import { checkBody } from '../lib/validator';
import express from 'express';
import { GeneralSetting } from '../database/models';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';

const router = express.Router();

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit, section, subsection } = req.query;
  let whereClause = {};

  if (section) {
    whereClause = Object.assign(whereClause, {
      section
    });
  }
  if (subsection) {
    whereClause = Object.assign(whereClause, {
      subsection
    });
  }

  GeneralSetting.findAll({
    attributes: [ 'key', 'value' ],
    where: whereClause,
    offset,
    limit
  }).
    then(result => {
      GeneralSetting.count({ where: whereClause }).then(total => {
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
  GeneralSetting.findByPk(req.params.id).
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
    { field: 'key' },
    { field: 'value' },
    { field: 'kesectiony' },
    { field: 'subsection' }
  ]),
  (req, res) => {
    try {
      const { key, value, section, subsection } = req.body;

      GeneralSetting.create({
        key,
        value,
        section,
        subsection
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
          let errorMessage = '';

          if (error.name) {
            if (error.name === 'SequelizeUniqueConstraintError') {
              errorMessage =
                'Validation error : some field value must be unique.';
            }
          }

          return errorResponse(error, res, errorMessage);
        });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', (req, res) => {
  if (req.params.id === 'bulk') {
    const data = req.body;

    if (Array.isArray(data)) {
      sequelize.
        transaction(tr => {
          const processList = [];

          for (const dt of data) {
            let updatedData = {};

            // if (dt.key) {
            //   updatedData = {
            //     updatedData,
            //     ...{ key: dt.key }
            //   };
            // }
            if (dt.value) {
              updatedData = {
                updatedData,
                ...{ value: dt.value }
              };
            }

            processList.push(
              GeneralSetting.update(updatedData, {
                where: { key: dt.key },
                transaction: tr
              })
            );
          }

          return Promise.all(processList);
        }).
        then(() => {
          return res.json({
            message: 'Data Saved !',
            result: {
              status: responseStatus.SUCCESS,
              message: 'Data updated !'
            }
          });
        }).
        catch(error => {
          return errorResponse(error, res);
        });
    }
  } else {
    GeneralSetting.findByPk(req.params.id).
      then(obj => {
        if (!obj) {
          return res.json({
            status: responseStatus.NOT_FOUND,
            message: 'Data not found !'
          });
        }
        const { key, value, section, subsection } = req.body;

        obj.
          update({
            key: key || obj.key,
            value: value || obj.value,
            section: section || obj.section,
            subsection: subsection || obj.subsection
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
  }
});

router.delete('/:id', (req, res) => {
  GeneralSetting.findByPk(req.params.id).
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

export const GeneralSettingRouter = router;
