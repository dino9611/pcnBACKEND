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
      },
      offeringLetter: {
        type: DataTypes.STRING
      },
      processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      resigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  StudentHiredReport.associate = function (models) {
    // associations can be defined here
    StudentHiredReport.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentHiredReport.belongsTo(models.HiringPartner, {
      foreignKey: 'hiringPartnerId',
      as: 'hiringPartner'
    });
    StudentHiredReport.belongsTo(models.StudentInvitation, {
      foreignKey: 'id'
    });
  };

  return StudentHiredReport;
};
