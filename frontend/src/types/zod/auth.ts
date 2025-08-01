import * as z from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Email is invalid' }),
});

export const RegisterFormSchema = z.object({
  email: z.string().email({ message: 'Email is invalid' }),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
