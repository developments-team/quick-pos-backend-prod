import { Type } from '../../utils/schema.js';
export const chartOfAccountBodySchema = Type.Object({
    accountNumber: Type.String(),
    accountName: Type.String(),
    accountType: Type.String(),
    parentAccountId: Type.String(),
    openingBalance: Type.Optional(Type.Number()),
    balanceDate: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
});
export const chartOfAccountParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
export const chartOfAccountGroupParamsSchema = Type.Object({
    accountGroup: Type.String(),
});
export const chartOfAccountQuerySchema = Type.Object({
    parentAccountId: Type.Optional(Type.String()),
});
