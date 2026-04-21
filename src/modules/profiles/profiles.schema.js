import { Type } from '../../utils/schema.js';
export const profileBodySchema = Type.Object({
    firstName: Type.String(),
    lastName: Type.String(),
    phone: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    address: Type.Optional(Type.String()),
    dateOfBirth: Type.Optional(Type.String()),
    sex: Type.Optional(Type.String()),
    picture: Type.Optional(Type.String()),
    bio: Type.Optional(Type.String()),
});
export const profileParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
