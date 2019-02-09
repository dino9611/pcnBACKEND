import { validationType } from '..';

const validateEmail = email => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
};

const checkValidation = (field, type) => {
  let isValid = true;
  let defaultError = 'Not valid';

  if (!field) {
    isValid = false;
    defaultError = 'Cannot be empty';
  } else if (type === validationType.isEmail) {
    isValid = validateEmail(field);
    defaultError = 'Email in invalid format';
  }

  return { isValid, defaultError };
};

export const validate = (params, source) => {
  const validationResult = [];

  params.forEach(data => {
    const field = data.field || '';
    const type = data.validationType || validationType.exists;
    const result = checkValidation(source[field], type);

    if (!result.isValid) {
      validationResult.push({
        field,
        error: data.message || result.defaultError
      });

      // validationResult[field] = { error: data.message || result.defaultError }
    }
  });

  return validationResult;
};
