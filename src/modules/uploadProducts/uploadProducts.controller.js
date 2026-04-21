import catchAsync from '../../utils/catchAsync.js';
import { uploadProducts, checkProductSKUs, processUploadProductsImages, saveProductsImages, } from './uploadProducts.service.js';
export const uploadProductsHandler = catchAsync(async (request, reply) => {
    const result = await uploadProducts(request.prisma, request.body, request.user.id);
    return reply.code(201).send({
        status: true,
        message: 'Products upload completed',
        ...result,
    });
});
export const checkProductSKUsHandler = catchAsync(async (request, reply) => {
    const data = await checkProductSKUs(request.prisma, request.body);
    return reply.code(200).send({
        status: true,
        message: 'SKU check completed',
        data,
    });
});
export const uploadProductsImagesHandler = catchAsync(async (request) => {
    const parts = request.parts();
    const data = await processUploadProductsImages(parts);
    request.body = data;
});
export const saveProductsImagesHandler = catchAsync(async (request, reply) => {
    const result = await saveProductsImages(request.prisma, request.body, request.user.id);
    return reply.send(result);
});
