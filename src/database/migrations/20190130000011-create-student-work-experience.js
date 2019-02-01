'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('studentWorkExperiences', {
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
      jobTitle: {
        allowNull: false,
        type: Sequelize.STRING
      },
      company: {
        allowNull: false,
        type: Sequelize.STRING
      },
      from: {
        allowNull: false,
        type: Sequelize.DATE
      },
      to: {
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
  down: queryInterface => queryInterface.dropTable('studentWorkExperiences')
};
