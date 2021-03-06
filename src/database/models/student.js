'use strict';

module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
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
      },
      isAvailable: {
        type: DataTypes.BOOLEAN
      }
    },
    {}
  );

  Student.associate = function (models) {
    Student.belongsTo(models.User, { foreignKey: 'id', as: 'user' });
    Student.hasOne(models.StudentResume, { foreignKey: 'id', as: 'studentResume' });
  };

  return Student;
};
