import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadImage = async (imageBuffer, folder = 'products') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({
            folder,
            resource_type: 'image',
        }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        })
            .end(imageBuffer);
    });
};
export const getImageUrl = (publicId, options = {}) => {
    const { width, height, crop = 'fill' } = options;
    return cloudinary.url(publicId, {
        secure: true,
        width,
        height,
        crop,
    });
};
export const deleteImage = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId);
};
export default cloudinary;
