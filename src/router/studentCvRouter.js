require('dotenv').config();
import express from 'express';
import fs from 'fs';
import logger from '../log/logger';
import sequelize from '../database/sequelize';
import { validate } from '../lib/validator/core';
import { validationType } from '../lib/validator';
import {
  auth,
  decrypt,
  generateHash,
  generateStudentSlug,
  pagingParams,
  responseStatus,
  uploader
} from '../helper';
import {
  JobCategory,
  JobRole,
  Program,
  Skill,
  Student,
  StudentEducation,
  StudentJobInterest,
  StudentJobInterestRole,
  StudentProgram,
  StudentSkill,
  StudentWorkExperience,
  User
} from '../database/models';

const appKey = process.env.APPKEY;
const hostName = process.env.HOSTNAME;
const router = express.Router();
const path = '/files/student';
const Op = sequelize.Op;

router.use(auth);

router.get('/', pagingParams, (req, res) => {
  const { limit, offset, name, gender, jp, ji, sk, available } = req.query;
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

  if (gender && Array.isArray(gender) && gender.length > 0) {
    const filter = gender.map(val => {
      return { gender: val };
    });

    whereClause = Object.assign(whereClause, { [Op.or]: filter });
  }
  if (jp && Array.isArray(jp) && jp.length > 0) {
    const filter = jp.map(val => {
      return { jobPreferences: { [Op.like]: `%${val}%` }};
    });

    whereClause = Object.assign(whereClause, { [Op.or]: filter });
  }

  let jiFilter = null;

  if (ji && Array.isArray(ji) && ji.length > 0) {
    jiFilter = {};
    const filter = ji.map(val => {
      return { roleId: val };
    });

    jiFilter = Object.assign(jiFilter, { [Op.or]: filter });
  }

  let sFilter = null;

  if (sk && Array.isArray(sk) && sk.length > 0) {
    sFilter = {};
    const filter = sk.map(val => {
      return { skillId: val };
    });

    sFilter = Object.assign(sFilter, { $or: filter });
  }

  Student.findAll({
    where: whereClause,

    // logging: console.log,
    offset,
    limit,
    include: [
      {
        model: StudentJobInterest,
        attributes: [ 'id', 'yearsOfExperience' ],
        include: [
          { model: JobCategory, attributes: [ 'id', 'category' ]},
          {
            model: StudentJobInterestRole,
            attributes: [ 'id', 'roleId' ],
            where: jiFilter,
            include: [
              {
                model: JobRole,
                attributes: [ 'id', 'role' ]
              }
            ]
          }
        ]
      },
      {
        model: StudentSkill,
        attributes: [ 'id' ],
        where: sFilter
      },
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
        where: whereClause,
        include: [
          {
            model: StudentJobInterest,
            attributes: [ 'id' ],
            include: [
              { model: JobCategory, attributes: [ 'id' ]},
              {
                model: StudentJobInterestRole,
                attributes: [ 'id', 'roleId' ],
                where: jiFilter
              }
            ]
          },
          {
            model: StudentSkill,
            attributes: [ 'id' ],
            where: sFilter
          }
        ]
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
      logger.error(JSON.stringify(error));

      return res.status(500).json({
        status: responseStatus.ERROR,
        message:
          'There\'s an error on the server. Please contact the administrator.',
        error: error.message
      });
    });
});

router.get('/:id', (req, res) => {
  Student.findByPk(req.params.id, {
    attributes: [
      'id',
      'name',
      'email',
      'studentCode',
      'phoneNumber',
      'birthDate',
      'gender',
      'profilePicture',
      'isAvailable',
      'profileVideo',
      'address',
      'province',
      'city',
      'resume',
      'jobPreferences',
      'baseSalary'
    ],
    include: [
      {
        model: StudentProgram,
        include: [{ model: Program, attributes: [ 'id', 'programName' ]}]
      },
      {
        model: StudentSkill,
        attributes: [ 'id' ],
        include: [{ model: Skill, attributes: [ 'id', 'skill' ]}]
      },
      {
        model: StudentWorkExperience,
        attributes: [ 'id', 'jobTitle', 'company', 'from', 'to', 'description' ]
      },
      {
        model: StudentEducation,
        attributes: [ 'id', 'institution', 'startDate', 'endDate', 'description' ]
      },
      {
        model: StudentJobInterest,
        attributes: [ 'id', 'jobCategoryId', 'yearsOfExperience' ],
        include: [
          { model: JobCategory, attributes: [ 'id', 'category' ]},
          {
            model: StudentJobInterestRole,
            attributes: [ 'id' ],
            include: [{ model: JobRole, attributes: [ 'id', 'role' ]}]
          }
        ]
      },
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
        result
      });
    }).
    catch(error => {
      logger.error(JSON.stringify(error));

      return res.status(500).json({
        status: responseStatus.ERROR,
        message:
          'There\'s an error on the server. Please contact the administrator.'
      });
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
        logger.error(err.message);

        return res.status(500).json({
          status: responseStatus.ERROR,
          message: 'Upload files failed !'
        });
      }

      const { profilePicture } = req.files;
      const {
        email,
        ep,
        studentCode,
        name,
        phoneNumber,
        province,
        city,
        address,
        birthDate,
        gender,
        profileVideo,
        jobPreferences,
        baseSalary,
        isAvailable
      } = req.body;
      const profilePicturePath = profilePicture ?
        `${path}/${profilePicture[0].filename}` :
        null;

      // form validation
      const validationResult = validate(
        [
          { field: 'studentCode' },
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
                    slug,
                    studentCode,
                    name,
                    phoneNumber,
                    province,
                    city,
                    address,
                    birthDate,
                    gender,
                    profileVideo,
                    jobPreferences,
                    baseSalary,
                    isAvailable
                  },
                  { transaction: tr }
                ).then(() => {
                  return result;
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
              logger.error(JSON.stringify(error));

              return res.status(500).json({
                status: responseStatus.ERROR,
                message:
                  'There\'s an error on the server. Please contact the administrator.'
              });
            });
        }).
        catch(error => {
          if (profilePicturePath) {
            fs.unlinkSync(`./src/public${profilePicturePath}`);
          }
          logger.error(JSON.stringify(error));

          return res.status(500).json({
            status: responseStatus.ERROR,
            message:
              'There\'s an error on the server. Please contact the administrator.'
          });
        });
    });
  } catch (error) {
    logger.error(JSON.stringify(error));

    return res.status(500).json({
      status: responseStatus.ERROR,
      message:
        'There\'s an error on the server. Please contact the administrator.'
    });
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
        logger.error(err.message);

        return res.status(500).json({
          status: responseStatus.ERROR,
          message: 'Upload files failed !'
        });
      }

      Student.findByPk(req.params.id).
        then(obj => {
          if (!obj) {
            return res.json({
              status: responseStatus.NOT_FOUND,
              message: 'Data not found !'
            });
          }
          const { profilePicture } = req.files;
          const {
            email,
            ep,
            studentCode,
            name,
            phoneNumber,
            province,
            city,
            address,
            birthDate,
            gender,
            profileVideo,
            jobPreferences,
            baseSalary,
            isAvailable
          } = req.body;
          const profilePicturePath = profilePicture ?
            `${path}/${profilePicture[0].filename}` :
            null;
          const password = ep ? decrypt(appKey, ep) : null;

          if (profilePicturePath && obj.profilePicture) {
            fs.unlinkSync(
              `./src/public${obj.profilePicture.replace(hostName, '')}`
            );
          }

          sequelize.
            transaction(tr => {
              return obj.
                update(
                  {
                    studentCode: studentCode || obj.studentCode,
                    name: name || obj.name,
                    phoneNumber: phoneNumber || obj.phoneNumber,
                    province: province || obj.province,
                    city: city || obj.city,
                    address: address || obj.address,
                    birthDate: birthDate || obj.birthDate,
                    gender: gender || obj.gender,
                    profileVideo: profileVideo || obj.profileVideo,
                    jobPreferences: jobPreferences || obj.jobPreferences,
                    baseSalary: baseSalary || obj.baseSalary,
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
                            `${hostName}${path}/${profilePicture[0].filename}` :
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
              logger.error(JSON.stringify(error));

              return res.status(500).json({
                status: responseStatus.ERROR,
                message:
                  'There\'s an error on the server. Please contact the administrator.'
              });
            });
        }).
        catch(error => {
          logger.error(JSON.stringify(error));

          return res.status(500).json({
            status: responseStatus.ERROR,
            message:
              'There\'s an error on the server. Please contact the administrator.'
          });
        });
    });
  } catch (error) {
    logger.error(JSON.stringify(error));

    return res.status(500).json({
      status: responseStatus.ERROR,
      message:
        'There\'s an error on the server. Please contact the administrator.'
    });
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
                      logger.error(JSON.stringify(error));

                      return res.status(500).json({
                        status: responseStatus.ERROR,
                        message:
                          'There\'s an error on the server. Please contact the administrator.'
                      });
                    });
                }
              }).
              catch(error => {
                logger.error(JSON.stringify(error));

                return res.status(500).json({
                  status: responseStatus.ERROR,
                  message:
                    'There\'s an error on the server. Please contact the administrator.'
                });
              });
          }).
          catch(error => {
            logger.error(JSON.stringify(error));

            return res.status(500).json({
              message:
                'There\'s an error on the server. Please contact the administrator.',
              error: error.message
            });
          });
      } catch (error) {
        logger.error(JSON.stringify(error));

        return res.status(500).json({
          message: 'Unable to delete this file. Please contact administrator.'
        });
      }
    }).
    catch(error => {
      logger.error(JSON.stringify(error));

      return res.status(500).json({
        message:
          'There\'s an error on the server. Please contact the administrator.',
        error: error.message
      });
    });
});

export default router;
