'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentEducation = sequelize.define(
    'StudentEducation',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      institution: {
        allowNull: false,
        type: DataTypes.STRING
      },
      degree: {
        type: DataTypes.STRING
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {}
  );

  StudentEducation.associate = function () {
    // associations can be defined here
  };

  return StudentEducation;
};
