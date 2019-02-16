import sequelize from '../database/sequelize';
import { HiringPartner, Student } from '../database/models';
import '@babel/polyfill';

const Op = sequelize.Op;

export const generateHiringPartnerSlug = async name => {
  try {
    const slug = name.toLowerCase().replace(' ', '_');
    const existingSlug = await HiringPartner.findAll({
      attributes: [ 'slug' ],
      where: { slug: { [Op.like]: `${slug}%` }},
      raw: true
    }).then(result => result.map(hp => hp.slug));

    if (existingSlug.length === 0) {
      return slug;
    }

    let newSlug = slug;
    let counter = 1;

    do {
      newSlug = `${slug + counter}`;
      counter += 1;
    } while (existingSlug.indexOf(newSlug) > -1);

    return newSlug;
  } catch (error) {
    throw error;
  }
};

export const generateStudentSlug = async name => {
  try {
    const slug = name.toLowerCase().replace(' ', '_');
    const existingSlug = await Student.findAll({
      attributes: [ 'slug' ],
      where: { slug: { [Op.like]: `${slug}%` }},
      raw: true
    }).then(result => result.map(st => st.slug));

    if (existingSlug.length === 0) {
      return slug;
    }

    let newSlug = slug;
    let counter = 1;

    do {
      newSlug = `${slug + counter}`;
      counter += 1;
    } while (existingSlug.indexOf(newSlug) > -1);

    return newSlug;
  } catch (error) {
    throw error;
  }
};
