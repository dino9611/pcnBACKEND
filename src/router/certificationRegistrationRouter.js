import { CertificationRegistration } from '../database/models';
import config from '../config.json';
import express from 'express';
import fs from 'fs';
import sequelize from '../database/sequelize';
import { validate } from '../lib/validator/core';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus,
  sendEmail,
  uploader
} from '../helper';

const Op = sequelize.Op;
const router = express.Router();
const hostName = config.HOSTNAME;
const path = '/files/student/certification_registration';

// router.use(jwtAuth);

router.get('/', jwtAuth, pagingParams, (req, res) => {
  const { offset, limit, name, email, processed } = req.query;
  let whereClause = {};
  const orClause = [];

  if (name) {
    orClause.push({
      name: { [Op.like]: `%${name}%` }
    });
  }
  if (email) {
    orClause.push({
      email: { [Op.like]: `%${email}%` }
    });
  }
  if (processed !== undefined) {
    whereClause = { ...whereClause, processed };
  }

  if (orClause.length > 0) {
    whereClause = {
      ...whereClause,
      ...{
        [Op.or]: orClause
      }
    };
  }

  CertificationRegistration.findAll({
    where: whereClause,
    offset,
    limit,
    order: [[ 'createdAt', 'DESC' ]]
  }).
    then(result => {
      CertificationRegistration.count({ where: whereClause }).then(total => {
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

router.get('/:id', jwtAuth, (req, res) => {
  CertificationRegistration.findByPk(req.params.id).
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

router.post('/', publicAuth, (req, res) => {
  const upload = uploader(path, 'CR', {
    cv: 'pdf|doc|docx'
  }).fields([{ name: 'cv' }]);

  try {
    upload(req, res, err => {
      // check upload image process
      if (err) {
        return errorResponse(err.message, res, err.message);
      }

      const { cv } = req.files;
      const {
        name,
        email,
        pob,
        dob,
        phoneNumber,
        address,
        currentJobPosition,
        lastEducation,
        findThisProgram,
        reason
      } = req.body;
      const cvPath = cv ? `${path}/${cv[0].filename}` : null;

      // form validation
      const validationResult = validate(
        [{ field: 'name' }, { field: 'email' }, { field: 'phoneNumber' }],
        req.body
      );

      if (validationResult.length > 0) {
        if (cvPath) {
          fs.unlinkSync(`./src/public${cvPath}`);
        }

        return res.status(422).json({
          status: responseStatus.NOT_VALID,
          message: 'Requested data is not valid',
          result: validationResult
        });
      }

      try {
        sequelize.
          transaction(tr => {
            return CertificationRegistration.create(
              {
                name,
                email,
                pob: pob || '',
                dob: dob || new Date(),
                phoneNumber,
                address: address || '',
                currentJobPosition: currentJobPosition || '',
                lastEducation: lastEducation || '',
                findThisProgram: findThisProgram || '',
                reason: reason || '',
                cv: cv ? `${hostName}${cvPath}` : null
              },
              { transaction: tr }
            ).then(result => {
              return result;
            });
          }).
          then(result => {
            sendEmail(
              '',
              'Certification Registration Data',
              '',
              `<div>
                <div><b>Name : </b>${name}</div>
                <div><b>Email : </b>${email}</div>
                <div><b>Phone Number : </b>${phoneNumber}</div>
                <div><b>CV : </b>${hostName}${cvPath}</div>
              </div>`
            );

            return res.json({
              status: responseStatus.SUCCESS,
              message: 'Data Saved !',
              result: {
                id: result.id
              }
            });
          }).
          catch(error => {
            if (cvPath) {
              fs.unlinkSync(`./src/public${cvPath}`);
            }

            return errorResponse(error, res);
          });
      } catch (error) {
        if (cvPath) {
          fs.unlinkSync(`./src/public${cvPath}`);
        }

        return errorResponse(error, res);
      }
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.put('/:id', jwtAuth, (req, res) => {
  CertificationRegistration.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        reason,
        name,
        pob,
        dob,
        email,
        phoneNumber,
        address,
        currentJobPosition,
        lastEducation,
        findThisProgram,
        processed
      } = req.body;

      obj.
        update({
          name: name || obj.name,
          email: email || obj.email,
          pob: pob || obj.pob,
          dob: dob || obj.dob,
          phoneNumber: phoneNumber || obj.phoneNumber,
          address: address || obj.address,
          currentJobPosition: currentJobPosition || obj.currentJobPosition,
          lastEducation: lastEducation || obj.lastEducation,
          findThisProgram: findThisProgram || obj.findThisProgram,
          reason: reason || obj.reason,
          processed:
            processed === 'undefined' || processed === undefined ?
              obj.processed :
              processed
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

router.delete('/:id', jwtAuth, (req, res) => {
  CertificationRegistration.findByPk(req.params.id).
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

export const CertificationRegistrationRouter = router;
