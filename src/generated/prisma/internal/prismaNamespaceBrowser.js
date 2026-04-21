import * as runtime from "@prisma/client/runtime/index-browser";
export const Decimal = runtime.Decimal;
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    AdditionalCost: 'AdditionalCost',
    AdjustmentType: 'AdjustmentType',
    Branch: 'Branch',
    Brand: 'Brand',
    Category: 'Category',
    ChartOfAccount: 'ChartOfAccount',
    CostType: 'CostType',
    Currency: 'Currency',
    Customer: 'Customer',
    CustomerGroup: 'CustomerGroup',
    DefaultAccount: 'DefaultAccount',
    Group: 'Group',
    Menu: 'Menu',
    Notification: 'Notification',
    NotificationDetail: 'NotificationDetail',
    Viewer: 'Viewer',
    Payment: 'Payment',
    PaymentType: 'PaymentType',
    Plan: 'Plan',
    Product: 'Product',
    ProductDetail: 'ProductDetail',
    ProductVariant: 'ProductVariant',
    Profile: 'Profile',
    Purchase: 'Purchase',
    PurchaseDetail: 'PurchaseDetail',
    PurchaseReturn: 'PurchaseReturn',
    PurchaseReturnDetail: 'PurchaseReturnDetail',
    Receipt: 'Receipt',
    Role: 'Role',
    RolePermission: 'RolePermission',
    Sale: 'Sale',
    SaleDetail: 'SaleDetail',
    SaleReturn: 'SaleReturn',
    SaleReturnDetail: 'SaleReturnDetail',
    StockInventory: 'StockInventory',
    Tax: 'Tax',
    Tenant: 'Tenant',
    Transaction: 'Transaction',
    Unit: 'Unit',
    User: 'User',
    UserTenant: 'UserTenant',
    UserBranch: 'UserBranch',
    VariantAttribute: 'VariantAttribute',
    Vendor: 'Vendor'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const AdditionalCostScalarFieldEnum = {
    id: 'id',
    purchaseId: 'purchaseId',
    costTypeId: 'costTypeId',
    vendorId: 'vendorId',
    amount: 'amount',
    accountId: 'accountId',
    note: 'note',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const RelationLoadStrategy = {
    query: 'query',
    join: 'join'
};
export const AdjustmentTypeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    isDefault: 'isDefault',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const BranchScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    address: 'address',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const BrandScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const CategoryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    color: 'color',
    icon: 'icon',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const ChartOfAccountScalarFieldEnum = {
    id: 'id',
    parentAccountId: 'parentAccountId',
    accountNumber: 'accountNumber',
    accountName: 'accountName',
    accountGroup: 'accountGroup',
    accountType: 'accountType',
    accountLevel: 'accountLevel',
    openingBalance: 'openingBalance',
    balanceDate: 'balanceDate',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const CostTypeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    isDefault: 'isDefault',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const CurrencyScalarFieldEnum = {
    id: 'id',
    code: 'code',
    name: 'name',
    symbol: 'symbol',
    isBase: 'isBase',
    rateToBase: 'rateToBase',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const CustomerScalarFieldEnum = {
    id: 'id',
    name: 'name',
    phone: 'phone',
    email: 'email',
    address: 'address',
    tin: 'tin',
    company: 'company',
    isDefault: 'isDefault',
    customerGroupId: 'customerGroupId',
    receivableAccountId: 'receivableAccountId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const CustomerGroupScalarFieldEnum = {
    id: 'id',
    name: 'name',
    discountPercentage: 'discountPercentage',
    isDefault: 'isDefault',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const DefaultAccountScalarFieldEnum = {
    id: 'id',
    group: 'group',
    name: 'name',
    accountId: 'accountId',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const GroupScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const MenuScalarFieldEnum = {
    id: 'id',
    parentId: 'parentId',
    name: 'name',
    url: 'url',
    icon: 'icon',
    description: 'description',
    level: 'level',
    sortOrder: 'sortOrder',
    isActive: 'isActive',
    portal: 'portal',
    actions: 'actions',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const NotificationScalarFieldEnum = {
    id: 'id',
    ref: 'ref',
    type: 'type',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const NotificationDetailScalarFieldEnum = {
    id: 'id',
    masterId: 'masterId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const ViewerScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    isViewed: 'isViewed',
    viewedAt: 'viewedAt',
    detailId: 'detailId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const PaymentScalarFieldEnum = {
    id: 'id',
    ref: 'ref',
    vendorId: 'vendorId',
    paymentDate: 'paymentDate',
    amount: 'amount',
    paymentTypeId: 'paymentTypeId',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const PaymentTypeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    isDefault: 'isDefault',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const PlanScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    price: 'price',
    branchLimit: 'branchLimit',
    userLimit: 'userLimit',
    productLimit: 'productLimit',
    reportLevel: 'reportLevel',
    supportType: 'supportType',
    isRecommended: 'isRecommended',
    roleId: 'roleId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const ProductScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    categoryId: 'categoryId',
    brandId: 'brandId',
    groupId: 'groupId',
    purchaseUnitId: 'purchaseUnitId',
    saleUnitId: 'saleUnitId',
    rate: 'rate',
    productImage: 'productImage',
    taxId: 'taxId',
    productType: 'productType',
    hasInitialQuantity: 'hasInitialQuantity',
    assetAccountId: 'assetAccountId',
    revenueAccountId: 'revenueAccountId',
    cogsAccountId: 'cogsAccountId',
    saleReturnAccountId: 'saleReturnAccountId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const ProductDetailScalarFieldEnum = {
    id: 'id',
    productId: 'productId',
    sku: 'sku',
    barcode: 'barcode',
    purchasePrice: 'purchasePrice',
    salePrice: 'salePrice',
    quantity: 'quantity',
    reOrder: 'reOrder',
    productImage: 'productImage',
    productAvailability: 'productAvailability',
    expiryDate: 'expiryDate',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const ProductVariantScalarFieldEnum = {
    id: 'id',
    productDetailId: 'productDetailId',
    variantId: 'variantId',
    variantValue: 'variantValue',
    color: 'color'
};
export const ProfileScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    email: 'email',
    address: 'address',
    dateOfBirth: 'dateOfBirth',
    sex: 'sex',
    picture: 'picture',
    bio: 'bio',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const PurchaseScalarFieldEnum = {
    id: 'id',
    branchId: 'branchId',
    ref: 'ref',
    vendorId: 'vendorId',
    subTotal: 'subTotal',
    taxPercentage: 'taxPercentage',
    taxAmount: 'taxAmount',
    discountType: 'discountType',
    discountPercentage: 'discountPercentage',
    discountAmount: 'discountAmount',
    totalDiscountAmount: 'totalDiscountAmount',
    total: 'total',
    paid: 'paid',
    due: 'due',
    paymentTypeId: 'paymentTypeId',
    additionalCostsAmount: 'additionalCostsAmount',
    discountItemsType: 'discountItemsType',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const PurchaseDetailScalarFieldEnum = {
    id: 'id',
    purchaseId: 'purchaseId',
    productId: 'productId',
    productDetailId: 'productDetailId',
    quantity: 'quantity',
    price: 'price',
    discountType: 'discountType',
    discountPercentage: 'discountPercentage',
    discountAmount: 'discountAmount',
    total: 'total',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const PurchaseReturnScalarFieldEnum = {
    id: 'id',
    branchId: 'branchId',
    purchaseId: 'purchaseId',
    returnDate: 'returnDate',
    vendorId: 'vendorId',
    totalAmount: 'totalAmount',
    status: 'status',
    paymentTypeId: 'paymentTypeId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const PurchaseReturnDetailScalarFieldEnum = {
    id: 'id',
    purchaseReturnId: 'purchaseReturnId',
    productId: 'productId',
    productDetailId: 'productDetailId',
    quantity: 'quantity',
    salePrice: 'salePrice',
    total: 'total',
    reason: 'reason',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const ReceiptScalarFieldEnum = {
    id: 'id',
    ref: 'ref',
    customerId: 'customerId',
    receiptDate: 'receiptDate',
    amount: 'amount',
    paymentTypeId: 'paymentTypeId',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const RoleScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    portal: 'portal',
    tenantId: 'tenantId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const RolePermissionScalarFieldEnum = {
    roleId: 'roleId',
    menuId: 'menuId',
    permissions: 'permissions'
};
export const SaleScalarFieldEnum = {
    id: 'id',
    branchId: 'branchId',
    ref: 'ref',
    customerId: 'customerId',
    subTotal: 'subTotal',
    taxPercentage: 'taxPercentage',
    taxAmount: 'taxAmount',
    discountType: 'discountType',
    discountPercentage: 'discountPercentage',
    discountAmount: 'discountAmount',
    totalDiscountAmount: 'totalDiscountAmount',
    total: 'total',
    paid: 'paid',
    due: 'due',
    paymentTypeId: 'paymentTypeId',
    discountItemsType: 'discountItemsType',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const SaleDetailScalarFieldEnum = {
    id: 'id',
    saleId: 'saleId',
    productId: 'productId',
    productDetailId: 'productDetailId',
    quantity: 'quantity',
    price: 'price',
    discountType: 'discountType',
    discountPercentage: 'discountPercentage',
    discountAmount: 'discountAmount',
    total: 'total',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const SaleReturnScalarFieldEnum = {
    id: 'id',
    branchId: 'branchId',
    ref: 'ref',
    saleId: 'saleId',
    customerId: 'customerId',
    subTotal: 'subTotal',
    discount: 'discount',
    total: 'total',
    tax: 'tax',
    taxAmount: 'taxAmount',
    refund: 'refund',
    reduceReceivable: 'reduceReceivable',
    paymentTypeId: 'paymentTypeId',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const SaleReturnDetailScalarFieldEnum = {
    id: 'id',
    saleReturnId: 'saleReturnId',
    productId: 'productId',
    productDetailId: 'productDetailId',
    quantity: 'quantity',
    price: 'price',
    total: 'total',
    reason: 'reason',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const StockInventoryScalarFieldEnum = {
    id: 'id',
    productId: 'productId',
    productDetailId: 'productDetailId',
    branchId: 'branchId',
    quantity: 'quantity',
    cost: 'cost',
    soldQuantity: 'soldQuantity'
};
export const TaxScalarFieldEnum = {
    id: 'id',
    name: 'name',
    percentage: 'percentage',
    isDefault: 'isDefault',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const TenantScalarFieldEnum = {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    email: 'email',
    phone: 'phone',
    address: 'address',
    logo: 'logo',
    businessType: 'businessType',
    planId: 'planId',
    planExpiry: 'planExpiry',
    isActive: 'isActive',
    currency: 'currency',
    allowTax: 'allowTax',
    taxRate: 'taxRate',
    decimalPoints: 'decimalPoints',
    salesTemplate: 'salesTemplate',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const TransactionScalarFieldEnum = {
    id: 'id',
    ref: 'ref',
    jourId: 'jourId',
    jourDate: 'jourDate',
    tranType: 'tranType',
    particularId: 'particularId',
    productId: 'productId',
    productDetailId: 'productDetailId',
    accountId: 'accountId',
    debit: 'debit',
    credit: 'credit',
    status: 'status',
    description: 'description',
    memo: 'memo',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const UnitScalarFieldEnum = {
    id: 'id',
    name: 'name',
    shortName: 'shortName',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    password: 'password',
    isActive: 'isActive',
    userType: 'userType',
    portal: 'portal',
    roleId: 'roleId',
    passwordChangedAt: 'passwordChangedAt',
    passwordResetToken: 'passwordResetToken',
    passwordResetExpires: 'passwordResetExpires',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const UserTenantScalarFieldEnum = {
    userId: 'userId',
    tenantId: 'tenantId',
    roleId: 'roleId'
};
export const UserBranchScalarFieldEnum = {
    userId: 'userId',
    branchId: 'branchId',
    tenantId: 'tenantId',
    status: 'status'
};
export const VariantAttributeScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const VendorScalarFieldEnum = {
    id: 'id',
    name: 'name',
    phone: 'phone',
    email: 'email',
    address: 'address',
    tin: 'tin',
    company: 'company',
    vendorType: 'vendorType',
    payableAccountId: 'payableAccountId',
    isDefault: 'isDefault',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedById: 'updatedById',
    updatedAt: 'updatedAt'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const NullsOrder = {
    first: 'first',
    last: 'last'
};
