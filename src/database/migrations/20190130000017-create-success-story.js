'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('successStories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        type: Sequelize.STRING
      },
      video: {
        type: Sequelize.STRING
      },
      qna: {
        // isinya json, array of object
        type: Sequelize.STRING
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
  down: queryInterface => queryInterface.dropTable('successStories')
};
