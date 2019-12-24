'use strict';
module.exports = (sequelize, DataTypes) => {
  const notif = sequelize.define('notif', {
    readstudent: {
      type:DataTypes.BOOLEAN,
    
    },
    read: {
      type:DataTypes.BOOLEAN,
    
    },
    notif: DataTypes.STRING,
    notifstud:DataTypes.STRING,
    hiringPartnerId: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    studentId: {
      type:DataTypes.INTEGER,
      allowNull:false
    }
  }, {});
  notif.associate = function(models) {
    // associations can be defined here
    notif.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    notif.belongsTo(models.HiringPartner, {
      foreignKey: 'hiringPartnerId',
      as: 'hiringPartner'
    });
  };
  return notif;
};