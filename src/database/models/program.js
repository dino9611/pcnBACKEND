'use strict';

module.exports = (sequelize, DataTypes) => {
  const Program = sequelize.define(
    'Program',
    {
      program: {
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
