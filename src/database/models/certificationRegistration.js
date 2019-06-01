'use strict';

module.exports = (sequelize, DataTypes) => {
  const CertificationRegistration = sequelize.define(
    'CertificationRegistration',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING
      },
      pob: {
        allowNull: false,
        type: DataTypes.STRING
      },
      dob: {
        allowNull: false,
        type: DataTypes.DATE
      },
      phoneNumber: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      currentJobPosition: {
        type: DataTypes.STRING
      },
      lastEducation: {
        type: DataTypes.STRING
      },
      findThisProgram: {
        type: DataTypes.STRING
      },
      reason: {
        type: DataTypes.STRING
      },
      cv: {
        type: DataTypes.STRING
      },
      processed: {
        type: DataTypes.BOOLEAN
      }
    },
    {}
  );

  CertificationRegistration.associate = function () {
    // associations can be defined here
  };

  return CertificationRegistration;
};
