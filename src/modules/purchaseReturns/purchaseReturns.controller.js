import catchAsync from '../../utils/catchAsync.js';
import { getPurchaseReturns, getPurchaseReturnById, createPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn, } from './purchaseReturns.service.js';
export const getPurchaseReturnsHandler = catchAsync(async (request, reply) => {
    const result = await getPurchaseReturns(request.prisma, request.query);
    return reply.code(200).send({ status: true, data: result.purchaseReturns, pagination: result.pagination });
});
export const getPurchaseReturnByIdHandler = catchAsync(async (request, reply) => {
    const purchaseReturn = await getPurchaseReturnById(request.prisma, request.params);
    return reply.code(200).send({ status: true, data: purchaseReturn });
});
export const createPurchaseReturnHandler = catchAsync(async (request, reply) => {
    const purchaseReturn = await createPurchaseReturn(request.prisma, {
        ...request.body,
        createdById: request.user.id,
    });
    return reply
        .code(201)
        .send({ status: true, message: 'Return purchase created successfully', data: purchaseReturn });
});
export const updatePurchaseReturnHandler = catchAsync(async (request, reply) => {
    const purchaseReturn = await updatePurchaseReturn(request.prisma, request.params, {
        ...request.body,
        updatedById: request.user.id,
    });
    return reply
        .code(200)
        .send({ status: true, message: 'Return purchase updated successfully', data: purchaseReturn });
});
export const deletePurchaseReturnHandler = catchAsync(async (request, reply) => {
    await deletePurchaseReturn(request.prisma, request.params);
    return reply.code(200).send({ status: true, message: 'Return purchase deleted successfully' });
});
