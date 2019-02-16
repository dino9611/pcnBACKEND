'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Admins', {
      id: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        type: Sequelize.INTEGER,
        onDelete: 'cascade'
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      isSuperAdmin: {
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
  down: queryInterface => queryInterface.dropTable('Admins')
};
