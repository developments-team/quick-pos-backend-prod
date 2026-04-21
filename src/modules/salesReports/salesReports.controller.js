import catchAsync from '../../utils/catchAsync.js';
import { getSalesReport, getSalesDetailsReport, getSalesSummaryReport, getSalesSummaryPerCustomer, getSalesSummaryPerBranch, } from './salesReports.service.js';
export const getSalesReportHandler = catchAsync(async (request, reply) => {
    const data = await getSalesReport(request.prisma, request.query);
    return reply.code(200).send({ status: true, data });
});
export const getSalesDetailsReportHandler = catchAsync(async (request, reply) => {
    const data = await getSalesDetailsReport(request.prisma, request.query);
    return reply.code(200).send({ status: true, data });
});
export const getSalesSummaryReportHandler = catchAsync(async (request, reply) => {
    const data = await getSalesSummaryReport(request.prisma, request.query);
    return reply.code(200).send({ status: true, data });
});
export const getSalesSummaryPerCustomerHandler = catchAsync(async (request, reply) => {
    const { fromDate, toDate } = request.query;
    const data = await getSalesSummaryPerCustomer(request.prisma, fromDate, toDate);
    return reply.code(200).send({ status: true, data });
});
export const getSalesSummaryPerBranchHandler = catchAsync(async (request, reply) => {
    const { fromDate, toDate } = request.query;
    const data = await getSalesSummaryPerBranch(request.prisma, fromDate, toDate);
    return reply.code(200).send({ status: true, data });
});
