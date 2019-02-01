'use strict';

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Admin',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      phoneNumber: {
        type: DataTypes.STRING
      },
      isSuperAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  Admin.associate = function () {
    // associations can be defined here
  };

  return Admin;
};
