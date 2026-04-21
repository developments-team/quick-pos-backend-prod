import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import AppError from './appError.js';
export const resizeImage = async (buffer, outputPath) => {
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        const metadata = await sharp(buffer).metadata();
        let processedImage = sharp(buffer)
            .resize(300, 300, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({
            quality: metadata.size && metadata.size > 1024 * 1024 ? 70 : 85,
            progressive: true,
            force: false
        });
        let outputBuffer = await processedImage.toBuffer();
        while (outputBuffer.length > 1024 * 1024) {
            processedImage = sharp(outputBuffer).jpeg({
                quality: 70,
                progressive: true,
                force: false
            });
            outputBuffer = await processedImage.toBuffer();
        }
        await processedImage.toFile(outputPath);
    }
    catch (error) {
        throw new AppError(`Error creating purchase: ${error.message}`, 500);
    }
};
