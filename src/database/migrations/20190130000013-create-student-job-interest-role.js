'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('studentJobInterestRoles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentJobInterestId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'studentJobInterests',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'jobRoles',
          key: 'id'
        },
        allowNull: false
      },
      highlight: {
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
  down: queryInterface => queryInterface.dropTable('studentJobInterestRoles')
};
