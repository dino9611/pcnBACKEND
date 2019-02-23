'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentInvitation = sequelize.define(
    'StudentInvitation',
    {
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      hiringPartnerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING
      },
      scheduleDate: {
        allowNull: false,
        type: DataTypes.DATE
      },
      location: {
        allowNull: false,
        type: DataTypes.STRING
      },
      message: {
        type: DataTypes.STRING(1000)
      },
      interviewRejectedReason: {
        type: DataTypes.STRING(1000)
      },
      rejectedReason: {
        type: DataTypes.STRING(1000)
      }
    },
    {}
  );

  StudentInvitation.associate = function () {
    // associations can be defined here
  };

  return StudentInvitation;
};
