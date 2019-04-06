'use strict';

module.exports = (sequelize, DataTypes) => {
  const StudentCertification = sequelize.define(
    'StudentCertification',
    {
      studentResumeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      certificationId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {}
  );

  StudentCertification.associate = function (models) {
    // associations can be defined here
    StudentCertification.belongsTo(models.Certification, { foreignKey: 'certificationId', as: 'certification' });
  };

  return StudentCertification;
};
