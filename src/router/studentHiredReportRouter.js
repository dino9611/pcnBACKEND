import config from '../config.json';
import express from 'express';
import sequelize from '../database/sequelize';
import { validate } from '../lib/validator/core';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus,
  uploader
} from '../helper';
import {
  HiringPartner,
  Student,
  StudentHiredReport,
  StudentInvitation,
  User
} from '../database/models';

const router = express.Router();
const hostName = config.HOSTNAME;
const path = '/files/student/hired';

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const {
    offset,
    limit,
    resigned,
    hiringPartnerId,
    studentId,
    processed
  } = req.query;
  let whereClause = {};

  if (resigned !== 'undefined') {
    const status = resigned === 'true';

    whereClause = { ...whereClause, resigned: status };
  }
  if (hiringPartnerId) {
    whereClause = Object.assign(whereClause, {
      hiringPartnerId
    });
  }
  if (studentId) {
    whereClause = Object.assign(whereClause, {
      studentId
    });
  }
  // if (processed) {
  //   whereClause = Object.assign(whereClause, {
  //     processed
  //   });
  // }
  if (processed != 'undefined' && processed != undefined) {
    const status = processed === 'true';
    whereClause = Object.assign(whereClause, {
      processed: status
    });
  }

  StudentHiredReport.findAll({
    where: whereClause,
    include: [
      {
        model: Student,
        as: 'student',
        attributes: [
          'slug',
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
            attributes: ['email', 'profilePicture', 'type']
          }
        ]
      },
      {
        model: HiringPartner,
        as: 'hiringPartner',
        attributes: [
          'slug',
          'name',
          'phoneNumber',
          'province',
          'city',
          'address',
          'summary',
          'teamSize',
          'profileVideo',
          'website',
          'facebook',
          'linkedin',
          'useHiringFee'
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['email', 'profilePicture', 'type']
          }
        ]
      }
    ],
    offset,
    limit,
    order: [['updatedAt', 'DESC']]
  })
    .then(result => {
      StudentHiredReport.count({ where: whereClause }).then(total => {
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

router.get('/:id', (req, res) => {
  StudentHiredReport.findByPk(req.params.id)
    .then(result => {
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

router.post('/', (req, res) => {
  const upload = uploader(path, 'OL', {
    profilePicture: 'pdf|doc|docx'
  }).fields([{ name: 'offeringLetter' }]);

  try {
    upload(req, res, err => {
      // check upload image process
      if (err) {
        return errorResponse(err.message, res, err.message);
      }

      const { offeringLetter } = req.files;
      const {
        id,
        studentId,
        hiringPartnerId,
        jobTitle,
        location,
        startDate,
        salary
      } = req.body;
      const offeringLetterPath = offeringLetter
        ? `${path}/${offeringLetter[0].filename}`
        : null;

      // form validation
      const validationResult = validate(
        [
          { field: 'id' },
          { field: 'studentId' },
          { field: 'hiringPartnerId' },
          { field: 'jobTitle' },
          { field: 'location' },
          { field: 'startDate' }
        ],
        req.body
      );

      if (validationResult.length > 0) {
        if (offeringLetterPath) {
          fs.unlinkSync(`./src/public${offeringLetterPath}`);
        }

        return res.status(422).json({
          status: responseStatus.NOT_VALID,
          message: 'Requested data is not valid',
          result: validationResult
        });
      }

      try {
        sequelize
          .transaction(tr => {
            return StudentHiredReport.create(
              {
                id,
                studentId,
                hiringPartnerId,
                jobTitle: jobTitle || '',
                location: location || '',
                startDate: startDate || '',
                salary: salary || 0,
                offeringLetter: offeringLetter
                  ? `${hostName}${offeringLetterPath}`
                  : '',
                processed: false

                // processed: processed !== undefined ? processed : obj.processed
              },
              { transaction: tr }
            ).then(result => {
              return StudentInvitation.update(
                {
                  status: 'hired',
                  updatedBy: 'hiring-partner'
                },
                {
                  where: { id },
                  transaction: tr
                }
              ).then(() => {
                return Student.update(
                  {
                    isAvailable: false
                  },
                  {
                    where: { id: studentId },
                    transaction: tr
                  }
                ).then(() => {
                  return result;
                });
              });
            });
          })
          .then(result => {
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
        if (offeringLetterPath) {
          fs.unlinkSync(`./src/public${offeringLetterPath}`);
        }

        return errorResponse(error, res);
      }
    });
  } catch (error) {
    return errorResponse(error, res);
  }
});

router.put('/:id', (req, res) => {
  if (req.params.id === 'bulk') {
    const data = req.body;

    if (Array.isArray(data)) {
      sequelize
        .transaction(tr => {
          const processList = [];

          for (const dt of data) {
            let updatedData = {};

            if (dt.processed != 'undefined' && dt.processed != undefined) {
              updatedData = {
                updatedData,
                ...{ processed: dt.processed }
              };
            }

            processList.push(
              StudentHiredReport.update(updatedData, {
                where: { id: dt.id },
                transaction: tr
              })
            );
          }

          return Promise.all(processList);
        })
        .then(() => {
          return res.json({
            message: 'Data Saved !',
            result: {
              status: responseStatus.SUCCESS,
              message: 'Data updated !'
            }
          });
        })
        .catch(error => {
          return errorResponse(error, res);
        });
    }
  } else {
    const upload = uploader(path, 'OL', {
      profilePicture: 'pdf|doc|docx'
    }).fields([{ name: 'offeringLetter' }]);

    try {
      upload(req, res, err => {
        // check upload image process
        if (err) {
          return errorResponse(err.message, res, err.message);
        }

        const { offeringLetter } = req.files;
        const offeringLetterPath = offeringLetter
          ? `${path}/${offeringLetter[0].filename}`
          : null;
        const { jobTitle, location, startDate, salary, processed } = req.body;

        try {
          StudentHiredReport.findByPk(req.params.id)
            .then(obj => {
              if (!obj) {
                return res.json({
                  status: responseStatus.NOT_FOUND,
                  message: 'Data not found !'
                });
              }
              if (offeringLetterPath && obj.user.offeringLetter) {
                fs.unlinkSync(
                  `./src/public${obj.offeringLetter.replace(hostName, '')}`
                );
              }

              obj
                .update({
                  jobTitle: jobTitle || obj.jobTitle,
                  location: location || obj.location,
                  startDate: startDate || obj.startDate,
                  salary: salary || obj.salary,
                  offeringLetter: offeringLetter
                    ? `${hostName}${offeringLetterPath}`
                    : obj.offeringLetter,
                  processed:
                    processed !== undefined || processed !== 'undefined'
                      ? processed
                      : obj.processed
                })
                .then(() =>
                  res.json({
                    status: responseStatus.SUCCESS,
                    message: 'Data updated !',
                    result: {
                      id: obj.id
                    }
                  })
                )
                .catch(error => {
                  if (offeringLetterPath) {
                    fs.unlinkSync(`./src/public${offeringLetterPath}`);
                  }

                  return errorResponse(error, res);
                });
            })
            .catch(error => {
              if (offeringLetterPath) {
                fs.unlinkSync(`./src/public${offeringLetterPath}`);
              }

              return errorResponse(error, res);
            });
        } catch (error) {
          if (offeringLetterPath) {
            fs.unlinkSync(`./src/public${offeringLetterPath}`);
          }

          return errorResponse(error, res);
        }
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
});

router.delete('/:id', (req, res) => {
  StudentHiredReport.findByPk(req.params.id)
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

export const StudentHiredReportRouter = router;
