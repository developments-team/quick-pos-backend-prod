import { Type } from '../../utils/schema.js';
export const currencyBodySchema = Type.Object({
    code: Type.String(),
    name: Type.Optional(Type.String()),
    symbol: Type.Optional(Type.String()),
    isBase: Type.Boolean(),
    rateToBase: Type.Number(),
});
export const currencyParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
