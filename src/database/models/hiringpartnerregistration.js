'use strict';

module.exports = (sequelize, DataTypes) => {
  const HiringPartnerRegistration = sequelize.define(
    'HiringPartnerRegistration',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING
      },
      phoneNumber: {
        type: DataTypes.STRING
      },
      companyName: {
        type: DataTypes.STRING
      },
      companyWebsite: {
        type: DataTypes.STRING
      },
      companyJobPosition: {
        type: DataTypes.STRING
      },
      jobPositionAndRequirement: {
        type: DataTypes.STRING
      },
      supportingValue: {
        type: DataTypes.STRING
      },
      processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  HiringPartnerRegistration.associate = function () {
    // associations can be defined here
  };

  return HiringPartnerRegistration;
};
