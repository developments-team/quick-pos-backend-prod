import catchAsync from '../../utils/catchAsync.js';
import { getPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase } from './purchases.service.js';
export const getPurchasesHandler = catchAsync(async (request, reply) => {
    const purchases = await getPurchases(request.prisma);
    return reply.code(200).send({ status: true, count: purchases.length, data: purchases });
});
export const getPurchaseByIdHandler = catchAsync(async (request, reply) => {
    const purchase = await getPurchaseById(request.prisma, request.params);
    return reply.code(200).send({ status: true, data: purchase });
});
export const createPurchaseHandler = catchAsync(async (request, reply) => {
    const purchase = await createPurchase(request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Purchase saved successfully', data: purchase });
});
export const updatePurchaseHandler = catchAsync(async (request, reply) => {
    const purchase = await updatePurchase(request.prisma, request.params, {
        ...request.body,
        updatedById: request.user.id,
    });
    return reply.code(200).send({ status: true, message: 'Purchase updated successfully', data: purchase });
});
export const deletePurchaseHandler = catchAsync(async (request, reply) => {
    await deletePurchase(request.prisma, request.params);
    return reply.code(200).send({ status: true, message: 'Purchase deleted (with nested cleared)', data: null });
});
