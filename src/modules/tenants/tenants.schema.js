import { Type } from '../../utils/schema.js';
import { BusinessType } from '../../generated/prisma/client.js';
export const tenantBodySchema = Type.Object({
    name: Type.String(),
    businessType: Type.Optional(Type.Unsafe({
        enum: Object.values(BusinessType),
    })),
    planId: Type.Optional(Type.String({ format: 'uuid' })),
    planExpiry: Type.Optional(Type.String()),
    domain: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    address: Type.Optional(Type.String()),
    logo: Type.Optional(Type.String()),
});
export const tenantParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
export const tenantPublicBodySchema = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 }),
    businessType: Type.Optional(Type.Unsafe({
        enum: Object.values(BusinessType),
    })),
    planId: Type.Optional(Type.String({ format: 'uuid' })),
    phone: Type.Optional(Type.String()),
    address: Type.Optional(Type.String()),
    logo: Type.Optional(Type.String()),
});
