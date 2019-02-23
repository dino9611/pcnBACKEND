'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentResignedReport = sequelize.define(
    'StudentResignedReport',
    {
      studentId: {
        type: DataTypes.INTEGER
      },
      hiringPartnerId: {
        type: DataTypes.INTEGER
      },
      reason: {
        type: DataTypes.STRING(1000)
      },
      resignationDate: {
        allowNull: false,
        type: DataTypes.DATE
      },
      suratResign: {
        type: DataTypes.STRING
      }
    },
    {}
  );

  StudentResignedReport.associate = function () {
    // associations can be defined here
  };

  return StudentResignedReport;
};
