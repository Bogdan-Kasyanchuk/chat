import Joi from 'joi';

import { emailRegex, passwordRegex } from '@/helpers';

const loginUserJoiSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    'string.pattern.base': 'Enter the desired email format!',
    'string.empty': 'The email field cannot be empty!',
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.pattern.base': 'Enter the desired password format!',
    'string.empty': 'The password field cannot be empty!',
  }),
});

export default loginUserJoiSchema;
