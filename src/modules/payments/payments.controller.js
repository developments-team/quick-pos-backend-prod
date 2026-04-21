import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createPayment, getPayments, getPaymentById, updatePayment, deletePayment } from './payments.service.js';
export const createPaymentHandler = catchAsync(async (request, reply) => {
    const payment = await createPayment(request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(201).send({ message: 'Payment and double-entry transaction created successfully', payment });
});
export const getPaymentsHandler = catchAsync(async (request, reply) => {
    const payments = await getPayments(request.prisma);
    return reply.code(200).send(payments);
});
export const getPaymentByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const payment = await getPaymentById(request.prisma, { id });
    if (!payment)
        throw new AppError('Payment not found', 404);
    return reply.code(200).send(payment);
});
export const updatePaymentHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const payment = await updatePayment(request.prisma, { id }, { ...request.body, updatedById: request.user.id });
    if (!payment)
        throw new AppError('Payment not found', 404);
    return reply.code(200).send({ message: 'Payment updated successfully', payment });
});
export const deletePaymentHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const payment = await deletePayment(request.prisma, { id });
    return reply.code(200).send({ message: 'Payment and related transaction deleted successfully', payment });
});
