'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('StudentSkills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      studentResumeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'StudentResumes',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
      },
      skillId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Skills',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'cascade'
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
  down: queryInterface => queryInterface.dropTable('StudentSkills')
};
