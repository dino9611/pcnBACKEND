'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentResumes', {
      id: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Students',
          key: 'id'
        },
        type: Sequelize.INTEGER,
        onDelete: 'cascade'
      },
      summary: {
        type: Sequelize.STRING(1000)
      },
      jobPreferences: {
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
  down: queryInterface => queryInterface.dropTable('StudentResumes')
};
