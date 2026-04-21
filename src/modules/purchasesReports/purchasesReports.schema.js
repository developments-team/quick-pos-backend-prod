import { Type } from '../../utils/schema.js';
export const purchasesReportQuerySchema = Type.Object({
    fromDate: Type.String(),
    toDate: Type.String(),
});
export const purchasesReportParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
