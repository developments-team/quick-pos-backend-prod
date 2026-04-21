import catchAsync from '../../utils/catchAsync.js';
import { encryptPlainText, decryptCipherText } from './crypto.service.js';
export const encryptPlainTextHandler = catchAsync(async (request, reply) => {
    const cipherText = await encryptPlainText(request.body);
    return reply.code(200).send({ status: true, message: 'Encrypted successfully', cipherText });
});
export const decryptCipherTextHandler = catchAsync(async (request, reply) => {
    const plainText = await decryptCipherText(request.body);
    return reply.code(200).send({ status: true, message: 'Decrypted successfully', plainText });
});
