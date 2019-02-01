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
      studentId: {
        type: DataTypes.INTEGER
      },
      hiringPartnerId: {
        type: DataTypes.INTEGER
      },
      adminId: {
        type: DataTypes.INTEGER
      },
      lastLogin: {
        type: DataTypes.DATE
      }
    },
    {}
  );

  User.associate = function () {
    // associations can be defined here
  };

  return User;
};
