'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      profilePicture: {
        type: Sequelize.STRING
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      studentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'students',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      hiringPartnerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'hiringPartners',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      adminId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'admins',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      lastLogin: {
        type: Sequelize.DATE
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
  down: queryInterface => queryInterface.dropTable('users')
};
