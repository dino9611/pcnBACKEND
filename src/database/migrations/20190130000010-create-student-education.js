'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('studentEducations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentResumeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'studentResumes',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      institution: {
        allowNull: false,
        type: Sequelize.STRING
      },
      degree: {
        type: Sequelize.STRING
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      endDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      description: {
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
  down: queryInterface => queryInterface.dropTable('studentEducations')
};
