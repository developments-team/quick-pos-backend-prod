import { Type } from '../../utils/schema.js';
export const loginBodySchema = Type.Object({
    email: Type.String(),
    password: Type.String(),
});
