import { Type } from '../../utils/schema.js';
export const customerStatementQuerySchema = Type.Object({
    customerId: Type.String(),
    fromDate: Type.String(),
    toDate: Type.String(),
});
