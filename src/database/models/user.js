'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING
      },
      profilePicture: {
        type: DataTypes.STRING
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING
      },
      lastLogin: {
        type: DataTypes.DATE
      }
    },
    {}
  );

  User.associate = function (models) {
    // associations can be defined here
    User.hasOne(models.Admin, { foreignKey: 'id', as: 'admin' });
    User.hasOne(models.HiringPartner, {
      foreignKey: 'id',
      as: 'hiringPartner'
    });
    User.hasOne(models.Student, { foreignKey: 'id', as: 'student' });
  };

  return User;
};
