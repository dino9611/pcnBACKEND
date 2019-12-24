import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import {
  StudentInvitation,
  StudentInvitationReschedule,
  HiringPartner,
  Student,
  User,
  notif
} from '../database/models';

const router = express.Router();

const Op = sequelize.Op;

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit } = req.query;
  const whereClause = {};

  StudentInvitationReschedule.findAll({
    where: whereClause,
    offset,
    limit
  }).
    then(result => {
      StudentInvitationReschedule.count({ where: whereClause }).then(total => {
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

router.get('/:id', (req, res) => {
  StudentInvitationReschedule.findByPk(req.params.id).
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

router.post(
  '/',
  checkBody([
    { field: 'studentInvitationId' },
    { field: 'scheduleDate' },
    { field: 'proposedBy' }
  ]),
  (req, res) => {
    try {
      const {
        studentInvitationId,
        scheduleDate,
        status,
        location,
        message,
        proposedBy,
        studentId,
        hiringPartnerId
      } = req.body;

      // StudentInvitationReschedule.create({
      //   studentInvitationId,
      //   status: 'proposed',
      //   scheduleDate,
      //   location: location || '',
      //   message: message || '',
      //   proposedBy
      // })

      sequelize.
        transaction(tr => {
          return StudentInvitationReschedule.create(
            {
              studentInvitationId,
              status: status || 'proposed',
              scheduleDate,
              location: location || '',
              message: message || '',
              proposedBy
            },
            { transaction: tr }
          ).then(result => {
            var readreadstud
            if(proposedBy==='student'){
  
              readreadstud='read'
            }else{
    
              readreadstud='readstudent'
            }
            return StudentInvitation.update(
              {
                status: 'rescheduled',
                updatedBy: proposedBy,
                [readreadstud]:false
              },
              {
                where: { id: studentInvitationId },
                transaction: tr
              }
            ).then(() => {
              return StudentInvitationReschedule.update(
                {
                  status: 'rescheduled',
                },
                {
                  where: {
                    id: { [Op.ne]: result.id },
                    studentInvitationId,
                    status: 'proposed'
                  },
                  transaction: tr
                }
              ).then(() => {
                return result;
              });

              // return result;
            });

            // let siStatus = 'proposed';

            // if (status === 'accepted') {
            //   siStatus = 'interview_accepted';

            // } else if (status === 'proposed') {
            //   return StudentInvitationReschedule.update(
            //     {
            //       status: 'rescheduled'
            //     },
            //     {
            //       where: {
            //         id: { [Op.ne]: result.id },
            //         studentInvitationId,
            //         status: 'proposed'
            //       },
            //       transaction: tr
            //     }
            //   ).then(() => {
            //     return result;
            //   });
            // }
          });
        }).
        then(result => {
          Student.findByPk(studentId)
          .then((result3)=>{
            HiringPartner.findByPk(hiringPartnerId)
            .then((result4)=>{
              var notifhp=null
              var notifstud=null
              var whereClause2={}
              var whereClauseisi={}
              var sockiomsgnotif=''
              var sockiomsgisinotif=''
              if(proposedBy==='student'){
                notifhp=`${result3.name} mengajukan rescheduled invitations check detailnya di manage talent`
                whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
                whereClauseisi={hiringPartnerId,notif:{[Op.ne]:null}}
                sockiomsgisinotif='isinotif'
                sockiomsgnotif='notif'
              }else if(proposedBy==='hiring-partner'){
                notifstud=` ${result4.name} mengajukan rescheduled interview check detailnya di menu your invitations`
                whereClause2={studentId,readstudent:false,notifstud:{[Op.ne]:null}}
                whereClauseisi={studentId,notifstud:{[Op.ne]:null}}
                sockiomsgisinotif='isinotifstud'
                sockiomsgnotif='notifstud'
              }
              notif.create({
                hiringPartnerId,
                studentId,
                notif:notifhp,
                notifstud,
                read:0,
                readstudent:0
              }).then(()=>{
                notif.count({where:whereClause2,order:[['createdAt', 'DESC']]})
                .then((totalnotif)=>{
                  notif.findAll({
                    where:whereClauseisi,
                    order:[['createdAt', 'DESC']],
                    include: [
                      {
                        model: Student,
                        as: 'student',
                        attributes: [
                          'slug',
                          'name',
                        ],
                        include: [
                          {
                            model: User,
                            as: 'user',
                            attributes: [ 'profilePicture']
                          }
                        ]
                      },
                      {
                        model: HiringPartner,
                        as: 'hiringPartner',
                        attributes: [
                          'slug',
                          'name',
                        ],
                        include: [
                          {
                            model: User,
                            as: 'user',
                            attributes: ['profilePicture']
                          }
                        ]
                      }
                    ],
                    limit:5
                  })
                  .then((result1)=>{
                    req.app.io.emit(sockiomsgnotif,totalnotif)
                    req.app.io.emit(sockiomsgisinotif,result1)
                    return res.json({
                      status: responseStatus.SUCCESS,
                      message: 'Data Saved !',
                      result: {
                        id: result.id
                      }
                    });
                  }).catch((err)=>{
                    return errorResponse(err, res);
                  })
                }).catch((err)=>{
                  return errorResponse(err, res);
                })
              }).catch((err)=>{
                return errorResponse(err, res);
              })
            })
            }).catch((error)=>{
              return errorResponse(error, res);
            })
          }).catch((error)=>{
            return errorResponse(error, res);
          })
        .catch(error => {
          return errorResponse(error, res);
        });
    } catch (error) {
      return errorResponse(error, res);
    }
  }
);

router.put('/:id', (req, res) => {
  StudentInvitationReschedule.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        status,
        scheduleDate,
        location,
        message,
        proposedBy,
        studentId,
        hiringPartnerId,
        interviewRejectedReason
      } = req.body;

      sequelize.
        transaction(tr => {
          return obj.
            update(
              {
                status: status || obj.status,
                scheduleDate: scheduleDate || obj.scheduleDate,
                location: location || obj.location,
                message: message || obj.message,
                proposedBy: proposedBy || obj.proposedBy
              },
              { transaction: tr }
            ).
            then(() => {
              if (status === 'accepted') {
                return StudentInvitation.update(
                  { status: 'interview_accepted', updatedBy: proposedBy,read:false,readstudent:false },
                  { where: { id: obj.studentInvitationId }, transaction: tr }
                );
              } else if (status === 'rejected') {
                return StudentInvitation.update(
                  {
                    status: 'interview_rejected',
                    interviewRejectedReason: interviewRejectedReason || '',
                    updatedBy: proposedBy,
                    read:false,
                    readstudent:false
                  },
                  { where: { id: obj.studentInvitationId }, transaction: tr }
                );
              }

              return obj;
            });
        }).
        then(() =>{
          Student.findByPk(studentId)
          .then((result3)=>{
            HiringPartner.findByPk(hiringPartnerId)
            .then((result4)=>{
              var notifhp=null
              var notifstud=null
              var whereClauseisi={}
              var whereClause2={}
              var sockiomsgnotif=''
              var sockiomsgisinotif=''
              if(proposedBy==='student'){
                if(status=='accepted'){
                  notifhp=`${result3.name} menerima jadwal interview yang diajukan `
                }else{
                  notifhp=`${result3.name} menolak jadwal interview yang diajukan `
                }
                whereClauseisi={hiringPartnerId,notif:{[Op.ne]:null}}
                whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
                sockiomsgisinotif='isinotif'
                sockiomsgnotif='notif'
              }else if(proposedBy==='hiring-partner'){
                if(status=='accepted'){
                  notifstud=` ${result4.name} menerima rescheduled interview yang anda ajukan`
                }else{
                  notifstud=` ${result4.name} menolak rescheduled interview yang anda ajukan`
                }
                whereClauseisi={studentId,notifstud:{[Op.ne]:null}}
                whereClause2={studentId,readstudent:false,notifstud:{[Op.ne]:null}}
                sockiomsgisinotif='isinotifstud'
                sockiomsgnotif='notifstud'
              }
              notif.create({
                hiringPartnerId,
                studentId,
                notif:notifhp,
                notifstud,
                read:0,
                readstudent:0
              }).then(()=>{
                notif.count({where:whereClause2,order:[['createdAt', 'DESC']]})
                .then((totalnotif)=>{
                  notif.findAll({where:whereClauseisi,order:[['createdAt', 'DESC']],
                  include: [
                    {
                      model: Student,
                      as: 'student',
                      attributes: [
                        'slug',
                        'name',
                      ],
                      include: [
                        {
                          model: User,
                          as: 'user',
                          attributes: [ 'profilePicture']
                        }
                      ]
                    },
                    {
                      model: HiringPartner,
                      as: 'hiringPartner',
                      attributes: [
                        'slug',
                        'name',
                      ],
                      include: [
                        {
                          model: User,
                          as: 'user',
                          attributes: ['profilePicture']
                        }
                      ]
                    }
                  ],
                  limit:5
                })
                  .then((result1)=>{
                    req.app.io.emit(sockiomsgnotif,totalnotif)
                    req.app.io.emit(sockiomsgisinotif,result1)
                    return res.json({
                      status: responseStatus.SUCCESS,
                      message: 'Data updated !',
                      result: {
                        id: obj.id
                      }
                    })
                  }).catch((err)=>{
                    return errorResponse(err, res);
                  })
                }).catch((err)=>{
                  return errorResponse(err, res);
                })
              }).catch((err)=>{
                return errorResponse(err, res);
              })
            }).catch((error)=>{
              return errorResponse(error, res);
            })
          }).catch((error)=>{
            return errorResponse(error, res);
          })
        }).catch(error => {
          return errorResponse(error, res);
        });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.delete('/:id', (req, res) => {
  StudentInvitationReschedule.findByPk(req.params.id).
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

export const StudentInvitationRescheduleRouter = router;
