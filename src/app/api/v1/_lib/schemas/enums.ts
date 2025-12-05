/**
 * Shared enums for API response types
 * These match the enums defined in the Loopback backend
 */

export enum StatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

export enum CampaignTypeEnum {
  ACQUISITION = "acquisition",
  ENGAGEMENT = "engagement",
  ADHERENCE = "adherence",
  ASPIRATION = "aspiration",
}

export enum CampaignStatusEnum {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export enum StepActionTypeEnum {
  MANUAL_VERIFY = "manual_verify",
  FORM_SUBMIT = "form_submit",
  LINK_CLICK = "link_click",
  VIDEO_WATCH = "video_watch",
  QUIZ_COMPLETE = "quiz_complete",
  CHECKIN = "checkin",
  PURCHASE = "purchase",
  REFERRAL = "referral",
  SOCIAL_SHARE = "social_share",
  FILE_UPLOAD = "file_upload",
  CUSTOM_EVENT = "custom_event",
}

export enum ProgressStatusEnum {
  ENROLLED = "enrolled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  EXPIRED = "expired",
  WITHDRAWN = "withdrawn",
}

export enum TransactionTypeEnum {
  EARN_CAMPAIGN = "earn_campaign",
  EARN_REFERRAL = "earn_referral",
  EARN_BONUS = "earn_bonus",
  EARN_ADJUSTMENT = "earn_adjustment",
  EARN_TIER_BONUS = "earn_tier_bonus",
  REDEEM = "redeem",
  DEBIT_ADJUSTMENT = "debit_adjustment",
}

export enum ProgramStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export enum TierAssignmentTypeEnum {
  AUTOMATIC = "automatic",
  MANUAL = "manual",
  PROMOTION = "promotion",
}

export enum TierQualificationTypeEnum {
  AUTOMATIC = "automatic",
  MANUAL_ONLY = "manual_only",
  HYBRID = "hybrid",
}

export enum TierChangeTypeEnum {
  INITIAL = "initial",
  UPGRADE = "upgrade",
  DOWNGRADE = "downgrade",
  MANUAL = "manual",
  EXPIRED = "expired",
}

export enum OrderStatusEnum {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum OrderModeEnum {
  STANDARD = "standard",
  EXPRESS = "express",
}

export enum DeliveryStatusEnum {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export enum DeliveryMethodEnum {
  EMAIL = "email",
  SMS = "sms",
  BOTH = "both",
}

export enum RewardTypeEnum {
  GIFT_CARD = "gift_card",
  OFFER = "offer",
}

export enum InventoryTypeEnum {
  UNLIMITED = "unlimited",
  LIMITED = "limited",
}

export enum CatalogTypeEnum {
  MASTER = "master",
  CUSTOM = "custom",
  TEMPLATE = "template",
}

export enum CatalogStatusEnum {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum UserRoleEnum {
  ADMIN = "admin",
  STAFF = "staff",
  VIEWER = "viewer",
}

export enum ApiKeyStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  REVOKED = "revoked",
}
