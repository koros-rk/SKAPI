import { object, string } from 'yup';

export const TokenSchema = object()
  .required()
  .shape({
    grant_type: string().oneOf(['credentials', 'refresh_token']).required(),
    email: string().when('grant_type', {
      is: 'credentials',
      then: (schema) => schema.email().optional(),
      otherwise: (schema) => schema.optional(),
    }),
    username: string().when('grant_type', {
      is: 'credentials',
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.optional(),
    }),
    password: string().when('grant_type', {
      is: 'credentials',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional(),
    }),
    refresh_token: string().when('grant_type', {
      is: 'refresh_token',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional(),
    }),
  })
  .test(
    'is_username_or_email_exists',
    'Username or email must be provided',
    ({ email, username, grant_type }) => {
      if (grant_type === 'credentials') {
        return Boolean(email) || Boolean(username);
      }
      return true;
    },
  );
