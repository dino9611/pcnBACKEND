'use strict';

module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define(
    'Skill',
    {
      skill: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      }
    },
    {}
  );

  Skill.associate = function () {
    // associations can be defined here
  };

  return Skill;
};
