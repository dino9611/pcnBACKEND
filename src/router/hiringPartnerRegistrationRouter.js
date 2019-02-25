import express from 'express';
import { HiringPartnerRegistration } from '../database/models';
import sequelize from '../database/sequelize';
import { checkBody, validationType } from '../lib/validator';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

// router.use(publicAuth);

router.get('/', jwtAuth, pagingParams, (req, res) => {
  const { offset, limit, name, email, companyName } = req.query;
  let whereClause = {};

  if (name) {
    whereClause = Object.assign(whereClause, {
      name: { [Op.like]: `%${name}%` }
    });
  }
  if (email) {
    whereClause = Object.assign(whereClause, {
      email: { [Op.like]: `%${email}%` }
    });
  }
  if (companyName) {
    whereClause = Object.assign(whereClause, {
      companyName: { [Op.like]: `%${companyName}%` }
    });
  }

  HiringPartnerRegistration.findAll({
    where: whereClause,
    attributes: [
      'name',
      'email',
      'phoneNumber',
      'companyName',
      'companyWebsite',
      'companyJobPosition',
      'jobPositionAndRequirement',
      'supportingValue'
    ],
    offset,
    limit
  }).
    then(result => {
      result.forEach(hpr => {
        hpr.jobPositionAndRequirement = JSON.parse(
          hpr.jobPositionAndRequirement
        );
        hpr.supportingValue = JSON.parse(hpr.supportingValue);
      });

      HiringPartnerRegistration.count({ where: whereClause }).then(total => {
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
  HiringPartnerRegistration.findByPk(req.params.id, {
    attributes: [
      'name',
      'email',
      'phoneNumber',
      'companyName',
      'companyWebsite',
      'companyJobPosition',
      'jobPositionAndRequirement',
      'supportingValue'
    ]
  }).
    then(result => {
      if (result) {
        result.jobPositionAndRequirement = JSON.parse(
          result.jobPositionAndRequirement
        );
        result.supportingValue = JSON.parse(result.supportingValue);
      }
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
  publicAuth,
  checkBody([
    { field: 'name' },
    { field: 'email', validationType: validationType.isEmail },
    { field: 'phoneNumber' },
    { field: 'jobPositionAndRequirement' },
    { field: 'supportingValue' }
  ]),
  (req, res) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        companyName,
        companyWebsite,
        companyJobPosition,
        jobPositionAndRequirement,
        supportingValue
      } = req.body;

      HiringPartnerRegistration.create({
        name,
        email,
        phoneNumber,
        companyName,
        companyWebsite,
        companyJobPosition,
        jobPositionAndRequirement: JSON.stringify(jobPositionAndRequirement),
        supportingValue: JSON.stringify(supportingValue)
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
          return errorResponse(error, res);
        });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', jwtAuth, (req, res) => {
  HiringPartnerRegistration.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        name,
        email,
        phoneNumber,
        companyName,
        companyWebsite,
        companyJobPosition,
        jobPositionAndRequirement,
        supportingValue
      } = req.body;

      obj.
        update({
          name: name || obj.name,
          email: email || obj.email,
          phoneNumber: phoneNumber || obj.phoneNumber,
          companyName: companyName || obj.companyName,
          companyWebsite: companyWebsite || obj.companyWebsite,
          companyJobPosition: companyJobPosition || obj.companyJobPosition,
          jobPositionAndRequirement: jobPositionAndRequirement ?
            JSON.stringify(jobPositionAndRequirement) :
            obj.jobPositionAndRequirement,
          supportingValue: supportingValue ?
            JSON.stringify(supportingValue) :
            obj.supportingValue
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
  HiringPartnerRegistration.findByPk(req.params.id).
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

export const HiringPartnerRegistrationRouter = router;
