import catchAsync from '../../utils/catchAsync.js';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory, } from './products.service.js';
export const createProductHandler = catchAsync(async (request, reply) => {
    const product = await createProduct(request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Product created successfully', data: product });
});
export const getProductsHandler = catchAsync(async (request, reply) => {
    const products = await getProducts(request.prisma);
    return reply.code(200).send({ status: true, count: products.length, data: products });
});
export const getProductByIdHandler = catchAsync(async (request, reply) => {
    const product = await getProductById(request.prisma, request.params);
    return reply.code(200).send({ status: true, data: product });
});
export const updateProductHandler = catchAsync(async (request, reply) => {
    const product = await updateProduct(request.prisma, request.params, {
        ...request.body,
        updatedById: request.user.id,
    });
    return reply.code(200).send({ status: true, message: 'Product updated successfully', data: product });
});
export const deleteProductHandler = catchAsync(async (request, reply) => {
    await deleteProduct(request.prisma, request.params);
    return reply.code(200).send({ status: true, message: 'Product deleted (with nested cleared)', data: null });
});
export const getProductsByCategoryHandler = catchAsync(async (request, reply) => {
    const products = await getProductsByCategory(request.prisma, request.params.id);
    return reply.code(200).send({ status: true, results: products.length, data: products });
});
