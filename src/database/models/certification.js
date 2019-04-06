'use strict';

module.exports = (sequelize, DataTypes) => {
  const Certification = sequelize.define(
    'Certification',
    {
      certification: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {}
  );

  Certification.associate = function () {
    // associations can be defined here
  };

  return Certification;
};
