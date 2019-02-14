import bcrypt from 'bcrypt';
import crypto from 'crypto';

const saltRounds = 10;

export const encrypt = (key, data) => {
  const cipher = crypto.createCipher('aes192', key);
  let crypted = cipher.update(data, 'utf-8', 'hex');

  crypted += cipher.final('hex');

  return crypted;
};

export const decrypt = (key, data) => {
  try {
    const decipher = crypto.createDecipher('aes192', key);
    let decrypted = decipher.update(data, 'hex', 'utf-8');

    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    return error;
  }
};

export const generateHash = data => {
  const result = bcrypt.hashSync(data, saltRounds);

  return result;
};

export const compareHash = (val1, val2) => {
  const result = bcrypt.compareSync(val1, val2);

  return result;
};
