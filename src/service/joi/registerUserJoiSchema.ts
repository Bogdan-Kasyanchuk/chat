import Joi from 'joi';

import { emailRegex, passwordRegex } from '@/helpers';

const joiSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    'string.pattern.base': 'Enter the desired email format!',
    'string.empty': 'The email field cannot be empty!',
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.pattern.base': 'Enter the desired password format!',
    'string.empty': 'The password field cannot be empty!',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).messages({
    'any.only': 'The confirm password must be a password!',
    'string.empty': 'The password field cannot be empty!',
  }),
});

export default joiSchema;
