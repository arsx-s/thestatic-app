import { z } from "zod";

export const StaticIdSchema = z.string().regex(/^ST-\d{5}$/, {
  message: "Static ID must be in the format ST-00001",
});

export const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9._]+$/, {
    message: "Username may only contain lowercase letters, numbers, dots and underscores",
  });

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Static ID or username is required"),
  password: PasswordSchema,
});

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Static ID or username is required"),
});

export const CreatePostSchema = z.object({
  caption: z.string().max(2200).optional(),
  audience: z.enum(["followers", "in_sync", "all_members", "custom"]),
  allowComments: z.boolean().default(true),
  encryptedContent: z.string(),
  encryptedMediaReference: z.string().optional().nullable(),
});

export const CreateListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  priceBdt: z.number().positive().max(10000000),
  category: z.string().min(1),
  condition: z.enum(["new", "like_new", "used"]),
  encryptedListing: z.string(),
});

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  venue: z.string().max(200),
  capacity: z.number().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
});
