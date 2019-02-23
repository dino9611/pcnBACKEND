'use strict';

module.exports = (sequelize, DataTypes) => {
  const Province = sequelize.define(
    'Province',
    {
      province: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {}
  );

  Province.associate = function () {
    // associations can be defined here
  };

  return Province;
};
