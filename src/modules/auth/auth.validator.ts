import { Joi } from 'celebrate';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{5,18}$/;

export const AuthValidation = {
  signInValidation: Joi.object().keys({
    user_name: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),
    password: Joi.string().required().min(5).max(18).pattern(passwordRegex).messages({
      'string.pattern.base':
        'Password must contain at least 1 uppercase letter, 1 number, and 1 special character.',
    }),
  }),

  forgotPasswordValidation: Joi.object().keys({
    user_name: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address to reset your password.',
      'any.required': 'Email is required.',
    }),
  }),

  resetPasswordValidation: Joi.object().keys({
    reset_token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    new_password: Joi.string().required().min(5).max(18).pattern(passwordRegex).messages({
      'string.pattern.base':
        'Password must contain at least 1 uppercase letter, 1 number, and 1 special character.',
    }),
  }),
};
