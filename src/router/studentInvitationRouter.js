import { checkBody } from '../lib/validator';
import express from 'express';
import moment from 'moment';
import sequelize from '../database/sequelize';
// import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  responseStatus
} from '../helper';
import {
  HiringPartner,
  Student,
  StudentInvitation,
  StudentInvitationReschedule,
  User,
  notif
} from '../database/models';


const router = express.Router();
const Op = sequelize.Op;

router.use(jwtAuth);

router.get('/', pagingParams, (req, res) => {
  const { offset, limit, status, studentId, hiringPartnerId,resume } = req.query;
  // console.log(req.query)
  let whereClause = {
    //buat expired
    // scheduleDate: {
    //   [Op.gte]: moment()
    //     .subtract(7, 'days')
    //     .toDate()
    // }
  };

  if (status) {
    if (Array.isArray(status)) {
      const statuses = status.map(val => {
        return {
          status: val
        };
      });
      // console.log('masuk')
      whereClause = { ...whereClause, [Op.or]: statuses };
    } else {
      whereClause = { ...whereClause, status };
    }
    // console.log(whereClause)
  }
  if (studentId) {
    whereClause = { ...whereClause, studentId };
  }
  if (hiringPartnerId) {
    whereClause = { ...whereClause, hiringPartnerId };
  }

  StudentInvitation.findAll({
    where: whereClause,
    offset,
    limit,
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
      },
      {
        model: StudentInvitationReschedule,
        as: 'studentInvitationReschedule',
        order: [['createdAt', 'DESC']],
        limit: 1
      }
    ],
    //awalnya updateat
    order: [['createdAt', 'DESC']]
  })
    .then(result => {
      if(hiringPartnerId&&resume){
        StudentInvitation.count({
          where: whereClause 
        }).then((total)=>{
            console.log('masuksini')
            res.json({
              status: responseStatus.SUCCESS,
              message: 'Get data success !',
              result: result || [],
              total
            });
        })
      }else if(hiringPartnerId){
        console.log('masuk')
        StudentInvitation.count({
           where: whereClause 
          }).then(total => {
            StudentInvitation.update({
              read:true
            },{
              where:{
                hiringPartnerId
              },
              status:[
                'new',
                'interview_accepted',
                'interview_rejected',
                'rescheduled'
              ],
              read:false
            }).then(()=>{
              var whereClause1={hiringPartnerId,status:['new','interview_accepted','interview_rejected','rescheduled'],read:false}
              StudentInvitation.count({
                 where: whereClause1
                }).then(total1 => {
                  req.app.io.emit('masuk',total1)
                  res.json({
                    status: responseStatus.SUCCESS,
                    message: 'Get data success !',
                    result: result || [],
                    total
                  });
                });
            })
        });
      }else{
        StudentInvitation.count({ where: whereClause }).then(total => {
          StudentInvitation.update({
            readstudent:true
          },{
            where:{
              studentId
            },
            status:[
              'new',
              'interview_accepted',
              'interview_rejected',
              'rescheduled'
            ],
            readstudent:false
          }).then(()=>{
            var whereClause1={studentId,status:['new','interview_accepted','interview_rejected','rescheduled'],readstudent:false}
            StudentInvitation.count({
              where: whereClause1
             }).then(total1 => {
               req.app.io.emit('studentnotif',total1)
               res.json({
                 status: responseStatus.SUCCESS,
                 message: 'Get data success !',
                 result: result || [],
                 total
               });
             });
          })
        });
      }
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.get('/:id', (req, res) => {
  StudentInvitation.findByPk(req.params.id)
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

router.post(
  '/',
  checkBody([
    { field: 'studentId' },
    { field: 'hiringPartnerId' },
    { field: 'scheduleDate' },
    { field: 'location' }
  ]),
  (req, res) => {
    try {
      const {
        studentId,
        hiringPartnerId,
        scheduleDate,
        location,
        message,
        interviewRejectedReason,
        updatedBy,
        rejectedReason,
        status
      } = req.body;

      StudentInvitation.create({
        studentId,
        hiringPartnerId,
        status: status || 'new',
        scheduleDate,
        location,
        message: message || '',
        interviewRejectedReason: interviewRejectedReason || '',
        updatedBy: updatedBy || '',
        rejectedReason: rejectedReason || ''
      })
        .then(result => {
          var whereClause={hiringPartnerId,status:['new','interview_accepted','interview_rejected','rescheduled'],read:0}
          StudentInvitation.count({ where: whereClause }).then(total => {
              console.log(total)
              req.app.io.emit('masuk',total)
              notif.create({
                hiringPartnerId,
                studentId,
                notif:`Undangan Telah dikirim Ke Kandidat`,
                notifstud:'Anda baru mendapat undangan Dari hiring-partner cek inivitationmu',
                read:false,
                readstudent:false
              }).then(()=>{
                var whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
                var whereClause3={studentId,readstudent:false,notifstud:{[Op.ne]:null}}
                notif.count({where:whereClause2,order:[['createdAt', 'DESC']]})
                .then((totalnotif)=>{
                  notif.findAll({where:whereClause2,order:[['createdAt', 'DESC']],limit:5})
                  .then((result1)=>{
                    notif.count({where:whereClause3,order:[['createdAt', 'DESC']]})
                    .then((totalnotifstud)=>{
                      notif.findAll({where:whereClause3,order:[['createdAt', 'DESC']],limit:5})
                      .then((isinotifstud)=>{
                        req.app.io.emit('notif',totalnotif)
                        req.app.io.emit('notifstud',totalnotifstud)
                        req.app.io.emit('isinotif',result1)
                        req.app.io.emit('isinotifstud',isinotifstud)
                        var whereClause1={studentId,status:['new','interview_accepted','interview_rejected','rescheduled'],readstudent:0}
                        StudentInvitation.count({ where: whereClause1 }).then(total1 => {
                          req.app.io.emit('studentnotif',total1)
                            return res.json({
                              status: responseStatus.SUCCESS,
                              message: 'Data Saved !',
                              result: {
                                id: result.id
                              }
                            });
                          })
                        })
                      })
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
  StudentInvitation.findByPk(req.params.id)
    .then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        studentId,
        status,
        scheduleDate,
        location,
        message,
        interviewRejectedReason,
        rejectedReason,
        updatedBy,
        read,
        hiringPartnerId
      } = req.body;

      obj
        .update({
          studentId: studentId || obj.studentId,
          status: status || obj.status,
          scheduleDate: scheduleDate || obj.scheduleDate,
          location: location || obj.location,
          message: message || obj.message,
          interviewRejectedReason:
            interviewRejectedReason || obj.interviewRejectedReason,
          rejectedReason: rejectedReason || obj.rejectedReason,
          updatedBy: updatedBy || obj.updatedBy,
          read: read === 'undefined' || read === undefined ? false : read
        })
        .then(() =>{
          var whereClause1={hiringPartnerId,status:['new','interview_accepted','interview_rejected','rescheduled'],read:false}
          var notifhp=null
          var notifstud=null
          var whereClause2={}
          var sockiomsgnotif=''
          var sockiomsgisinotif=''
          // req.app.io.emit('notif',totalnotif)
          // req.app.io.emit('notifstud',totalnotifstud)
          // req.app.io.emit('isinotif',result1)
          // req.app.io.emit('isinotifstud',isinotifstud)
          if(status=='interview_accepted'&&updatedBy=='student'){
            notifhp=`undangan interview untuk kandidate dengan id= ${studentId} telah diterima `
            whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
            sockiomsgisinotif='isinotif'
            sockiomsgnotif='notif'
          }else if(status=='interview_rejected'&&updatedBy=='student'){
            notifhp=`undangan interview telah ditolak oleh kandidat dengan id=${studentId}`
            whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
            sockiomsgisinotif='isinotif'
            sockiomsgnotif='notif'
          }else if(status=='rescheduled'&&updatedBy=='student'){
            notifhp=`kandidat dengan id =${studentId}mengajukan rescheduled`
            whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
            sockiomsgisinotif='isinotif'
            sockiomsgnotif='notif'
          }else if(status=='rejected'&& updatedBy=='hiring-partner'){
            notifstud=`Maaf anda has been rejected from interview with hiring partner ${hiringPartnerId}`
            whereClause2={studentId,read:false,notifstud:{[Op.ne]:null}}
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
              notif.findAll({where:whereClause2,order:[['createdAt', 'DESC']],limit:5})
              .then((result1)=>{
                req.app.io.emit(sockiomsgnotif,totalnotif)
                req.app.io.emit(sockiomsgisinotif,result1)
                StudentInvitation.count({ where: whereClause1 })
                .then( total => {
                  req.app.io.emit('masuk',total)
                  res.json({
                    status: responseStatus.SUCCESS,
                    message: 'Data updated !',
                    result: {
                      id: obj.id
                    }
                  })
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
      }).catch(error => {
        return errorResponse(error, res);
      });
    })
    .catch(error => {
      return errorResponse(error, res);
    });
});

router.delete('/:id', (req, res) => {
  StudentInvitation.findByPk(req.params.id)
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

export const StudentInvitationRouter = router;
