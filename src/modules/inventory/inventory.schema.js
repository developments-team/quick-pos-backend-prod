import { Type } from '../../utils/schema.js';
export const inventoryQuerySchema = Type.Object({
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
    branch: Type.Optional(Type.String()),
    brand: Type.Optional(Type.String()),
    category: Type.Optional(Type.String()),
    group: Type.Optional(Type.String()),
    search: Type.Optional(Type.String()),
});
