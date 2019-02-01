'use strict';

module.exports = (sequelize, DataTypes) => {
  const Program = sequelize.define(
    'Program',
    {
      programCode: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      programName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {}
  );

  Program.associate = function () {
    // associations can be defined here
  };

  return Program;
};
