import catchAsync from '../../utils/catchAsync.js';
import { getLowStockAlerts, getOutOfStock, getTopSelling, getStockDetailReport } from './stocks.service.js';
export const getLowStockAlertsHandler = catchAsync(async (request, reply) => {
    const result = await getLowStockAlerts(request.prisma);
    return reply.code(200).send({ success: true, data: result });
});
export const getOutOfStockHandler = catchAsync(async (request, reply) => {
    const result = await getOutOfStock(request.prisma);
    return reply.code(200).send({ success: true, data: result });
});
export const getTopSellingHandler = catchAsync(async (request, reply) => {
    const result = await getTopSelling(request.prisma);
    return reply.code(200).send({ success: true, data: result });
});
export const getStockDetailReportHandler = catchAsync(async (request, reply) => {
    const result = await getStockDetailReport(request.prisma, request.query);
    return reply.code(200).send({ success: true, data: result });
});
