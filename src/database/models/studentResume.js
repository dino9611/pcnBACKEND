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
      },
      studentId: {
        type: DataTypes.INTEGER
      }
    },
    {}
  );

  StudentResume.associate = function () {
    // associations can be defined here
  };

  return StudentResume;
};
