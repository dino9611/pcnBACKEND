'use strict';

module.exports = (sequelize, DataTypes) => {
  const GeneralSetting = sequelize.define(
    'GeneralSetting',
    {
      key: {
        allowNull: false,
        type: DataTypes.STRING
      },
      value: {
        allowNull: false,
        type: DataTypes.STRING
      },
      section: {
        type: DataTypes.STRING
      },
      subsection: {
        type: DataTypes.STRING
      }
    },
    {}
  );

  GeneralSetting.associate = function () {
    // associations can be defined here
  };
  GeneralSetting.removeAttribute('id');

  return GeneralSetting;
};
