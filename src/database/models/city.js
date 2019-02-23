'use strict';

module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    'City',
    {
      provinceId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      city: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {}
  );

  City.associate = function () {
    // associations can be defined here
  };

  return City;
};
