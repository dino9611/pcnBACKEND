import express from 'express';
import sequelize from '../database/sequelize';
import {
    HiringPartner,
    Student,
    StudentInvitation,
    StudentInvitationReschedule,
    User,
    notif
} from '../database/models';
import {
    errorResponse,
    jwtAuth,
    pagingParams,
    responseStatus
  } from '../helper';
const router = express.Router();
const Op = sequelize.Op;

router.get('/',(req,res)=>{
    const {hiringPartnerId,studentId } = req.query;
    var whereClause={status:['new','interview_accepted','interview_rejected','rescheduled']}
    var whereClause2={}
    var whereClause3={}
    var whereClauseisi={}
    if(hiringPartnerId){
      whereClause={...whereClause,hiringPartnerId,read:false}
      whereClause3={status:['hired','rejected','resigned'],read:false,hiringPartnerId}
      whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
      whereClauseisi={hiringPartnerId,notif:{[Op.ne]:null}}
    }else{
      whereClause={...whereClause,studentId,readstudent:false}
      whereClause2={studentId,readstudent:false,notifstud:{[Op.ne]:null}}
      whereClauseisi={studentId,notifstud:{[Op.ne]:null}}
    }
    StudentInvitation.count({ where: whereClause }).then(total => {
        notif.count({where:whereClause2,order:[['createdAt', 'DESC']]})
        .then((totalnotif)=>{
          notif.findAll({
            where:whereClauseisi,
            order:[['createdAt', 'DESC']],
            limit:5,
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
            ]
          }).then(result=>{
            StudentInvitation.count({where:whereClause3})
            .then((resultreport)=>{
              res.json({
                status: responseStatus.SUCCESS,
                message: 'Get data success !',
                total,
                totalnotif,
                isinotif:result,
                totalreport:resultreport
              });
            })
          })
        })
      });
})
router.put('/',(req,res)=>{

  const{  
    hiringPartnerId,
    studentId
  }=req.body
  var readorreadstudent
  var whereClause={}
  var whereClause2={}
  var sockiomsgnotif=''
  if(hiringPartnerId){
    readorreadstudent='read'
    whereClause={hiringPartnerId}
    whereClause2={hiringPartnerId,read:false,notif:{[Op.ne]:null}}
    sockiomsgnotif='notif'
  }else{
    readorreadstudent='readstudent'
    whereClause={studentId}
    whereClause2={studentId,readstudent:false,notifstud:{[Op.ne]:null}}
    sockiomsgnotif='notifstud'
  }
  notif.update({
    [readorreadstudent]:true
  },{
    where:whereClause
  }).then(()=>{
    notif.count({where:whereClause2})
    .then((totalnotif)=>{
      req.app.io.emit(sockiomsgnotif,totalnotif)
      res.json({
        status: responseStatus.SUCCESS,
        message: 'Data updated !',
      })
    }).catch((error)=>{
    })
  }).catch((error)=>{

  })
})

export const HiringPartnernotifRouter = router;