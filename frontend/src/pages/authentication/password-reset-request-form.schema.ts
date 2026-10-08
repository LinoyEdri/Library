import { z } from 'zod';
import {
  forgotPasswordSchema,
  PasswordResetChannel,
  type ForgotPasswordInput,
} from '@library/shared';

// The form keeps both fields (only the chosen channel's one is shown and checked); the output is
// exactly the API body, validated by the shared schema so the rules match the server
export const passwordResetRequestFormSchema = z
  .object({
    channel: z.enum(PasswordResetChannel),
    email: z.string(),
    phoneNumber: z.string(),
  })
  .transform((values, context): ForgotPasswordInput => {
    const requestBody =
      values.channel === PasswordResetChannel.EMAIL
        ? { channel: values.channel, email: values.email }
        : { channel: values.channel, phoneNumber: values.phoneNumber };

    const parsedRequest = forgotPasswordSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      for (const issue of parsedRequest.error.issues) {
        context.addIssue({ code: 'custom', message: issue.message, path: issue.path });
      }

      return z.NEVER;
    }

    return parsedRequest.data;
  });

export type PasswordResetRequestFormInput = z.input<typeof passwordResetRequestFormSchema>;
