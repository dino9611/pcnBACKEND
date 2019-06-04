'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('GeneralSettings', {
      key: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      value: {
        allowNull: false,
        type: Sequelize.STRING
      },
      section: {
        type: Sequelize.STRING
      },
      subsection: {
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
  down: queryInterface => queryInterface.dropTable('GeneralSettings')
};
