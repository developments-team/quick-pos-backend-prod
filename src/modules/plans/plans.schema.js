import { Type } from '../../utils/schema.js';
import { ReportLevel, SupportType } from '../../generated/prisma/client.js';
export const planBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    price: Type.Optional(Type.Number()),
    reportLevel: Type.Enum(ReportLevel),
    supportType: Type.Enum(SupportType),
    roleId: Type.String({ format: 'uuid' }),
    userLimit: Type.Optional(Type.Number()),
    branchLimit: Type.Optional(Type.Number()),
    productLimit: Type.Optional(Type.Number()),
    isRecommended: Type.Optional(Type.Boolean()),
});
export const planParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
