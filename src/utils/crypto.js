import crypto from 'crypto';
const SALT = Buffer.from([0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76]);
const key = 'b4g7k1m3';
export function encrypt(clearText) {
    const encryptor = crypto.pbkdf2Sync(key, SALT, 1000, 48, 'sha1');
    const encryptorKey = encryptor.slice(0, 32);
    const encryptorIv = encryptor.slice(32, 48);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptorKey, encryptorIv);
    let encrypted = cipher.update(clearText, 'utf16le', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
export function decrypt(cipherText) {
    const fixed = cipherText.replace(/ /g, '+');
    const encryptor = crypto.pbkdf2Sync(key, SALT, 1000, 48, 'sha1');
    const encryptorKey = encryptor.slice(0, 32);
    const encryptorIv = encryptor.slice(32, 48);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptorKey, encryptorIv);
    let decrypted = decipher.update(fixed, 'base64', 'utf16le');
    decrypted += decipher.final('utf16le');
    return decrypted;
}
