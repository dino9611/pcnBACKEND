'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('HiringPartners', {
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
      slug: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phoneNumber: {
        allowNull: false,
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },

      summary: {
        type: Sequelize.STRING(1000)
      },
      teamSize: {
        type: Sequelize.INTEGER
      },
      profileVideo: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      facebook: {
        type: Sequelize.STRING
      },
      linkedin: {
        type: Sequelize.STRING
      },
      useHiringFee: {
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
  down: queryInterface => queryInterface.dropTable('HiringPartners')
};
