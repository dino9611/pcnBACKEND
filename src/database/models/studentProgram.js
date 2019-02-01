'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentProgram = sequelize.define(
    'StudentProgram',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      programId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      batch: {
        type: DataTypes.STRING(4)
      },
      year: {
        type: DataTypes.STRING(4)
      }
    },
    {}
  );

  StudentProgram.associate = function () {
    // associations can be defined here
  };

  return StudentProgram;
};
