export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message?: string | string[];
  missing?: string[];
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: string | string[];
  missing?: string[];

  constructor(body: Partial<ApiErrorBody> & { status: number }) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(', ')
          : body.error || 'Error inesperado';
    super(message);
    this.name = 'ApiError';
    this.status = body.status;
    this.code = body.error || 'unknown_error';
    this.details = body.message;
    this.missing = body.missing;
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  lastName?: string;
  picture?: string;
  provider: string;
  emailVerified?: boolean;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type CreateAccountResponse = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
};

export type SupportedCountry = {
  code: string;
  phoneCode: string;
};

export type SettingValue = Record<string, unknown> | unknown[];

export type Setting = {
  id: string;
  code: string;
  value: SettingValue;
  createdAt?: string;
  updatedAt?: string;
};

export const SETTING_CODES = {
  SUPPORTED_COUNTRIES: 'supported-countries',
  PRODUCT_TAXONOMY: 'product-taxonomy',
} as const;

export type ProductPrice = {
  list: number;
  offer?: number;
  activeFrom?: string;
  activeUntil?: string;
};

export type ProductAttributes = Record<string, unknown>;
export type ProductStatus = 'draft' | 'active' | 'inactive';

export type ProductMediaUrls = {
  original: string;
  thumbnail: string;
  card: string;
  detail: string;
};

export type ProductMedia = {
  id: string;
  /** Compat si el API manda _id en vez de id. */
  _id?: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  urls: ProductMediaUrls;
};

export type Product = {
  id: string;
  storeId: string;
  userId: string;
  category: string;
  title: string;
  description: string;
  price: ProductPrice;
  attributes: ProductAttributes;
  medias: ProductMedia[];
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CatalogQuery = {
  status?: ProductStatus;
  category?: string;
  page?: number;
  limit?: number;
};

export type SearchKind = 'product' | 'bundle';
export type SearchHandoffType = 'delivery' | 'customer_pickup';

export type SearchDestination = {
  country: string;
  city?: string;
};

export type SearchCategoryFilter = {
  name: string;
  types?: string[];
  accessories?: string[];
};

export type SearchRentalPeriod = {
  start: string;
  end: string;
};

export type SearchHandoff = {
  type: SearchHandoffType;
  address?: string;
  /** Minutos desde 00:00. */
  time?: number;
};

export type SearchBody = {
  destination?: SearchDestination;
  categories?: SearchCategoryFilter[];
  rentalPeriod?: SearchRentalPeriod;
  acquisition?: SearchHandoff;
  devolution?: SearchHandoff;
};

export type SearchQuery = {
  offset?: number;
  limit?: number;
};

export type SearchFulfillment = {
  available: boolean;
  available24h?: boolean;
  timeRanges: string[];
  days?: DeliveryDaysMap;
};

export type SearchStoreSummary = {
  id: string;
  name: string;
  country: string;
  address: StoreAddress;
  delivery?: SearchFulfillment;
  customerPickup?: SearchFulfillment;
};

export type SearchBundleProduct = {
  id: string;
  title: string;
  category: string;
};

export type SearchItem = {
  kind: SearchKind;
  id: string;
  title: string;
  description: string;
  /** Producto: un id. Combo: `['bundle', ...categorías]`. */
  category: string | string[];
  price: ProductPrice;
  attributes?: ProductAttributes;
  products?: SearchBundleProduct[];
  medias: ProductMedia[];
  store: SearchStoreSummary;
};

export type SearchNextPage = {
  offset: number;
  limit: number;
};

export type SearchResponse = {
  data: SearchItem[];
  total: number;
  nextPage: SearchNextPage | null;
};

export type FunnelLastSteep =
  | 'profile'
  | 'cell-verification'
  | 'avatar'
  | 'delivery'
  | 'delivery-pricing'
  | 'customer-pickup'
  | 'bank-account'
  | 'confirmation';

export type StoreState = 'missing-info' | 'pending-review' | 'active';

export type StoreFunnelMeta = {
  state: StoreState;
  lastSteep: FunnelLastSteep;
  cellValidated: boolean;
  confirmedAt?: string;
};

export type StoreAddress = {
  addressLine1: string;
  addressLine2?: string;
  placeId: string;
};

export type DeliveryDayKey =
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type DeliveryDaysMap = Partial<Record<DeliveryDayKey, number[]>>;

export type ServiceSchedule = {
  available: boolean;
  available24h?: boolean;
  timeRanges: string[];
  days?: DeliveryDaysMap;
};

export type AttentionSchedule = ServiceSchedule & {
  basePrice?: number;
  pricePerKm?: number;
  maxDeliveryDistance?: number;
};

export type StripeConnectStatus = {
  accountId?: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export type StoreBankAccount = {
  accountType: 'IBAN' | 'NUMBER';
  holderName: string;
  entityType: 'individual' | 'company';
  country: string;
  currency: string;
  bankName: string;
  last4?: string;
  swiftCode?: string;
  address?: string;
};

export type StoreAvatar = {
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  urls: ProductMediaUrls;
};

export type Store = {
  id: string;
  userId: string;
  name: string;
  avatar?: StoreAvatar;
  country: string;
  address: StoreAddress;
  cellPhone: string;
  delivery?: AttentionSchedule;
  customerPickup?: ServiceSchedule;
  stripeConnect?: StripeConnectStatus;
  bankAccount?: StoreBankAccount;
  meta: StoreFunnelMeta;
  devCode?: string;
};

export type Bundle = {
  id: string;
  storeId: string;
  userId: string;
  products: Product[];
  title: string;
  description: string;
  price: ProductPrice;
  category: string[];
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'transferred'
  | 'refunded';

export type ProviderMovement = {
  id: string;
  storeId: string;
  storeName: string;
  orderId?: string;
  amount: number;
  providerAmount: number;
  platformFeeAmount: number;
  currency: string;
  status: PaymentStatus;
  transferred: boolean;
  stripeTransferId?: string;
  stripePaymentIntentId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProviderMovementsSummary = {
  totalMovements: number;
  currency: string;
  collected: number;
  earningsTransferred: number;
  earningsPending: number;
  platformFees: number;
};

export type ProviderMovementsResponse = {
  summary: ProviderMovementsSummary;
  movements: ProviderMovement[];
};

export type CreateProductInput = {
  category: string;
  title: string;
  description: string;
  price: ProductPrice;
  attributes?: ProductAttributes;
};

export type CreateBundleInput = {
  products: string[];
  title: string;
  description: string;
  price: ProductPrice;
};

export type UpdateBundleInput = {
  products?: string[];
  title?: string;
  description?: string;
  price?: {
    list?: number;
    offer?: number | null;
    activeFrom?: string;
    activeUntil?: string;
  };
  status?: ProductStatus;
};

export type CreateStoreProfileInput = {
  name: string;
  country: string;
  address: StoreAddress;
  cellPhone: string;
};

export type UpdateStoreProfileInput = {
  name?: string;
  country?: string;
  cellPhone?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    placeId?: string;
  };
};

export type UpdateScheduleInput = {
  available: boolean;
  available24h?: boolean;
  timeRanges?: string[];
  days?: DeliveryDaysMap;
};

export type UpdateDeliveryPricingInput = {
  basePrice: number;
  priceKm: number;
  maxDeliveryDistance: number;
};

export type UpdateBankAccountInput = {
  accountType: 'IBAN' | 'NUMBER';
  firstName: string;
  lastName: string;
  country: string;
  currency?: string;
  iban?: string;
  accountNumber?: string;
  bankName: string;
  swiftCode?: string;
  routingNumber?: string;
  address?: string;
  entityType?: 'individual' | 'company';
};

export type AccountLinkResponse = {
  url: string;
  expiresAt: number;
  stripeConnect: StripeConnectStatus;
};
