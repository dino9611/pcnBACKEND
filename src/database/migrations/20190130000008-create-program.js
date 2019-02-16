'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Programs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      programCode: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      programName: {
        type: Sequelize.STRING,
        allowNull: false,
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
  down: queryInterface => queryInterface.dropTable('Programs')
};
