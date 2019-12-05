import express from 'express';
import sequelize from '../database/sequelize';
import {
    HiringPartner,
    Student,
    StudentInvitation,
    StudentInvitationReschedule,
    User
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
    if(hiringPartnerId){
      whereClause={...whereClause,hiringPartnerId,read:false}
    }else{
      whereClause={...whereClause,studentId,readstudent:false}
    }
    StudentInvitation.count({ where: whereClause }).then(total => {
        // console.log(total)
        res.json({
          status: responseStatus.SUCCESS,
          message: 'Get data success !',
          total
        });
      });
})

export const HiringPartnernotifRouter = router;