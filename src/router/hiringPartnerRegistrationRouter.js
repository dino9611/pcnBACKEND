import express from 'express';
import { HiringPartnerRegistration } from '../database/models';
import sequelize from '../database/sequelize';
import { checkBody, validationType } from '../lib/validator';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus,
  sendEmail
} from '../helper';

const router = express.Router();
const Op = sequelize.Op;

// router.use(publicAuth);

router.get('/', jwtAuth, pagingParams, (req, res) => {
  const { offset, limit, name, email, companyName, processed } = req.query;
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
  if (companyName) {
    orClause.push({
      companyName: { [Op.like]: `%${companyName}%` }
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

  HiringPartnerRegistration.findAll({
    where: whereClause,
    attributes: [
      'id',
      'name',
      'email',
      'phoneNumber',
      'companyName',
      'companyWebsite',
      'companyJobPosition',
      'jobPositionAndRequirement',
      'supportingValue',
      'processed',
      'createdAt'
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  })
    .then(result => {
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
    })
    .catch(error => {
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
  })
    .then(result => {
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
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.post(
  '/',
  publicAuth,
  checkBody([
    { field: 'name' },
    { field: 'email', validationType: validationType.isEmail },
    { field: 'phoneNumber' }
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
      })
        .then(result => {
          const {
            jobPositionDetails1,
            jobPositionDetails2,
            jobPositions,
            requirement
          } = jobPositionAndRequirement || {};
          const jp = jobPositions
            ? jobPositions.map(val => {
                return `<li>${val}</li>`;
              })
            : '';

          sendEmail(
            '',
            'Hiring Partner Registration Data',
            '',
            `<div>
              <h3>Hiring Partner Data</h3>
              <div><b>Name : </b>${name || ''}</div>
              <div><b>Email : </b>${email || ''}</div>
              <div><b>Phone Number : </b>${phoneNumber || ''}</div>
              <div><b>Company Name : </b>${companyName || ''}</div>
              <div><b>Company Web : </b>${companyWebsite || ''}</div>
              <div><b>Job Position in The Company : </b>${companyJobPosition ||
                ''}</div>
              <hr />
              <h3>Job Position & The Requirement</h3>
              <div>
                <b>Job Position : </b>
                <ul>
                  ${jp || ''}
                </ul>
                <br />
                <b>Detail & Requirement : </b>
                <ul>
                  ${
                    jobPositionDetails1
                      ? '<li>' + jobPositionDetails1 + '</li>'
                      : ''
                  }
                  ${
                    jobPositionDetails2
                      ? '<li>' + jobPositionDetails2 + '</li>'
                      : ''
                  }
                  ${requirement ? '' : '<li>' + requirement + '</li>'}
                </ul>
              </div>
            </div>`
          );

          return res.json({
            status: responseStatus.SUCCESS,
            message: 'Data Saved !',
            result: {
              id: result.id
            }
          });
        })
        .catch(error => {
          return errorResponse(error, res);
        });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', jwtAuth, (req, res) => {
  HiringPartnerRegistration.findByPk(req.params.id)
    .then(obj => {
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
        supportingValue,
        processed
      } = req.body;

      obj
        .update({
          name: name || obj.name,
          email: email || obj.email,
          phoneNumber: phoneNumber || obj.phoneNumber,
          companyName: companyName || obj.companyName,
          companyWebsite: companyWebsite || obj.companyWebsite,
          companyJobPosition: companyJobPosition || obj.companyJobPosition,
          jobPositionAndRequirement: jobPositionAndRequirement
            ? JSON.stringify(jobPositionAndRequirement)
            : obj.jobPositionAndRequirement,
          supportingValue: supportingValue
            ? JSON.stringify(supportingValue)
            : obj.supportingValue,
          processed: processed !== undefined ? processed : obj.processed
        })
        .then(() => {
          if (processed) {
            const jpr = JSON.parse(obj.jobPositionAndRequirement);
            const {
              jobPositionDetails1,
              jobPositionDetails2,
              jobPositions,
              requirement
            } = jpr || {};

            const jp = jobPositions
              ? jobPositions.map(val => {
                  return `<li>${val}</li>`;
                })
              : '';

            sendEmail(
              '',
              'Hiring Partner Registration Data',
              '',
              `<div>
                <h3>Hiring Partner Data</h3>
                <div><b>Name : </b>${obj.name || ''}</div>
                <div><b>Email : </b>${obj.email || ''}</div>
                <div><b>Phone Number : </b>${obj.phoneNumber || ''}</div>
                <div><b>Company Name : </b>${obj.companyName || ''}</div>
                <div><b>Company Web : </b>${obj.companyWebsite || ''}</div>
                <div><b>Job Position in The Company : </b>${obj.companyJobPosition ||
                  ''}</div>
                <hr />
                <h3>Job Position & The Requirement</h3>
                <div>
                  <b>Job Position : </b>
                  <ul>
                    ${jp || ''}
                  </ul>
                  <br />
                  <b>Detail & Requirement : </b>
                  <ul>
                    ${
                      jobPositionDetails1
                        ? '<li>' + jobPositionDetails1 + '</li>'
                        : ''
                    }
                    ${
                      jobPositionDetails2
                        ? '<li>' + jobPositionDetails2 + '</li>'
                        : ''
                    }
                    ${requirement ? '<li>' + requirement + '</li>' : ''}
                  </ul>
                </div>
              </div>`
            );
          }

          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data updated !',
            result: {
              id: obj.id
            }
          });
        })
        .catch(error => {
          return errorResponse(error, res);
        });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.delete('/:id', jwtAuth, (req, res) => {
  HiringPartnerRegistration.findByPk(req.params.id)
    .then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }

      obj
        .destroy()
        .then(() => {
          res.json({
            status: responseStatus.SUCCESS,
            message: 'Data deleted !',
            result: {
              id: obj.id
            }
          });
        })
        .catch(error => {
          return errorResponse(error, res);
        });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

export const HiringPartnerRegistrationRouter = router;
