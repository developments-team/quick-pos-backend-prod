import catchAsync from '../../utils/catchAsync.js';
import { createSaleReturn } from './saleReturns.service.js';
export const createSaleReturnHandler = catchAsync(async (request, reply) => {
    const saleReturn = await createSaleReturn(request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(200).send({ status: true, message: 'Sales return processed', data: saleReturn });
});
