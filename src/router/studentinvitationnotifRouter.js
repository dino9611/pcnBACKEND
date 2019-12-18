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
    const {  hiringPartnerId,studentId } = req.query;
    var whereClause={status:['new','interview_accepted','interview_rejected','rescheduled']}
    var whereClause2={}
    var whereClauseisi={}
    if(hiringPartnerId){
      whereClause={...whereClause,hiringPartnerId,read:false}
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
          notif.findAll({where:whereClause2,order:[['createdAt', 'DESC']],limit:5}).then(result=>{
            res.json({
              status: responseStatus.SUCCESS,
              message: 'Get data success !',
              total,
              totalnotif,
              isinotif:result
            });

          })

        })
      });
})

export const HiringPartnernotifRouter = router;