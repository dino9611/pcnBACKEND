'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('CertificationRegistrations', {
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
        type: Sequelize.STRING
      },
      pob: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dob: {
        allowNull: false,
        type: Sequelize.DATE
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      currentJobPosition: {
        type: Sequelize.STRING
      },
      lastEducation: {
        type: Sequelize.STRING
      },
      findThisProgram: {
        type: Sequelize.STRING
      },
      reason: {
        type: Sequelize.STRING
      },
      cv: {
        type: Sequelize.STRING
      },
      processed: {
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
  down: queryInterface => queryInterface.dropTable('CertificationRegistrations')
};
