'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentHiredReport = sequelize.define(
    'StudentHiredReport',
    {
      studentId: {
        type: DataTypes.INTEGER
      },
      hiringPartnerId: {
        type: DataTypes.INTEGER
      },
      jobTitle: {
        type: DataTypes.STRING
      },
      location: {
        type: DataTypes.STRING
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE
      },
      salary: {
        type: DataTypes.DECIMAL,
        defaultValue: 0
      }
    },
    {}
  );

  StudentHiredReport.associate = function () {
    // associations can be defined here
  };

  return StudentHiredReport;
};
