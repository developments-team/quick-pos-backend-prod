import catchAsync from '../../utils/catchAsync.js';
import { getDashboardSummary, getSalesTrends, getCustomerInsights, getSalesByUser, getTopProducts, getOutOfStockProducts, getInventoryStatus, } from './dashboards.service.js';
export const getDashboardSummaryHandler = catchAsync(async (request, reply) => {
    const data = await getDashboardSummary(request.prisma);
    return reply.code(200).send({ status: true, data });
});
export const getSalesTrendsHandler = catchAsync(async (request, reply) => {
    const data = await getSalesTrends(request.prisma, request.query.period);
    return reply.code(200).send({ status: true, results: data.length, data });
});
export const getCustomerInsightsHandler = catchAsync(async (request, reply) => {
    const data = await getCustomerInsights(request.prisma);
    return reply.code(200).send({ status: true, results: data.length, data });
});
export const getSalesByUserHandler = catchAsync(async (request, reply) => {
    const data = await getSalesByUser(request.prisma);
    return reply.code(200).send({ status: true, results: data.length, data });
});
export const getTopProductsHandler = catchAsync(async (request, reply) => {
    const data = await getTopProducts(request.prisma);
    return reply.code(200).send({ status: true, results: data.length, data });
});
export const getOutOfStockProductsHandler = catchAsync(async (request, reply) => {
    const data = await getOutOfStockProducts(request.prisma);
    return reply.code(200).send({ status: true, results: data.length, data });
});
export const getInventoryStatusHandler = catchAsync(async (request, reply) => {
    const data = await getInventoryStatus(request.prisma);
    return reply.code(200).send({ status: true, data });
});
