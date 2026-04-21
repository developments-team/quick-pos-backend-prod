import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createVariantAttribute, getVariantAttributes, getVariantAttributeById, updateVariantAttribute, deleteVariantAttribute, } from './variantAttributes.service.js';
export const createVariantAttributeHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createVariantAttribute(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Variant Attribute created successfully', data: row });
});
export const getVariantAttributesHandler = catchAsync(async (request, reply) => {
    const rows = await getVariantAttributes(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getVariantAttributeByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getVariantAttributeById(request.prisma, { id });
    if (!row)
        throw new AppError('No VariantAttribute found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateVariantAttributeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateVariantAttribute(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Variant Attribute updated successfully', data: row });
});
export const deleteVariantAttributeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteVariantAttribute(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Variant Attribute deleted successfully', data: null });
});
