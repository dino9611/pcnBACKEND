'use strict';

module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
      code: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      slug: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING
      },
      province: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },

      birthDate: {
        type: DataTypes.DATE
      },
      gender: {
        type: DataTypes.STRING(1)
      }
    },
    {}
  );

  Student.associate = function () {
    // associations can be defined here
  };

  return Student;
};
