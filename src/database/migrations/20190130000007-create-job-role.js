'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('jobRoles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      role: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
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
  down: queryInterface => queryInterface.dropTable('jobRoles')
};
