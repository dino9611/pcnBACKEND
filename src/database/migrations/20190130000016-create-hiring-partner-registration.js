'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('HiringPartnerRegistrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      companyName: {
        type: Sequelize.STRING
      },
      companyWebsite: {
        type: Sequelize.STRING
      },
      companyJobPosition: {
        type: Sequelize.STRING
      },
      jobPositionAndRequirement: {
        type: Sequelize.STRING
      },
      supportingValue: {
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
  down: queryInterface => queryInterface.dropTable('HiringPartnerRegistrations')
};
