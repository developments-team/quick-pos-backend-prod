import { Type } from '../../utils/schema.js';
export const asOfDateQuerySchema = Type.Object({
    asOfDate: Type.String(),
});
export const dateRangeQuerySchema = Type.Object({
    startDate: Type.String(),
    endDate: Type.String(),
});
export const generalLedgerQuerySchema = Type.Object({
    startDate: Type.String(),
    endDate: Type.String(),
    accountId: Type.Optional(Type.String()),
});
