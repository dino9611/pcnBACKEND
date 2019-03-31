'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentHiredReports', {
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
      jobTitle: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      salary: {
        type: Sequelize.DECIMAL,
        defaultValue: 0
      },
      resigned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
  down: queryInterface => queryInterface.dropTable('StudentHiredReports')
};
