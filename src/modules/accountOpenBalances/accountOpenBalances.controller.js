import catchAsync from '../../utils/catchAsync.js';
import { openCashRegister, getCashRegisterStatus } from './accountOpenBalances.service.js';
export const openCashRegisterHandler = catchAsync(async (request, reply) => {
    const records = await openCashRegister(request.prisma, request.body.amount, request.user.id);
    return reply.code(201).send({ status: true, message: 'Cash register opened successfully', data: records });
});
export const getCashRegisterStatusHandler = catchAsync(async (request, reply) => {
    const cashAcc = await getCashRegisterStatus(request.prisma);
    return reply.code(200).send({ status: true, results: 1, data: cashAcc });
});
