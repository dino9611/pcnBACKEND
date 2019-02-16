'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentResumes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      headline: {
        type: Sequelize.STRING(255)
      },
      summary: {
        type: Sequelize.STRING(1000)
      },
      jobPreferences: {
        type: Sequelize.STRING
      },
      baseSalary: {
        type: Sequelize.DECIMAL
      },
      profileVideo: {
        type: Sequelize.STRING
      },

      studentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Students',
          key: 'id'
        },
        onDelete: 'cascade'
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
  down: queryInterface => queryInterface.dropTable('StudentResumes')
};
