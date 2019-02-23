'use strict';

module.exports = (sequelize, DataTypes) => {
  const SuccessStory = sequelize.define(
    'SuccessStory',
    {
      type: {
        type: DataTypes.STRING
      },
      photo: {
        type: DataTypes.STRING
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      title: {
        type: DataTypes.STRING
      },
      headline: {
        type: DataTypes.STRING
      },
      additionalInfo: {
        // isinya json, array of string
        type: DataTypes.STRING
      },
      video: {
        type: DataTypes.STRING
      },
      qna: {
        // isinya json, array of object
        type: DataTypes.STRING
      },
      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {}
  );

  SuccessStory.associate = function () {
    // associations can be defined here
  };

  return SuccessStory;
};
