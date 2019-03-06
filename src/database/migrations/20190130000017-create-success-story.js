'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('SuccessStories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      headline: {
        type: Sequelize.STRING
      },
      additionalInfo: {
        // isinya json, array of string
        type: Sequelize.STRING(1000)
      },
      video: {
        type: Sequelize.STRING
      },
      qna: {
        // isinya json, array of object
        type: Sequelize.STRING(1000)
      },
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
  down: queryInterface => queryInterface.dropTable('SuccessStories')
};
