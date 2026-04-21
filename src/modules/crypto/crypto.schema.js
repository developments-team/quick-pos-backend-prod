import { Type } from '../../utils/schema.js';
export const encryptBodySchema = Type.Object({
    plainText: Type.String(),
});
export const decryptBodySchema = Type.Object({
    cipherText: Type.String(),
});
