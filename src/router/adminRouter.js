require('dotenv').config();
import express from 'express';
import sequelize from '../database/sequelize';
import { Admin, User } from '../database/models';
import {
  auth,
  createJWTToken,
  decrypt,
  encrypt,
  errorResponse,
  generateHash,
  pagingParams,
  responseStatus
} from '../helper';
import { checkBody, validationType } from '../lib/validator';

const appKey = process.env.APPKEY || 'careernetwork';
const router = express.Router();

router.use(auth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit } = req;
  const whereClause = {};

  Admin.findAll({
    where: whereClause,
    offset,
    limit,
    attributes: [ 'id', 'name', 'phoneNumber', 'isSuperAdmin' ],
    include: [
      {
        model: User,
        as: 'user',
        attributes: [ 'email', 'profilePicture', 'type' ]
      }
    ]
  }).
    then(result => {
      Admin.count({ where: whereClause }).then(total => {
        res.json({
          status: responseStatus.SUCCESS,
          message: 'Get data success !',
          result: result || [],
          total,
          encrypt: encrypt(appKey, 'abc123'),
          hash: generateHash('abc123')
        });
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.get('/:id', (req, res) => {
  Admin.findByPk(req.params.id, {
    attributes: [ 'id', 'name', 'phoneNumber', 'isSuperAdmin' ],
    include: [
      {
        model: User,
        as: 'user',
        attributes: [ 'email', 'profilePicture', 'type' ]
      }
    ]
  }).
    then(result => {
      res.json({
        status: result ? responseStatus.SUCCESS : responseStatus.NOT_FOUND,
        message: result ? 'Get data success !' : 'Data not found',
        result
      });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

router.post(
  '/',
  checkBody([
    { field: 'email', validationType: validationType.isEmail },

    // encrypted password
    { field: 'ep' },
    { field: 'name' }
  ]),
  (req, res) => {
    try {
      const { email, ep, name, phoneNumber, isSuperAdmin } = req.body;
      const password = decrypt(appKey, ep);

      sequelize.
        transaction(tr => {
          return User.create(
            {
              email,
              password: generateHash(password),
              type: 'admin'
            },
            { transaction: tr }
          ).then(usr => {
            return Admin.create(
              {
                id: usr.id,
                name,
                phoneNumber: phoneNumber || '',
                isSuperAdmin: isSuperAdmin || false
              },
              { transaction: tr }
            ).then(() => {
              return usr;
            });
          });
        }).
        then(result => {
          const token = createJWTToken({ id: result.id });

          return res.json({
            status: responseStatus.SUCCESS,
            message: 'Data Saved !',
            result: {
              token,
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
  }
);

router.put('/:id', (req, res) => {
  Admin.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const { email, ep, name, phoneNumber, isSuperAdmin } = req.body;
      const password = ep ? decrypt(appKey, ep) : null;

      sequelize.
        transaction(tr => {
          return obj.
            update(
              {
                name: name || obj.name,
                phoneNumber: phoneNumber || obj.phoneNumber,
                isSuperAdmin:
                  isSuperAdmin === undefined ? obj.isSuperAdmin : isSuperAdmin
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
                        usr.password
                    }).
                    then(() => {
                      return obj;
                    });
                }

                return obj;
              });
            });
        }).
        then(result =>
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data updated !',
            result: {
              id: result.id,
              name: result.name
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

router.delete('/:id', (req, res) => {
  Admin.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }

      obj.
        destroy().
        then(() =>
          User.destroy({ where: { id: obj.id }}).
            then(() => {
              res.json({
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
            })).
        catch(error => {
          return errorResponse(error, res);
        });
    }).
    catch(error => {
      return errorResponse(error, res);
    });
});

export const AdminRouter = router;
