export interface ClerkEmailVerification {
  status: string;
  strategy: string;
  externalVerificationRedirectURL?: string | null;
  attempts?: number | null;
  expireAt?: number | null;
  nonce?: string | null;
  message?: string | null;
}

export interface ClerkEmailAddress {
  id: string;
  emailAddress: string;
  verification?: ClerkEmailVerification | null;
  linkedTo?: any[];
}

export interface ClerkUser {
  id: string;
  banned: boolean;
  locked: boolean;
  createdAt: number;
  imageUrl: string;
  primaryEmailAddressId: string | null;
  firstName: string | null;
  lastName: string | null;
  lastSignInAt: number | null;
  publicMetadata: Record<string, any>;
  emailAddresses: ClerkEmailAddress[];
  // Optional fields that might be needed later
  passwordEnabled?: boolean;
  totpEnabled?: boolean;
  backupCodeEnabled?: boolean;
  twoFactorEnabled?: boolean;
  updatedAt?: number;
  hasImage?: boolean;
  primaryPhoneNumberId?: string | null;
  primaryWeb3WalletId?: string | null;
  externalId?: string | null;
  username?: string | null;
  privateMetadata?: Record<string, any>;
  unsafeMetadata?: Record<string, any>;
  phoneNumbers?: any[];
  web3Wallets?: any[];
  externalAccounts?: any[];
  samlAccounts?: any[];
  lastActiveAt?: number | null;
  createOrganizationEnabled?: boolean;
  createOrganizationsLimit?: number | null;
  deleteSelfEnabled?: boolean;
  legalAcceptedAt?: string | null;
}

export interface ApiResponse<T> {
  data: T;
}
