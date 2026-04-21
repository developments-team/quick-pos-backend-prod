import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createBrand, getBrands, getBrandById, updateBrand, deleteBrand } from './brands.service.js';
export const createBrandHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createBrand(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Brand created successfully', data: row });
});
export const getBrandsHandler = catchAsync(async (request, reply) => {
    const rows = await getBrands(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getBrandByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getBrandById(request.prisma, { id });
    if (!row)
        throw new AppError('No Brand found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateBrandHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateBrand(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Brand updated successfully', data: row });
});
export const deleteBrandHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteBrand(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Brand deleted successfully', data: null });
});
