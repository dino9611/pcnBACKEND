'use strict';

module.exports = (sequelize, DataTypes) => {
  const HPRegistrationForm = sequelize.define(
    'HPRegistrationForm',
    {
      key: {
        allowNull: false,
        type: DataTypes.STRING
      },
      value: {
        allowNull: false,
        type: DataTypes.STRING(500)
      }
    },
    {}
  );

  HPRegistrationForm.associate = function () {
    // associations can be defined here
  };

  return HPRegistrationForm;
};
