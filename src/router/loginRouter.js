import express from 'express';
import logger from '../log/logger';
import { Admin, HiringPartner, Student, User } from '../database/models';
import { checkBody, validationType } from '../lib/validator';
import {
  compareHash,
  createJWTToken,
  decrypt,
  responseStatus
} from '../helper';

const router = express.Router();

router.post(
  '/',
  checkBody([
    // encrypted password
    { field: 'ep' },
    { field: 'email', validationType: validationType.isEmail }
  ]),
  (req, res) => {
    const { email, ep } = req.body;
    const appKey = process.env.APPKEY || '';
    const password = decrypt(appKey, ep);

    const response = {
      ...{
        INVALID_PASSWORD: 'INVALID_PASSWORD'
      },
      ...responseStatus
    };
    let whereClause = {};

    whereClause = Object.assign(whereClause, { email });
    User.findOne({
      where: whereClause
    }).
      then(usr => {
        if (!usr) {
          return res.status(200).json({
            status: response.NOT_FOUND,
            message: 'User not found !.'
          });
        }

        if (!compareHash(password, usr.password)) {
          return res.status(200).json({
            status: response.INVALID_PASSWORD,
            message: 'Password didn\'t match !'
          });
        }

        if (usr.type === 'admin') {
          Admin.findByPk(usr.id).
            then(obj => {
              usr.
                update({
                  lastLogin: new Date()
                }).
                then(() => {
                  const token = createJWTToken({ id: obj.id });

                  return res.json({
                    status: response.SUCCESS,
                    result: {
                      id: obj.id,
                      name: obj.name,
                      type: 'admin',
                      token,
                      isSuperAdmin: obj.isSuperAdmin
                    }
                  });
                }).
                catch(error => {
                  logger.error(error.message);

                  return res.status(500).json({
                    status: response.ERROR,
                    message:
                      'There\'s an error on the server. Please contact the administrator.'
                  });
                });
            }).
            catch(error => {
              logger.error(error.message);

              return res.status(500).json({
                status: response.ERROR,
                message:
                  'There\'s an error on the server. Please contact the administrator.'
              });
            });
        } else if (usr.type === 'hiring_partner') {
          HiringPartner.findByPk(usr.id).
            then(obj => {
              usr.
                update({
                  lastLogin: new Date()
                }).
                then(() => {
                  const token = createJWTToken({ id: obj.id });

                  return res.json({
                    status: response.SUCCESS,
                    result: {
                      id: obj.id,
                      name: obj.name,
                      type: 'hiring_partner',
                      token,
                      useHiringFee: obj.useHiringFee
                    }
                  });
                }).
                catch(error => {
                  logger.error(error.message);

                  return res.status(500).json({
                    status: response.ERROR,
                    message:
                      'There\'s an error on the server. Please contact the administrator.'
                  });
                });
            }).
            catch(error => {
              logger.error(error.message);

              return res.status(500).json({
                status: response.ERROR,
                message:
                  'There\'s an error on the server. Please contact the administrator.'
              });
            });
        } else if (usr.type === 'student') {
          Student.findByPk(usr.id).
            then(obj => {
              usr.
                update({
                  lastLogin: new Date()
                }).
                then(() => {
                  const token = createJWTToken({ id: obj.id });

                  return res.json({
                    status: response.SUCCESS,
                    result: {
                      id: obj.id,
                      name: obj.name,
                      type: 'student',
                      token
                    }
                  });
                }).
                catch(error => {
                  logger.error(error.message);

                  return res.status(500).json({
                    status: response.ERROR,
                    message:
                      'There\'s an error on the server. Please contact the administrator.'
                  });
                });
            }).
            catch(error => {
              logger.error(error.message);

              return res.status(500).json({
                status: response.ERROR,
                message:
                  'There\'s an error on the server. Please contact the administrator.'
              });
            });
        }
      }).
      catch(error => {
        logger.error(error.message);

        return res.status(500).json({
          status: response.ERROR,
          message:
            'There\'s an error on the server. Please contact the administrator.'
        });
      });
  }
);

export const LoginRouter = router;
