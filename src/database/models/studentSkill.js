'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentSkill = sequelize.define(
    'StudentSkill',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      skillId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {}
  );

  StudentSkill.associate = function () {
    // associations can be defined here
  };

  return StudentSkill;
};
