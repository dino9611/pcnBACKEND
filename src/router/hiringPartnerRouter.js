require('dotenv').config();
import config from '../config.json';
import express from 'express';
import fs from 'fs';
import sequelize from '../database/sequelize';
import { validate } from '../lib/validator/core';
import { validationType } from '../lib/validator';
import {
  auth,
  decrypt,
  errorResponse,
  generateHash,
  generateHiringPartnerSlug,
  pagingParams,
  responseStatus,
  uploader
} from '../helper';
import { HiringPartner, User } from '../database/models';

const appKey = config.APPKEY;
const hostName = config.HOSTNAME;
const router = express.Router();
const path = '/files/hiring_partner';

router.use(auth);

router.get('/', pagingParams, (req, res) => {
  const { limit, offset, name, slug } = req.query;
  let whereClause = {};

  if (name) {
    whereClause = Object.assign(whereClause, { name: { $like: `%${name}%` }});
  }

  if (slug) {
    whereClause = Object.assign(whereClause, {
      slug
    });
  }

  HiringPartner.findAll({
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

      HiringPartner.count({ where: whereClause }).then(total => {
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
  HiringPartner.findByPk(req.params.id, {
    // attributes: ['id', 'name' ],
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
        message: result ? 'Get data success !' : 'Data not found',
        result: result || {}
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.post('/', (req, res) => {
  const upload = uploader(path, 'HP', {
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
        name,
        phoneNumber,
        province,
        city,
        address,
        summary,
        teamSize,
        profileVideo,
        website,
        facebook,
        linkedin,
        useHiringFee
      } = req.body;
      const ppPath = profilePicture ?
        `${path}/${profilePicture[0].filename}` :
        null;

      // form validation
      const validationResult = validate(
        [
          // encrypted password
          { field: 'ep' },
          { field: 'email', validationType: validationType.isEmail },
          { field: 'name' },
          { field: 'phoneNumber' }
        ],
        req.body
      );

      if (validationResult.length > 0) {
        if (ppPath) {
          fs.unlinkSync(`./src/public${ppPath}`);
        }

        return res.status(422).json({
          status: responseStatus.NOT_VALID,
          message: 'Requested data is not valid',
          result: validationResult
        });
      }
      const password = decrypt(appKey, ep);

      generateHiringPartnerSlug(name).
        then(slug => {
          sequelize.
            transaction(tr => {
              return User.create(
                {
                  email,
                  password: generateHash(password),
                  profilePicture: profilePicture ?
                    `${hostName}${ppPath}` :
                    null,
                  type: 'hiring_partner'
                },
                { transaction: tr }
              ).then(result => {
                return HiringPartner.create(
                  {
                    id: result.id,
                    slug,
                    name,
                    phoneNumber,
                    province,
                    city,
                    address,
                    summary,
                    teamSize,
                    profileVideo,
                    website,
                    facebook,
                    linkedin,
                    useHiringFee
                  },
                  { transaction: tr }
                ).then(() => {
                  return result;
                });
              });
            }).
            then(result => {
              return res.json({
                status: responseStatus.SUCCESS,
                message: 'Data Saved !',
                result: {
                  id: result.id,
                  name: result.name
                }
              });
            }).
            catch(error => {
              if (ppPath) {
                fs.unlinkSync(`./src/public${ppPath}`);
              }

              return errorResponse(error, res);
            });
        }).
        catch(error => {
          if (ppPath) {
            fs.unlinkSync(`./src/public${ppPath}`);
          }

          return errorResponse(error, res);
        });
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.put('/:id', (req, res) => {
  const upload = uploader(path, 'HP', {
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
        name,
        phoneNumber,
        province,
        city,
        address,
        summary,
        teamSize,
        profileVideo,
        website,
        facebook,
        linkedin,
        useHiringFee
      } = req.body;
      const ppPath = profilePicture ?
        `${path}/${profilePicture[0].filename}` :
        null;
      const password = ep ? decrypt(appKey, ep) : null;

      try {
        HiringPartner.findByPk(req.params.id, {
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

            if (ppPath && obj.user.profilePicture) {
              fs.unlinkSync(
                `./src/public${obj.user.profilePicture.replace(hostName, '')}`
              );
            }

            sequelize.
              transaction(tr => {
                return obj.
                  update(
                    {
                      name: name || obj.name,
                      phoneNumber: phoneNumber || obj.phoneNumber,
                      province: province || obj.province,
                      city: city || obj.city,
                      address: address || obj.address,
                      summary: summary || obj.summary,
                      teamSize: teamSize || obj.teamSize,
                      profileVideo: profileVideo || obj.profileVideo,
                      website: website || obj.website,
                      facebook: facebook || obj.facebook,
                      linkedin: linkedin || obj.linkedin,
                      useHiringFee:
                        useHiringFee === 'undefined' ?
                          obj.useHiringFee :
                          useHiringFee
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
                if (ppPath) {
                  fs.unlinkSync(`./src/public${ppPath}`);
                }

                return errorResponse(error, res);
              });
          }).
          catch(error => {
            return errorResponse(error, res);
          });
      } catch (error) {
        if (ppPath) {
          fs.unlinkSync(`./src/public${ppPath}`);
        }

        return errorResponse(error, res);
      }
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.delete('/:id', (req, res) => {
  HiringPartner.findByPk(req.params.id).
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
                      fs.unlinkSync(
                        `./src/public${usr.profilePicture.replace(
                          hostName,
                          ''
                        )}`
                      );

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

export const HiringPartnerRouter = router;
