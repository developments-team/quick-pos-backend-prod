import sharp from 'sharp';
import catchAsync from './catchAsync.js';
import { uploadImage } from '../config/cloudinaryConfig.js';
const INDEX_RE = /^\d+$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const BRACKET_REMOVE = /\]/g;
const SPLIT_BRACKET = '[';
function setDeep(target, key, value) {
    const parts = key.replace(BRACKET_REMOVE, '').split(SPLIT_BRACKET);
    let cur = target;
    const lastIdx = parts.length - 1;
    for (let i = 0; i < lastIdx; i++) {
        const part = parts[i];
        if (!part)
            continue;
        const k = INDEX_RE.test(part) ? +part : part;
        const nextPart = parts[i + 1];
        if (cur[k] == null) {
            cur[k] = nextPart && INDEX_RE.test(nextPart) ? [] : {};
        }
        cur = cur[k];
    }
    const finalPart = parts[lastIdx];
    const finalKey = INDEX_RE.test(finalPart) ? +finalPart : finalPart;
    cur[finalKey] = value;
}
function coerce(v) {
    if (v === 'true')
        return true;
    if (v === 'false')
        return false;
    if (v !== '' && NUMBER_RE.test(v))
        return +v;
    return v;
}
export const upload = (folder) => catchAsync(async (request, reply) => {
    if (!folder)
        throw new Error('Folder name is required for upload');
    const data = {};
    const tasks = [];
    const MAX_SIZE = 1 * 1024 * 1024;
    for await (const part of request.parts()) {
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            const task = (async () => {
                let processedBuffer = buffer;
                if (processedBuffer.length > MAX_SIZE) {
                    const isVeryLarge = processedBuffer.length > MAX_SIZE * 2;
                    const sharpInstance = sharp(processedBuffer);
                    if (isVeryLarge) {
                        const metadata = await sharpInstance.metadata();
                        const scale = Math.sqrt(MAX_SIZE / processedBuffer.length) * 0.9;
                        processedBuffer = await sharpInstance
                            .resize(Math.floor(metadata.width * scale))
                            .jpeg({ quality: 80 })
                            .toBuffer();
                    }
                    else {
                        processedBuffer = await sharpInstance.jpeg({ quality: 80, progressive: true }).toBuffer();
                        if (processedBuffer.length > MAX_SIZE) {
                            const metadata = await sharp(processedBuffer).metadata();
                            const scale = Math.sqrt(MAX_SIZE / processedBuffer.length) * 0.9;
                            processedBuffer = await sharp(processedBuffer)
                                .resize(Math.floor(metadata.width * scale))
                                .jpeg({ quality: 70 })
                                .toBuffer();
                        }
                    }
                }
                const cloudinaryResult = await uploadImage(processedBuffer, folder);
                const url = cloudinaryResult && cloudinaryResult.secure_url ? cloudinaryResult.secure_url : cloudinaryResult;
                setDeep(data, part.fieldname, url);
            })();
            tasks.push(task);
        }
        else {
            setDeep(data, part.fieldname, coerce(part.value));
        }
    }
    await Promise.all(tasks);
    request.body = data;
});
