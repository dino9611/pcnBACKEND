import config from '../config.json';
import express from 'express';
import fs from 'fs';
import sequelize from '../database/sequelize';
import { validate } from '../lib/validator/core';
import { validationType } from '../lib/validator';
import {
  decrypt,
  errorResponse,
  generateHash,
  generateStudentSlug,
  pagingParams,
  responseStatus,
  tokenAuth,
  uploader
} from '../helper';
import { Student, StudentResume, User } from '../database/models';

const appKey = config.APPKEY;
const hostName = config.HOSTNAME;
const router = express.Router();
const path = '/files/student';
const Op = sequelize.Op;

router.use(tokenAuth);

router.get('/', pagingParams, (req, res) => {
  const { limit, offset, name, code, slug, available } = req.query;
  let whereClause = {};

  if (available !== undefined) {
    whereClause = Object.assign(whereClause, {
      isAvailable: available === 'true'
    });
  }

  if (name) {
    whereClause = Object.assign(whereClause, {
      name: { [Op.like]: `%${name}%` }
    });
  }

  if (code) {
    whereClause = Object.assign(whereClause, {
      code
    });
  }

  if (slug) {
    whereClause = Object.assign(whereClause, {
      slug
    });
  }

  Student.findAll({
    where: whereClause,
    offset,
    limit,
    include: [
      {
        model: User,
        as: 'user',
        attributes: [ 'email', 'profilePicture', 'type' ]
      }
    ]
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

      Student.count({
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

router.get('/:id', (req, res) => {
  Student.findByPk(req.params.id, {
    attributes: [
      'id',
      'slug',
      'code',
      'name',
      'phoneNumber',
      'province',
      'city',
      'address',
      'birthDate',
      'gender',
      'isAvailable'
    ],
    include: [
      {
        model: User,
        as: 'user',
        attributes: [ 'email', 'profilePicture', 'type' ]
      }
    ]
  }).
    then(result => {
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

router.post('/', (req, res) => {
  const upload = uploader(path, 'STD', {
    profilePicture: 'jpg|jpeg|png'
  }).fields([{ name: 'profilePicture' }]);

  try {
    upload(req, res, err => {
      // check upload image process
      if (err) {
        return errorResponse(err.message, res, err.message);
      }

      const { profilePicture } = req.files;
      const {
        email,
        ep,
        code,
        name,
        phoneNumber,
        province,
        city,
        address,
        birthDate,
        gender,
        isAvailable
      } = req.body;
      const profilePicturePath = profilePicture ?
        `${path}/${profilePicture[0].filename}` :
        null;

      // form validation
      const validationResult = validate(
        [
          { field: 'code' },
          { field: 'email', validationType: validationType.isEmail },
          { field: 'ep' },
          { field: 'name' },
          { field: 'phoneNumber' }
        ],
        req.body
      );

      if (validationResult.length > 0) {
        if (profilePicturePath) {
          fs.unlinkSync(`./src/public${profilePicturePath}`);
        }

        return res.status(422).json({
          status: responseStatus.NOT_VALID,
          message: 'Requested data is not valid',
          result: validationResult
        });
      }

      const password = decrypt(appKey, ep);

      generateStudentSlug(name).
        then(slug => {
          sequelize.
            transaction(tr => {
              return User.create(
                {
                  email,
                  password: generateHash(password),
                  profilePicture: profilePicture ?
                    `${hostName}${profilePicturePath}` :
                    null,
                  type: 'student'
                },
                { transaction: tr }
              ).then(result => {
                return Student.create(
                  {
                    id: result.id,
                    slug,
                    code,
                    name,
                    phoneNumber,
                    province,
                    city,
                    address,
                    birthDate,
                    gender,
                    isAvailable
                  },
                  { transaction: tr }
                ).then(() => {
                  // create default student resume
                  return StudentResume.create(
                    {
                      id: result.id
                    },
                    { transaction: tr }
                  ).then(() => {
                    return result;
                  });
                });
              });
            }).
            then(result => {
              return res.json({
                message: 'Data Saved !',
                result: {
                  id: result.id,
                  name: result.name
                }
              });
            }).
            catch(error => {
              if (profilePicturePath) {
                fs.unlinkSync(`./src/public${profilePicturePath}`);
              }

              return errorResponse(error, res);
            });
        }).
        catch(error => {
          if (profilePicturePath) {
            fs.unlinkSync(`./src/public${profilePicturePath}`);
          }

          return errorResponse(error, res);
        });
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.put('/:id', (req, res) => {
  const upload = uploader(path, 'STD', {
    profilePicture: 'jpg|jpeg|png'
  }).fields([{ name: 'profilePicture' }]);

  try {
    upload(req, res, err => {
      // check upload image process
      if (err) {
        return errorResponse(err.message, res, err.message);
      }

      const { profilePicture } = req.files;
      const {
        email,
        ep,
        code,
        name,
        phoneNumber,
        province,
        city,
        address,
        birthDate,
        gender,
        isAvailable
      } = req.body;
      const profilePicturePath = profilePicture ?
        `${path}/${profilePicture[0].filename}` :
        null;
      const password = ep ? decrypt(appKey, ep) : null;

      try {
        Student.findByPk(req.params.id, {
          include: [
            {
              model: User,
              as: 'user',
              attributes: [ 'email', 'profilePicture', 'type' ]
            }
          ]
        }).
          then(obj => {
            if (!obj) {
              return res.json({
                status: responseStatus.NOT_FOUND,
                message: 'Data not found !'
              });
            }

            if (profilePicturePath && obj.user.profilePicture) {
              fs.unlinkSync(
                `./src/public${obj.user.profilePicture.replace(hostName, '')}`
              );
            }

            sequelize.
              transaction(tr => {
                return obj.
                  update(
                    {
                      code: code || obj.code,
                      name: name || obj.name,
                      phoneNumber: phoneNumber || obj.phoneNumber,
                      province: province || obj.province,
                      city: city || obj.city,
                      address: address || obj.address,
                      birthDate: birthDate || obj.birthDate,
                      gender: gender || obj.gender,
                      isAvailable:
                        isAvailable === 'undefined' ?
                          obj.isAvailable :
                          isAvailable
                    },
                    { transaction: tr }
                  ).
                  then(() => {
                    return User.findByPk(obj.id).then(usr => {
                      if (usr) {
                        return usr.
                          update({
                            email: email || usr.email,
                            password:
                              (password ? generateHash(password) : null) ||
                              usr.password,
                            profilePicture: profilePicture ?
                              `${hostName}${path}/${
                                profilePicture[0].filename
                              }` :
                              usr.profilePicture
                          }).
                          then(() => {
                            return obj;
                          });
                      }

                      return obj;
                    });
                  });
              }).
              then(result => {
                return res.json({
                  status: responseStatus.SUCCESS,
                  message: 'Data updated !',
                  result: {
                    id: result.id,
                    name: result.name
                  }
                });
              }).
              catch(error => {
                if (profilePicturePath) {
                  fs.unlinkSync(`./src/public${profilePicturePath}`);
                }

                return errorResponse(error, res);
              });
          }).
          catch(error => {
            if (profilePicturePath) {
              fs.unlinkSync(`./src/public${profilePicturePath}`);
            }

            return errorResponse(error, res);
          });
      } catch (error) {
        if (profilePicturePath) {
          fs.unlinkSync(`./src/public${profilePicturePath}`);
        }

        return errorResponse(error, res);
      }
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.delete('/:id', (req, res) => {
  Student.findByPk(req.params.id).
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
            User.findByPk(req.params.id).
              then(usr => {
                if (usr) {
                  usr.
                    destroy().
                    then(() => {
                      if (usr.profilePicture) {
                        fs.unlinkSync(
                          `./src/public${usr.profilePicture.replace(
                            hostName,
                            ''
                          )}`
                        );
                      }

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
                }
              }).
              catch(error => {
                return errorResponse(error, res);
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

export const StudentRouter = router;
