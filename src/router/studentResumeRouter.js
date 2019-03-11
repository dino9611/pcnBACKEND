import { checkBody } from '../lib/validator';
import express from 'express';
import sequelize from '../database/sequelize';
import {
  errorResponse,
  jwtAuth,
  pagingParams,
  publicAuth,
  responseStatus
} from '../helper';
import {
  JobRole,
  Program,
  Skill,
  Student,
  StudentEducation,
  StudentJobInterest,
  StudentProgram,
  StudentResume,
  StudentSkill,
  StudentWorkExperience,
  User
} from '../database/models';

const router = express.Router();
const Op = sequelize.Op;

router.get('/', publicAuth, pagingParams, (req, res) => {
  const { offset, limit, name, jobRoles, skills, jobPreferences } = req.query;
  let whereClause = {};

  if (name) {
    whereClause = Object.assign(whereClause, {
      name: { [Op.like]: `%${name}%` }
    });
  }
  if (jobPreferences && Array.isArray(jobPreferences) && jobPreferences.length > 0) {
    const filter = jobPreferences.map(val => {
      return { jobPreferences: { [Op.like]: `%${val}%` }};
    });

    whereClause = Object.assign(whereClause, { [Op.or]: filter });
  }

  let jiFilter = null;
  let skillFilter = null;

  if (jobRoles && Array.isArray(jobRoles) && jobRoles.length > 0) {
    jiFilter = {};
    const filter = jobRoles.map(val => {
      return { jobRoleId: val };
    });

    jiFilter = Object.assign(jiFilter, { [Op.or]: filter });
  }
  if (skills && Array.isArray(skills) && skills.length > 0) {
    skillFilter = {};
    const filter = skills.map(val => {
      return { skillId: val };
    });

    skillFilter = Object.assign(skillFilter, { [Op.or]: filter });
  }

  StudentResume.findAll({
    where: whereClause,
    offset,
    limit,
    include: [
      {
        model: Student,
        as: 'student',
        attributes: [
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
            attributes: [ 'email', 'profilePicture', 'type' ]
          }
        ]
      },
      {
        model: StudentSkill,
        as: 'studentSkill',
        attributes: [ 'id', 'position' ],
        include: [{ model: Skill, as: 'skill', attributes: [ 'id', 'skill' ]}],
        where: skillFilter
      },
      {
        model: StudentProgram,
        as: 'studentProgram',
        attributes: [ 'id', 'batch', 'year', 'highlight' ],
        include: [
          { model: Program, as: 'program', attributes: [ 'id', 'program' ]}
        ]
      },
      {
        model: StudentWorkExperience,
        as: 'studentWorkExperience',
        attributes: [ 'id', 'jobTitle', 'company', 'from', 'to', 'description' ]
      },
      {
        model: StudentEducation,
        as: 'studentEducation',
        attributes: [
          'id',
          'institution',
          'degree',
          'startDate',
          'endDate',
          'description'
        ]
      },
      {
        model: StudentJobInterest,
        as: 'studentJobInterest',
        attributes: [ 'id', 'experience', 'highlight' ],
        include: [
          { model: JobRole, as: 'jobRole', attributes: [ 'id', 'jobRole' ]}
        ],
        where: jiFilter
      }
    ],
    order: [
      [{ model: StudentSkill, as: 'studentSkill' }, 'position' ],
      [{ model: StudentEducation, as: 'studentEducation' }, 'endDate', 'DESC' ],
      [{ model: StudentJobInterest, as: 'studentJobInterest' }, 'highlight', 'DESC' ],
      [{ model: StudentWorkExperience, as: 'studentWorkExperience' }, 'to', 'DESC' ],
      [{ model: StudentProgram, as: 'studentProgram' }, 'highlight', 'DESC' ]
    ]
  }).
    then(result => {
      StudentResume.count({ where: whereClause }).then(total => {
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

router.get('/:id', publicAuth, (req, res) => {
  StudentResume.findByPk(req.params.id, {
    attributes: [
      'id',
      'headline',
      'summary',
      'jobPreferences',
      'baseSalary',
      'profileVideo'
    ],
    include: [
      {
        model: Student,
        as: 'student',
        attributes: [
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
            attributes: [ 'email', 'profilePicture', 'type' ]
          }
        ]
      }
    ]
  }).
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
  jwtAuth,
  checkBody([
    { field: 'studentId' },
    { field: 'headline' },
    { field: 'summary' },
    { field: 'jobPreferences' },
    { field: 'baseSalary' }
  ]),
  (req, res) => {
    try {
      const {
        studentId,
        headline,
        summary,
        jobPreferences,
        baseSalary,
        profileVideo
      } = req.body;

      StudentResume.create({
        id: studentId,
        headline,
        summary,
        jobPreferences,
        baseSalary,
        profileVideo
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
  StudentResume.findByPk(req.params.id).
    then(obj => {
      if (!obj) {
        return res.json({
          status: responseStatus.NOT_FOUND,
          message: 'Data not found !'
        });
      }
      const {
        headline,
        summary,
        jobPreferences,
        baseSalary,
        profileVideo
      } = req.body;

      obj.
        update({
          headline: headline || obj.headline,
          summary: summary || obj.summary,
          jobPreferences: jobPreferences || obj.jobPreferences,
          baseSalary: baseSalary || obj.baseSalary,
          profileVideo: profileVideo || obj.profileVideo
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
  StudentResume.findByPk(req.params.id).
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

export const StudentResumeRouter = router;
