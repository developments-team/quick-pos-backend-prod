import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createVendor, getVendors, getVendorById, updateVendor, deleteVendor, getVendorsByType, getVendorStatementSummary, } from './vendors.service.js';
export const createVendorHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createVendor(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Vendor created successfully', data: row });
});
export const getVendorsHandler = catchAsync(async (request, reply) => {
    const rows = await getVendors(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getVendorByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getVendorById(request.prisma, { id });
    if (!row)
        throw new AppError('No Vendor found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateVendorHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateVendor(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Vendor updated successfully', data: row });
});
export const deleteVendorHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteVendor(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Vendor deleted successfully', data: null });
});
export const getVendorsByTypeHandler = catchAsync(async (request, reply) => {
    const { type } = request.query;
    const vendors = await getVendorsByType(request.prisma, type);
    return reply.code(200).send({ status: true, results: vendors.length, data: vendors });
});
export const getVendorStatementSummaryHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const { fromDate, toDate } = request.query;
    const ledger = await getVendorStatementSummary(request.prisma, { id }, fromDate, toDate);
    return reply.code(200).send({ status: true, data: ledger });
});
