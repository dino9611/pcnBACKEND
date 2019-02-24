'use strict';

module.exports = (sequelize, DataTypes) => {
  const JobRole = sequelize.define(
    'JobRole',
    {
      jobRole: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      }
    },
    {}
  );

  JobRole.associate = function () {
    // associations can be defined here
  };

  return JobRole;
};
