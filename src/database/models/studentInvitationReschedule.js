'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentInvitationReschedule = sequelize.define(
    'StudentInvitationReschedule',
    {
      studentInvitationId: {
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
      proposedBy: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {}
  );

  StudentInvitationReschedule.associate = function (models) {
    // associations can be defined here
    StudentInvitationReschedule.belongsTo(models.StudentInvitation, {
      foreignKey: 'studentInvitationId',
      as: 'studentInvitation'
    });
  };

  return StudentInvitationReschedule;
};
