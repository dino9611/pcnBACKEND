import auth from 'basic-auth';
import config from '../config.json';
import express from 'express';
import { Admin, HiringPartner, Student, User } from '../database/models';
import {
  compareHash,
  createJWTToken,
  decrypt,
  errorResponse,
  responseStatus
} from '../helper';

const router = express.Router();

router.post(
  '/:type',
  (req, res) => {
    const { type } = req.params;
    const user = auth(req);
    const { name, pass } = user;
    const appKey = config.APPKEY || 'careernetwork';
    const password = decrypt(appKey, pass);
    console.log(password)
    // console.log(user)
    const response = {
      ...{
        INVALID_PASSWORD: 'INVALID_PASSWORD'
      },
      ...responseStatus
    };
    let whereClause = {};

    whereClause = Object.assign(whereClause, { email: name, type });
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
          console.log('gagal')
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
                      profilePicture: usr.profilePicture,
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
        } else if (usr.type === 'hiring-partner') {
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
                      type: 'hiring-partner',
                      token,
                      profilePicture: usr.profilePicture,
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
          console.log(usr.type)
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
                      profilePicture: usr.profilePicture,
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
