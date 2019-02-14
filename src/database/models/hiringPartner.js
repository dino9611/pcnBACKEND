'use strict';

module.exports = (sequelize, DataTypes) => {
  const HiringPartner = sequelize.define(
    'HiringPartner',
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

      summary: {
        type: DataTypes.STRING(1000)
      },
      teamSize: {
        type: DataTypes.INTEGER
      },
      profileVideo: {
        type: DataTypes.STRING
      },
      website: {
        type: DataTypes.STRING
      },
      facebook: {
        type: DataTypes.STRING
      },
      linkedin: {
        type: DataTypes.STRING
      },
      useHiringFee: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  HiringPartner.associate = function (models) {
    HiringPartner.belongsTo(models.User, { foreignKey: 'id', as: 'user' });
  };

  return HiringPartner;
};
