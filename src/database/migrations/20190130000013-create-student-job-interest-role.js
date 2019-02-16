'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentJobInterestRoles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentJobInterestId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'StudentJobInterests',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'JobRoles',
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
  down: queryInterface => queryInterface.dropTable('StudentJobInterestRoles')
};
