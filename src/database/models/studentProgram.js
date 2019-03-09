'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentProgram = sequelize.define(
    'StudentProgram',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      programId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      batch: {
        type: DataTypes.STRING(4)
      },
      year: {
        type: DataTypes.STRING(4)
      },
      highlight: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  StudentProgram.associate = function (models) {
    // associations can be defined here
    StudentProgram.belongsTo(models.Program, { foreignKey: 'programId', as: 'program' });
  };

  return StudentProgram;
};
