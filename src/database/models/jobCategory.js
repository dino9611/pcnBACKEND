'use strict';

module.exports = (sequelize, DataTypes) => {
  const JobCategory = sequelize.define(
    'JobCategory',
    {
      category: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      }
    },
    {}
  );

  JobCategory.associate = function () {
    // associations can be defined here
  };

  return JobCategory;
};
