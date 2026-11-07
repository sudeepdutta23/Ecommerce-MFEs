import { ApiError } from './api-client';
import { API_BASE_URL, http } from './http-client';

/**
 * Typed client for the Java backend (JAVA-Backend, /api/v1), one function per endpoint.
 * The contract is the backend's OpenAPI document (/v3/api-docs).
 *
 * Success: `{ success, message, data, timestamp, requestId }`. This file unwraps `data`.
 * Failure: RFC 9457 Problem Details; see `apiErrorMessage` and `apiErrorCode`.
 * Money is a decimal number in the platform currency, timestamps are ISO 8601 strings.
 */

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  requestId: string;
}

export interface Page<T> {
  content: T[];
  /** Zero-based. */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  size?: number;
}

async function get<T>(url: string, params?: object): Promise<T> {
  const { data } = await http.get<Envelope<T>>(url, { params });
  return data.data;
}

async function post<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  const { data } = await http.post<Envelope<T>>(url, body, { headers });
  return data?.data;
}

async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.put<Envelope<T>>(url, body);
  return data?.data;
}

async function del<T = void>(url: string): Promise<T> {
  const { data } = await http.delete<Envelope<T>>(url);
  return data?.data;
}

// ------------------------------------------------------------------ errors

interface ProblemDetails {
  detail?: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

function problemOf(error: unknown): ProblemDetails | null {
  return error instanceof ApiError ? (error.body as ProblemDetails | null) : null;
}

/** The backend's stable error code (`ORDER_TOTAL_CHANGED`, ...). Branch on this, never on the text. */
export function apiErrorCode(error: unknown): string | undefined {
  return problemOf(error)?.code;
}

/** Field-level validation messages, by field name. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  return Object.fromEntries((problemOf(error)?.errors ?? []).map((e) => [e.field, e.message]));
}

/** A message fit to show the user, from the Problem Details body. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError && error.status === 0) {
    return 'Cannot reach the server. Check that the backend is running.';
  }
  const problem = problemOf(error);
  const fields = problem?.errors?.map((e) => `${e.field}: ${e.message}`).join('; ');
  return fields || problem?.detail || fallback;
}

/** Images and other server paths are relative to the API's origin, which may not be this page's. */
export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}${path}`;
}

// ------------------------------------------------------------------ auth

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  /** Seconds. The refresh token is in an HttpOnly cookie, never in JavaScript. */
  expiresIn: number;
}

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'ERASED';

export interface Me {
  id: string;
  email: string;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: string[];
  permissions: string[];
}

export interface SessionInfo {
  sessionId: string;
  startedAt: string;
  lastActiveAt: string;
  expiresAt: string;
  ip: string | null;
  userAgent: string | null;
  current: boolean;
}

export const authApi = {
  /** Returns no tokens: the account stays pending until the emailed link is used. */
  register: (email: string, password: string) => post<void>('/auth/register', { email, password }),
  login: (email: string, password: string) => post<TokenResponse>('/auth/login', { email, password }),
  logout: () => post<void>('/auth/logout'),
  logoutAll: () => post<void>('/auth/logout-all'),
  verifyEmail: (token: string) => post<void>('/auth/email/verify', { token }),
  resendVerification: (email: string) => post<void>('/auth/email/resend-verification', { email }),
  forgotPassword: (email: string) => post<void>('/auth/password/forgot', { email }),
  resetPassword: (token: string, newPassword: string) => post<void>('/auth/password/reset', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<TokenResponse>('/auth/password/change', { currentPassword, newPassword }),
  me: () => get<Me>('/auth/me'),
  exportData: () => get<Record<string, unknown>>('/auth/me/export'),
  deactivate: (password: string) => post<void>('/auth/me/deactivate', { password }),
  erase: (password: string) => post<void>('/auth/me/erase', { password }),
  sessions: () => get<SessionInfo[]>('/auth/me/sessions'),
  revokeSession: (sessionId: string) => del(`/auth/me/sessions/${sessionId}`),
};

// ------------------------------------------------------------------ profile

export interface Profile {
  givenName: string | null;
  familyName: string | null;
  phoneNumber: string | null;
  preferredLocale: string | null;
  timeZone: string | null;
  version: number | null;
  updatedAt: string | null;
}

export interface AddressInput {
  label?: string | null;
  recipientName: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string | null;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
  version?: number;
}

export interface Address extends AddressInput {
  id: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const profileApi = {
  get: () => get<Profile>('/profile'),
  update: (profile: Partial<Profile>) => put<Profile>('/profile', profile),
  addresses: () => get<Address[]>('/profile/addresses'),
  address: (id: string) => get<Address>(`/profile/addresses/${id}`),
  createAddress: (address: AddressInput) => post<Address>('/profile/addresses', address),
  updateAddress: (id: string, address: AddressInput) => put<Address>(`/profile/addresses/${id}`, address),
  deleteAddress: (id: string) => del(`/profile/addresses/${id}`),
};

// ------------------------------------------------------------------ storefront

export interface Category {
  id: string;
  slug: string;
  name: string;
  version: number;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  inStock: boolean;
  category: { slug: string; name: string } | null;
  seller: { slug: string; name: string };
  /** Relative paths: use assetUrl. */
  images: string[];
}

export type StorefrontSort = 'RELEVANCE' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC';

export interface StorefrontQuery extends PageParams {
  q?: string;
  category?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: StorefrontSort;
}

export const catalogApi = {
  products: (query: StorefrontQuery = {}) => get<Page<StorefrontProduct>>('/catalog/products', query),
  product: (id: string) => get<StorefrontProduct>(`/catalog/products/${id}`),
  categories: () => get<Category[]>('/catalog/categories'),
  /**
   * For whoever just changed them. The public list is cached by the browser for 5 minutes, which is
   * right for visitors, but an administrator must see their own change at once.
   */
  categoriesFresh: () => get<Category[]>('/catalog/categories', { fresh: Date.now() }),
};

// ------------------------------------------------------------------ cart, checkout, orders

export type CartProblem = 'NOT_ON_SALE' | 'NOT_ENOUGH_STOCK';

export interface ServerCartLine {
  productId: string;
  name: string;
  seller: { slug: string; name: string };
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  problem: CartProblem | null;
}

export interface ServerCart {
  lines: ServerCartLine[];
  total: number;
  currency: string;
  itemCount: number;
  readyForCheckout: boolean;
}

export type BackendOrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderSummary {
  id: string;
  checkoutId: string | null;
  sellerName: string;
  status: BackendOrderStatus;
  total: number;
  currency: string;
  createdAt: string;
}

export interface AddressSnapshot {
  recipientName: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string | null;
}

export interface OrderDetail extends OrderSummary {
  organizationId: string;
  lines: Array<{
    productId: string;
    sku: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  shippingAddress: AddressSnapshot | null;
  billingAddress: AddressSnapshot | null;
  trackingNumber: string | null;
  cancelReason: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  version: number;
}

export interface Checkout {
  id: string;
  total: number;
  currency: string;
  createdAt: string;
  /** One order per seller, paid for together. */
  orders: OrderDetail[];
}

export const cartApi = {
  get: () => get<ServerCart>('/cart'),
  setQuantity: (productId: string, quantity: number) => put<ServerCart>(`/cart/items/${productId}`, { quantity }),
  remove: (productId: string) => del<ServerCart>(`/cart/items/${productId}`),
  clear: () => del('/cart'),
};

export const checkoutApi = {
  /** `idempotencyKey`: new for each purchase, the same for a retry of it, so a retry cannot buy twice. */
  create: (
    input: { shippingAddressId: string; billingAddressId?: string; expectedTotal: number },
    idempotencyKey: string,
  ) => post<Checkout>('/checkout', input, { 'Idempotency-Key': idempotencyKey }),
  get: (id: string) => get<Checkout>(`/checkouts/${id}`),
  pay: (id: string, paymentToken: string) => post<Checkout>(`/checkouts/${id}/pay`, { paymentToken }),
};

export const ordersApi = {
  list: (params: PageParams = {}) => get<Page<OrderSummary>>('/orders', params),
  get: (id: string) => get<OrderDetail>(`/orders/${id}`),
  cancel: (id: string, reason?: string) => post<OrderDetail>(`/orders/${id}/cancel`, { reason }),
};

// ------------------------------------------------------------------ notifications

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  /** A path inside the app. */
  link: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  orderUpdatesEmail: boolean;
  sellerOrdersEmail: boolean;
}

export const notificationsApi = {
  list: (params: PageParams & { unreadOnly?: boolean } = {}) => get<Page<AppNotification>>('/notifications', params),
  unreadCount: () => get<Record<string, number>>('/notifications/unread-count'),
  markRead: (id: string) => post<void>(`/notifications/${id}/read`),
  markAllRead: () => post<Record<string, number>>('/notifications/read-all'),
  preferences: () => get<NotificationPreferences>('/notifications/preferences'),
  updatePreferences: (preferences: NotificationPreferences) =>
    put<NotificationPreferences>('/notifications/preferences', preferences),
};

// ------------------------------------------------------------------ selling

export type OrganizationStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type OrgRole = 'OWNER' | 'MANAGER' | 'STAFF';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface MyOrganization {
  id: string;
  slug: string;
  name: string;
  status: OrganizationStatus;
  myRole: OrgRole;
  joinedAt: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  status: OrganizationStatus;
  myRole: OrgRole;
  myPermissions: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  userId: string;
  email: string;
  role: OrgRole;
  joinedAt: string;
  addedBy: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: OrgRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface SellerProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  status: ProductStatus;
  onSale: boolean;
  categoryId: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  categoryId?: string | null;
  version?: number;
}

export interface ProductImage {
  id: string;
  contentType: string;
  width: number;
  height: number;
  sizeBytes: number;
  url: string;
}

export const organizationsApi = {
  create: (slug: string, name: string) => post<Organization>('/organizations', { slug, name }),
  mine: (params: PageParams = {}) => get<Page<MyOrganization>>('/organizations', params),
  get: (id: string) => get<Organization>(`/organizations/${id}`),
  update: (id: string, name: string, version: number) => put<Organization>(`/organizations/${id}`, { name, version }),
  close: (id: string) => post<Organization>(`/organizations/${id}/close`),
  leave: (id: string) => post<void>(`/organizations/${id}/leave`),
  members: (id: string, params: PageParams = {}) => get<Page<Member>>(`/organizations/${id}/members`, params),
  changeRole: (id: string, userId: string, role: OrgRole) =>
    put<Member>(`/organizations/${id}/members/${userId}`, { role }),
  removeMember: (id: string, userId: string) => del(`/organizations/${id}/members/${userId}`),
  invitations: (id: string, params: PageParams = {}) =>
    get<Page<Invitation>>(`/organizations/${id}/invitations`, params),
  invite: (id: string, email: string, role: OrgRole) =>
    post<Invitation>(`/organizations/${id}/invitations`, { email, role }),
  revokeInvitation: (id: string, invitationId: string) => del(`/organizations/${id}/invitations/${invitationId}`),
  acceptInvitation: (token: string) => post<Organization>('/organizations/invitations/accept', { token }),
};

export const sellerProductsApi = {
  list: (orgId: string, params: PageParams & { status?: ProductStatus } = {}) =>
    get<Page<SellerProduct>>(`/organizations/${orgId}/products`, params),
  get: (orgId: string, id: string) => get<SellerProduct>(`/organizations/${orgId}/products/${id}`),
  create: (orgId: string, input: ProductInput) => post<SellerProduct>(`/organizations/${orgId}/products`, input),
  update: (orgId: string, id: string, input: ProductInput) =>
    put<SellerProduct>(`/organizations/${orgId}/products/${id}`, input),
  publish: (orgId: string, id: string) => post<SellerProduct>(`/organizations/${orgId}/products/${id}/publish`),
  archive: (orgId: string, id: string) => post<SellerProduct>(`/organizations/${orgId}/products/${id}/archive`),
  adjustStock: (orgId: string, id: string, delta: number) =>
    post<SellerProduct>(`/organizations/${orgId}/products/${id}/stock`, { delta }),
  images: (orgId: string, id: string) => get<ProductImage[]>(`/organizations/${orgId}/products/${id}/images`),
  /** The seller's own view, also for a product not on sale. Needs the token, so an <img> cannot load it directly. */
  imageContent: async (orgId: string, id: string, imageId: string) => {
    const { data } = await http.get<Blob>(`/organizations/${orgId}/products/${id}/images/${imageId}/content`, {
      responseType: 'blob',
    });
    return data;
  },
  uploadImage: async (orgId: string, id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await http.post<Envelope<ProductImage>>(`/organizations/${orgId}/products/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  deleteImage: (orgId: string, id: string, imageId: string) =>
    del(`/organizations/${orgId}/products/${id}/images/${imageId}`),
};

export const sellerOrdersApi = {
  list: (orgId: string, params: PageParams & { status?: BackendOrderStatus } = {}) =>
    get<Page<OrderSummary>>(`/organizations/${orgId}/orders`, params),
  get: (orgId: string, id: string) => get<OrderDetail>(`/organizations/${orgId}/orders/${id}`),
  ship: (orgId: string, id: string, trackingNumber?: string) =>
    post<OrderDetail>(`/organizations/${orgId}/orders/${id}/ship`, { trackingNumber }),
  deliver: (orgId: string, id: string) => post<OrderDetail>(`/organizations/${orgId}/orders/${id}/deliver`),
  cancel: (orgId: string, id: string, reason?: string) =>
    post<OrderDetail>(`/organizations/${orgId}/orders/${id}/cancel`, { reason }),
};

// ------------------------------------------------------------------ administration

export interface AdminUserSummary {
  id: string;
  email: string;
  status: UserStatus;
  emailVerified: boolean;
  locked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  status: UserStatus;
  statusReason: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrganizationSummary {
  id: string;
  slug: string;
  name: string;
  status: OrganizationStatus;
  createdBy: string;
  createdAt: string;
}

export interface AdminOrganizationDetail extends AdminOrganizationSummary {
  statusReason: string | null;
  statusChangedAt: string | null;
  members: number;
  owners: number;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actorId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  organizationId: string | null;
  detail: string | null;
  requestId: string | null;
  clientIp: string | null;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  systemRole: boolean;
  permissions: string[];
  version: number;
}

export interface Permission {
  code: string;
  description: string;
}

export interface UserRole {
  roleId: string;
  code: string;
  name: string;
  systemRole: boolean;
  assignedAt: string;
  assignedBy: string | null;
}

export const adminApi = {
  users: (params: PageParams & { status?: UserStatus; email?: string } = {}) =>
    get<Page<AdminUserSummary>>('/admin/users', params),
  user: (id: string) => get<AdminUserDetail>(`/admin/users/${id}`),
  suspendUser: (id: string, reason: string) => post<AdminUserDetail>(`/admin/users/${id}/suspend`, { reason }),
  reactivateUser: (id: string) => post<AdminUserDetail>(`/admin/users/${id}/reactivate`),
  unlockUser: (id: string) => post<AdminUserDetail>(`/admin/users/${id}/unlock`),
  signOutUser: (id: string) => post<AdminUserDetail>(`/admin/users/${id}/sign-out`),
  eraseUser: (id: string) => post<AdminUserDetail>(`/admin/users/${id}/erase`),
  userProfile: (id: string) => get<Profile>(`/admin/users/${id}/profile`),
  userRoles: (id: string) => get<UserRole[]>(`/admin/users/${id}/roles`),
  grantRole: (id: string, roleId: string) => put<void>(`/admin/users/${id}/roles/${roleId}`),
  revokeRole: (id: string, roleId: string) => del(`/admin/users/${id}/roles/${roleId}`),

  organizations: (params: PageParams & { status?: OrganizationStatus } = {}) =>
    get<Page<AdminOrganizationSummary>>('/admin/organizations', params),
  organization: (id: string) => get<AdminOrganizationDetail>(`/admin/organizations/${id}`),
  approveOrganization: (id: string) => post<AdminOrganizationDetail>(`/admin/organizations/${id}/approve`),
  suspendOrganization: (id: string, reason: string) =>
    post<AdminOrganizationDetail>(`/admin/organizations/${id}/suspend`, { reason }),
  reactivateOrganization: (id: string) => post<AdminOrganizationDetail>(`/admin/organizations/${id}/reactivate`),
  closeOrganization: (id: string) => post<AdminOrganizationDetail>(`/admin/organizations/${id}/close`),

  createCategory: (slug: string, name: string) => post<Category>('/admin/categories', { slug, name }),
  updateCategory: (id: string, name: string, version: number) =>
    put<Category>(`/admin/categories/${id}`, { name, version }),
  deleteCategory: (id: string) => del(`/admin/categories/${id}`),

  roles: () => get<Role[]>('/admin/roles'),
  role: (id: string) => get<Role>(`/admin/roles/${id}`),
  createRole: (input: { code: string; name: string; description?: string; permissions: string[] }) =>
    post<Role>('/admin/roles', input),
  updateRole: (id: string, input: { name: string; description?: string; permissions: string[]; version: number }) =>
    put<Role>(`/admin/roles/${id}`, input),
  deleteRole: (id: string) => del(`/admin/roles/${id}`),
  permissions: () => get<Permission[]>('/admin/permissions'),

  /** Keyset paging: pass the previous page's `nextBefore`. Append-only: there is no way to clear it. */
  audit: (params: { actorId?: string; targetId?: string; organizationId?: string; action?: string; before?: string; size?: number } = {}) =>
    get<{ items: AuditEvent[]; nextBefore?: string | null }>('/admin/audit', params),
};
