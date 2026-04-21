import { encrypt, decrypt } from '../../utils/crypto.js';
export function encryptPlainText(data) {
    return encrypt(data.plainText);
}
export function decryptCipherText(data) {
    return decrypt(data.cipherText);
}
