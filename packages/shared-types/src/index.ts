export type StaticId = string & { __brand: "StaticId" };
export type Username = string & { __brand: "Username" };
export type MemberId = string & { __brand: "MemberId" };
export type DeviceId = string & { __brand: "DeviceId" };
export type PostId = string & { __brand: "PostId" };
export type StoryId = string & { __brand: "StoryId" };
export type ConversationId = string & { __brand: "ConversationId" };
export type MessageId = string & { __brand: "MessageId" };
export type ListingId = string & { __brand: "ListingId" };
export type ProductId = string & { __brand: "ProductId" };
export type OrderId = string & { __brand: "OrderId" };
export type EventId = string & { __brand: "EventId" };
export type ReportId = string & { __brand: "ReportId" };

export type Currency = "BDT";

export type MembershipStatus =
  | "pending"
  | "approved"
  | "invited"
  | "active"
  | "suspended"
  | "removed";

export type PostAudience = "followers" | "in_sync" | "all_members" | "custom";

export type ListingStatus = "active" | "sold" | "removed";

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type EventStatus = "draft" | "published" | "cancelled" | "past";

export type ReportStatus = "open" | "reviewed" | "resolved" | "dismissed";

export type InteractionType = "like" | "repost" | "save";

export interface Member {
  id: MemberId;
  staticId: StaticId;
  username: Username;
  status: MembershipStatus;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberProfile {
  memberId: MemberId;
  displayName?: string | null;
  bio?: string | null;
  interests: string[];
  location?: string | null;
  musicStatus?: string | null;
  profilePhotoUrl?: string | null;
  visibility: "all_members" | "connections_only";
  updatedAt: string;
}

export interface Device {
  id: DeviceId;
  memberId: MemberId;
  name?: string | null;
  platform: "ios" | "android" | "web";
  status: "active" | "revoked";
  lastSeenAt?: string | null;
  createdAt: string;
}

export interface Follow {
  followerId: MemberId;
  followingId: MemberId;
  createdAt: string;
}

export interface Post {
  id: PostId;
  authorId: MemberId;
  audience: PostAudience;
  encryptionVersion: number;
  encryptedContent: string;
  encryptedMediaReference?: string | null;
  audienceReference?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Story {
  id: StoryId;
  authorId: MemberId;
  audience: PostAudience;
  encryptionVersion: number;
  encryptedContent: string;
  encryptedMediaReference?: string | null;
  expiresAt: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface Conversation {
  id: ConversationId;
  type: "direct" | "request";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: MessageId;
  conversationId: ConversationId;
  senderDeviceId: DeviceId;
  ciphertext: string;
  protocolVersion: number;
  createdAt: string;
  deletedAt?: string | null;
}

export interface Listing {
  id: ListingId;
  sellerId: MemberId;
  category: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: ProductId;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: OrderId;
  memberId: MemberId;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: EventId;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: ReportId;
  reporterId: MemberId;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  memberId: MemberId;
  pushEnabled: boolean;
  messageNotifications: boolean;
  followNotifications: boolean;
}

export interface PushToken {
  id: string;
  memberId: MemberId;
  token: string;
  platform: "ios" | "android";
  createdAt: string;
}
