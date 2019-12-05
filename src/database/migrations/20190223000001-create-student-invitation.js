'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentInvitations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Students',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      hiringPartnerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'HiringPartners',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      scheduleDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      location: {
        allowNull: false,
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING(1000)
      },
      interviewRejectedReason: {
        type: Sequelize.STRING(1000)
      },
      rejectedReason: {
        type: Sequelize.STRING(1000)
      },
      read: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      readstudent:{
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      updatedBy: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }),
  down: queryInterface => queryInterface.dropTable('StudentInvitations')
};
