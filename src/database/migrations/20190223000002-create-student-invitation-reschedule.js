'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentInvitationReschedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentInvitationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'StudentInvitations',
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
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING(1000)
      },
      proposedBy: {
        allowNull: false,
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
  down: queryInterface => queryInterface.dropTable('StudentInvitationReschedules')
};
