'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('studentJobInterests', {
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
      jobCategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'jobCategories',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      experience: {
        // berapa tahun pengalaman dalam job ini
        type: Sequelize.INTEGER
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
  down: queryInterface => queryInterface.dropTable('studentJobInterests')
};
