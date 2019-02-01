'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentWorkExperience = sequelize.define(
    'StudentWorkExperience',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      jobTitle: {
        allowNull: false,
        type: DataTypes.STRING
      },
      company: {
        allowNull: false,
        type: DataTypes.STRING
      },
      from: {
        allowNull: false,
        type: DataTypes.DATE
      },
      to: {
        allowNull: false,
        type: DataTypes.DATE
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {}
  );

  StudentWorkExperience.associate = function () {
    // associations can be defined here
  };

  return StudentWorkExperience;
};
