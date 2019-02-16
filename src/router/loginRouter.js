require('dotenv').config();
import config from '../config.json';
import express from 'express';
import { Admin, HiringPartner, Student, User } from '../database/models';
import { checkBody, validationType } from '../lib/validator';
import {
  compareHash,
  createJWTToken,
  decrypt,
  errorResponse,
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
    const { email, ep, type } = req.body;
    const appKey = config.APPKEY || 'careernetwork';
    const password = decrypt(appKey, ep);

    const response = {
      ...{
        INVALID_PASSWORD: 'INVALID_PASSWORD'
      },
      ...responseStatus
    };
    let whereClause = {};

    whereClause = Object.assign(whereClause, { email, type });
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
                  return errorResponse(error, res);
                });
            }).
            catch(error => {
              return errorResponse(error, res);
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
                  return errorResponse(error, res);
                });
            }).
            catch(error => {
              return errorResponse(error, res);
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
                  return errorResponse(error, res);
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
  }
);

export const LoginRouter = router;