'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('studentPrograms', {
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
      programId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'programs',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      batch: {
        type: Sequelize.STRING(4)
      },
      year: {
        type: Sequelize.STRING(4)
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
  down: queryInterface => queryInterface.dropTable('studentPrograms')
};
