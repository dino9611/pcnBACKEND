'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentResignedReports', {
      id: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'StudentInvitations',
          key: 'id'
        },
        type: Sequelize.INTEGER,
        onDelete: 'cascade'
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
      reason: {
        type: Sequelize.STRING(1000)
      },
      resignationDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      suratResign: {
        type: Sequelize.STRING
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
  down: queryInterface => queryInterface.dropTable('StudentResignedReports')
};
