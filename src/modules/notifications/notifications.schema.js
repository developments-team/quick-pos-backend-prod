import { Type } from '../../utils/schema.js';
export const notificationDetailParamsSchema = Type.Object({
    detailId: Type.String({ format: 'uuid' }),
});
