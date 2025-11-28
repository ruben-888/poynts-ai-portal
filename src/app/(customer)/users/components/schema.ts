import { z } from "zod";

// Define the email address schema
const emailAddressSchema = z.object({
  id: z.string(),
  emailAddress: z.string().email(),
  verification: z
    .object({
      status: z.string(),
      strategy: z.string(),
      externalVerificationRedirectURL: z.string().nullable(),
      attempts: z.number().nullable(),
      expireAt: z.number().nullable(),
      nonce: z.string().nullable(),
      message: z.string().nullable(),
    })
    .nullable()
    .optional(),
  linkedTo: z.array(z.any()).optional(),
});

// Define the user schema
export const userSchema = z.object({
  id: z.string(),
  banned: z.boolean(),
  locked: z.boolean(),
  createdAt: z.number(),
  imageUrl: z.string(),
  primaryEmailAddressId: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  lastSignInAt: z.number().nullable(),
  publicMetadata: z.record(z.any()).transform((data) => ({
    ...data,
    role: data.role || "user", // Default role if not set
  })),
  emailAddresses: z.array(emailAddressSchema),
  // Optional fields
  passwordEnabled: z.boolean().optional(),
  totpEnabled: z.boolean().optional(),
  backupCodeEnabled: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  updatedAt: z.number().optional(),
  hasImage: z.boolean().optional(),
  primaryPhoneNumberId: z.string().nullable().optional(),
  primaryWeb3WalletId: z.string().nullable().optional(),
  externalId: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  privateMetadata: z.record(z.any()).optional(),
  unsafeMetadata: z.record(z.any()).optional(),
  phoneNumbers: z.array(z.any()).optional(),
  web3Wallets: z.array(z.any()).optional(),
  externalAccounts: z.array(z.any()).optional(),
  samlAccounts: z.array(z.any()).optional(),
  lastActiveAt: z.number().nullable().optional(),
  createOrganizationEnabled: z.boolean().optional(),
  createOrganizationsLimit: z.number().nullable().optional(),
  deleteSelfEnabled: z.boolean().optional(),
  legalAcceptedAt: z.string().nullable().optional(),
});

// Define the API response schema
export const usersSchema = z.object({
  data: z.array(userSchema),
});

// Export the User type
export type User = z.infer<typeof userSchema>;

// Define the organization membership schema
export const organizationMembershipSchema = z.object({
  id: z.string(),
  role: z.string(),
  publicMetadata: z.record(z.any()),
  createdAt: z.number(),
  updatedAt: z.number(),
  organizationId: z.string().optional(),
  organizationName: z.string().nullable().optional(),
  user: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    imageUrl: z.string(),
    emailAddresses: z.array(
      z.object({
        id: z.string(),
        emailAddress: z.string(),
        verification: z
          .object({
            status: z.string(),
            strategy: z.string(),
          })
          .nullable(),
      })
    ),
    primaryEmailAddressId: z.string().nullable(),
    lastSignInAt: z.number().nullable(),
  }),
});

// Define the API response schema
export const organizationMembershipsSchema = z.object({
  data: z.array(organizationMembershipSchema),
});

// Export the OrganizationMembership type
export type OrganizationMembership = z.infer<
  typeof organizationMembershipSchema
>;
