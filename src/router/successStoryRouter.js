import config from '../config.json';
import express from 'express';
import fs from 'fs';
import sequelize from '../database/sequelize';
import { SuccessStory } from '../database/models';
import { validate } from '../lib/validator/core';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus,
  uploader
} from '../helper';

const hostName = config.HOSTNAME;
const router = express.Router();
const path = '/files/successStory';
const Op = sequelize.Op;

router.get('/', publicAuth, pagingParams, (req, res) => {
  const { limit, offset, name, type } = req.query;
  let whereClause = {};

  if (name) {
    whereClause = Object.assign(whereClause, {
      name: { [Op.like]: `%${name}%` }
    });
  }

  if (type) {
    whereClause = Object.assign(whereClause, {
      type
    });
  }

  SuccessStory.findAll({
    where: whereClause,
    offset,
    limit,
    order: [ 'type', 'position' ]
  }).
    then(result => {
      if (!result) {
        return res.json({
          status: responseStatus.SUCCESS,
          message: 'Get data success !',
          result: [],
          total: 0
        });
      }

      result.forEach(ss => {
        ss.additionalInfo = JSON.parse(ss.additionalInfo);
        ss.qna = JSON.parse(ss.qna);
      });

      SuccessStory.count({
        where: whereClause
      }).then(total => {
        return res.json({
          status: responseStatus.SUCCESS,
          message: 'Get data success !',
          result,
          total
        });
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.get('/:id', publicAuth, (req, res) => {
  SuccessStory.findByPk(req.params.id, {
    attributes: [
      'id',
      'type',
      'photo',
      'name',
      'title',
      'headline',
      'additionalInfo',
      'video',
      'qna',
      'position'
    ]
  }).
    then(result => {
      if (result) {
        result.additionalInfo = JSON.parse(result.additionalInfo);
        result.qna = JSON.parse(result.qna);
      }

      return res.json({
        status: result ? responseStatus.SUCCESS : responseStatus.NOT_FOUND,
        message: 'Get data success !',
        result: result || {}
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.post('/', jwtAuth, (req, res) => {
  const upload = uploader(path, 'SS', {
    photo: 'jpg|jpeg|png'
  }).fields([{ name: 'photo' }]);

  try {
    upload(req, res, err => {
      // check upload image process
      if (err) {
        return errorResponse(err.message, res, err.message);
      }

      const { photo } = req.files;
      const {
        type,
        name,
        title,
        headline,
        additionalInfo,
        video,
        qna,
        position
      } = req.body;
      const photoPath = photo ? `${path}/${photo[0].filename}` : null;

      // form validation
      const validationResult = validate(
        [{ field: 'type' }, { field: 'name' }],
        req.body
      );

      if (validationResult.length > 0) {
        if (photoPath) {
          fs.unlinkSync(`./src/public${photoPath}`);
        }

        return res.status(422).json({
          status: responseStatus.NOT_VALID,
          message: 'Requested data is not valid',
          result: validationResult
        });
      }

      SuccessStory.create({
        type,
        name,
        title,
        headline,
        additionalInfo: JSON.stringify(additionalInfo),
        video,
        qna: JSON.stringify(qna),
        position: position || 0,
        photo: photoPath ? `${hostName}${photoPath}` : null
      }).
        then(result => {
          return res.json({
            message: 'Data Saved !',
            result: {
              id: result.id
            }
          });
        }).
        catch(error => {
          if (photoPath) {
            fs.unlinkSync(`./src/public${photoPath}`);
          }

          return errorResponse(error, res);
        });
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.put('/:id', jwtAuth, (req, res) => {
  const upload = uploader(path, 'SS', {
    photo: 'jpg|jpeg|png'
  }).fields([{ name: 'photo' }]);

  try {
    upload(req, res, err => {
      // check upload image process
      if (err) {
        return errorResponse(err.message, res, err.message);
      }

      const { photo } = req.files;
      const {
        type,
        name,
        title,
        headline,
        additionalInfo,
        video,
        qna,
        position
      } = req.body;
      const photoPath = photo ? `${path}/${photo[0].filename}` : null;

      try {
        SuccessStory.findByPk(req.params.id).
          then(obj => {
            if (!obj) {
              return res.json({
                status: responseStatus.NOT_FOUND,
                message: 'Data not found !'
              });
            }

            if (photoPath && obj.photo) {
              fs.unlinkSync(`./src/public${obj.photo.replace(hostName, '')}`);
            }

            obj.
              update({
                type: type || obj.type,
                name: name || obj.name,
                title: title || obj.title,
                headline: headline || obj.headline,
                additionalInfo:
                  JSON.stringify(additionalInfo) || obj.additionalInfo,
                video: video || obj.video,
                qna: JSON.stringify(qna) || obj.qna,
                position: position || obj.position,
                photo: photoPath ? `${hostName}${photoPath}` : obj.photo
              }).
              then(() => {
                return res.json({
                  status: responseStatus.SUCCESS,
                  message: 'Data updated !',
                  result: {
                    id: obj.id,
                    name: obj.name
                  }
                });
              }).
              catch(error => {
                if (photoPath) {
                  fs.unlinkSync(`./src/public${photoPath}`);
                }

                return errorResponse(error, res);
              });
          }).
          catch(error => {
            if (photoPath) {
              fs.unlinkSync(`./src/public${photoPath}`);
            }

            return errorResponse(error, res);
          });
      } catch (error) {
        if (photoPath) {
          fs.unlinkSync(`./src/public${photoPath}`);
        }

        return errorResponse(error, res);
      }
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.delete('/:id', jwtAuth, (req, res) => {
  SuccessStory.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }

      try {
        obj.
          destroy().
          then(() => {
            fs.unlinkSync(`./src/public${obj.photo.replace(hostName, '')}`);

            return res.json({
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
      } catch (error) {
        return errorResponse(error, res);
      }
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

export const SuccessStoryRouter = router;
