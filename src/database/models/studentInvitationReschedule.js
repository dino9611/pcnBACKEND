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

  StudentInvitationReschedule.associate = function () {
    // associations can be defined here
  };

  return StudentInvitationReschedule;
};
