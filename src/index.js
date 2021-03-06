import bearerToken from 'express-bearer-token';
import bodyParser from 'body-parser';
import config from './config.json';
import express from 'express';
import logger from './log/logger';
import http from 'http';
import socketIO from 'socket.io';
import {
  AdminRouter,
  CertificationRegistrationRouter,
  CertificationRouter,
  CityRouter,
  EmailerRouter,
  GeneralSettingRouter,
  HiringPartnerRegistrationRouter,
  HiringPartnerRouter,
  HPRegistrationFormRouter,
  JobRoleRouter,
  LoginRouter,
  ProgramRouter,
  ProvinceRouter,
  SkillRouter,
  StudentCertificationRouter,
  StudentEducationRouter,
  StudentHiredReportRouter,
  StudentInvitationRescheduleRouter,
  StudentInvitationRouter,
  StudentJobInterestRouter,
  StudentProgramRouter,
  StudentResignedReportRouter,
  StudentResumeRouter,
  StudentRouter,
  StudentSkillRouter,
  HiringPartnernotifRouter,
  StudentWorkExperienceRouter,
  SuccessStoryRouter,
  ValidateTokenRouter
} from './router';

const app = express();
const port = config.PORT || 2411;

app.set('etag', false);
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Accept, Accept-Version, Authorization, Content-Length, Cache-Control, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token'
  );
  next();
});

const server=http.createServer(app)
const io=socketIO(server)
app.io=io
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bearerToken());
app.use(express.static('./src/public'));

app.get('/', (req, res) => {
  res.send(
    `Welcome to "Purwadhika Career Network API version : ${config.VERSION}"`
  );
});

// list of router
app.use('/admins', AdminRouter);
app.use('/certifications', CertificationRouter);
app.use('/certification-registrations', CertificationRegistrationRouter);
app.use('/cities', CityRouter);
app.use('/emailer', EmailerRouter)
app.use('/general-settings', GeneralSettingRouter);
app.use('/hp-registrations', HiringPartnerRegistrationRouter);
app.use('/hiring-partners', HiringPartnerRouter);
app.use('/hp-registration-forms', HPRegistrationFormRouter);
app.use('/job-roles', JobRoleRouter);
app.use('/logins', LoginRouter);
app.use('/programs', ProgramRouter);
app.use('/provinces', ProvinceRouter);
app.use('/skills', SkillRouter);
app.use('/student-certifications', StudentCertificationRouter);
app.use('/student-educations', StudentEducationRouter);
app.use('/student-hired-reports', StudentHiredReportRouter);
app.use('/student-invitation-reschedules', StudentInvitationRescheduleRouter);
app.use('/student-invitations', StudentInvitationRouter);
app.use('/student-job-interests', StudentJobInterestRouter);
app.use('/student-programs', StudentProgramRouter);
app.use('/student-resigned-reports', StudentResignedReportRouter);
app.use('/student-resumes', StudentResumeRouter);
app.use('/students', StudentRouter);
app.use('/student-skills', StudentSkillRouter);
app.use('/student-work-experiences', StudentWorkExperienceRouter);
app.use('/success-stories', SuccessStoryRouter);
app.use('/validate-token', ValidateTokenRouter);

app.use('/student-invitations-notif',HiringPartnernotifRouter)




//socket.io
io.on('connection',socket=>{
  console.log('User Connected')
  socket.on('disconnect',()=>{
    console.log('user disconnected')
  })
})

// list of router

server.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}`);
});

process.on('uncaughtException', error => {
  logger.error(JSON.stringify(error));
  process.exit(1);
});

process.on('unhandledRejection', error => {
  logger.error(JSON.stringify(error.message));
  process.exit(1);
});
