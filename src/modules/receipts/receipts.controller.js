import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createReceipt, getReceipts, getReceiptById, updateReceipt, deleteReceipt } from './receipts.service.js';
export const createReceiptHandler = catchAsync(async (request, reply) => {
    const receipt = await createReceipt(request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(201).send({ message: 'Receipt and double-entry transactions created successfully', receipt });
});
export const getReceiptsHandler = catchAsync(async (request, reply) => {
    const receipts = await getReceipts(request.prisma);
    return reply.code(200).send(receipts);
});
export const getReceiptByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const receipt = await getReceiptById(request.prisma, { id });
    if (!receipt)
        throw new AppError('Receipt not found', 404);
    return reply.code(200).send(receipt);
});
export const updateReceiptHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const receipt = await updateReceipt(request.prisma, { id }, request.body);
    return reply.code(200).send({ message: 'Receipt updated successfully', receipt });
});
export const deleteReceiptHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const receipt = await deleteReceipt(request.prisma, { id });
    return reply.code(200).send({ message: 'Receipt and related transactions deleted successfully', receipt });
});
