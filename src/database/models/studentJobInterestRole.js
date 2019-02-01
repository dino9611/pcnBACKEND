'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentJobInterestRole = sequelize.define(
    'StudentJobInterestRole',
    {
      studentJobInterestId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      highlight: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  StudentJobInterestRole.associate = function () {
    // associations can be defined here
  };

  return StudentJobInterestRole;
};
