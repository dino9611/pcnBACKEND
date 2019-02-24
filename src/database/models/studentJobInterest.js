'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentJobInterest = sequelize.define(
    'StudentJobInterest',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      jobRoleId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      experience: {
        // berapa tahun pengalaman dalam job ini
        type: DataTypes.INTEGER
      },
      highlight: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  StudentJobInterest.associate = function () {
    // associations can be defined here
  };

  return StudentJobInterest;
};
