import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, getCategoriesInProducts, } from './categories.service.js';
export const createCategoryHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createCategory(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Category saved successfully', data: row });
});
export const getCategoriesHandler = catchAsync(async (request, reply) => {
    const rows = await getCategories(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getCategoryByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getCategoryById(request.prisma, { id });
    if (!row)
        throw new AppError('No Category found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateCategoryHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateCategory(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Category updated successfully', data: row });
});
export const deleteCategoryHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteCategory(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Category deleted successfully', data: null });
});
export const getCategoriesInProductsHandler = catchAsync(async (request, reply) => {
    const result = await getCategoriesInProducts(request.prisma);
    return reply.code(200).send({ status: true, results: result.length, data: result });
});
