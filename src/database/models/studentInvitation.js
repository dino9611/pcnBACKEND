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
      interviewRejectedBy: {
        type: DataTypes.STRING
      },
      rejectedReason: {
        type: DataTypes.STRING(1000)
      }
    },
    {}
  );

  StudentInvitation.associate = function (models) {
    // associations can be defined here
    StudentInvitation.belongsTo(models.HiringPartner, {
      foreignKey: 'hiringPartnerId',
      as: 'hiringPartner'
    });
    StudentInvitation.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    StudentInvitation.hasMany(models.StudentInvitationReschedule, {
      foreignKey: 'studentInvitationId',
      as: 'studentInvitationReschedule'
    });
  };

  return StudentInvitation;
};
