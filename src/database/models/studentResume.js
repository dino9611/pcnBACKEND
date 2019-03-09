'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentResume = sequelize.define(
    'StudentResume',
    {
      headline: {
        type: DataTypes.STRING(255)
      },
      summary: {
        type: DataTypes.STRING(1000)
      },
      jobPreferences: {
        type: DataTypes.STRING
      },
      baseSalary: {
        type: DataTypes.DECIMAL
      },
      profileVideo: {
        type: DataTypes.STRING
      }
    },
    {}
  );

  StudentResume.associate = function (models) {
    // associations can be defined here
    StudentResume.belongsTo(models.Student, { foreignKey: 'id', as: 'student' });
    StudentResume.hasMany(models.StudentProgram, { foreignKey: 'studentResumeId', as: 'studentProgram' });
    StudentResume.hasMany(models.StudentSkill, { foreignKey: 'studentResumeId', as: 'studentSkill' });
    StudentResume.hasMany(models.StudentWorkExperience, { foreignKey: 'studentResumeId', as: 'studentWorkExperience' });
    StudentResume.hasMany(models.StudentEducation, { foreignKey: 'studentResumeId', as: 'studentEducation' });
    StudentResume.hasMany(models.StudentJobInterest, { foreignKey: 'studentResumeId', as: 'studentJobInterest' });
  };

  return StudentResume;
};
