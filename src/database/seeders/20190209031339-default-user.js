'use strict';

const models = require('../models');
const User = models.User;

module.exports = {
  up: async queryInterface => {
    queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'admin@purwadhika.com',
          password:
            '$2b$10$3dmSV4G5ALXPHI4HS.BCXuIG8PGUCu1e7YUhN/.KvgfHq5g4AibTi',
          type: 'admin',
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
    const user = await User.findOne({
      where: {
        type: 'admin',
        email: 'admin@purwadhika-career.com'
      }
    });

    return await queryInterface.bulkInsert(
      'Admins',
      [
        {
          id: user.id,
          name: 'Admin',
          phoneNumber: '08123456789',
          isSuperAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },
  down: async queryInterface => {
    await queryInterface.bulkDelete('Admins', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
