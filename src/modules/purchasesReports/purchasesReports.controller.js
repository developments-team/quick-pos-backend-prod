import catchAsync from '../../utils/catchAsync.js';
import { getPurchasesDetailsPerVendor, getPurchasesSummaryPerVendor } from './purchasesReports.service.js';
export const getPurchasesDetailsPerVendorHandler = catchAsync(async (request, reply) => {
    const data = await getPurchasesDetailsPerVendor(request.prisma, request.params.id, request.query);
    return reply.code(200).send({ status: true, data });
});
export const getPurchasesSummaryPerVendorHandler = catchAsync(async (request, reply) => {
    const data = await getPurchasesSummaryPerVendor(request.prisma, request.params.id, request.query);
    return reply.code(200).send({ status: true, data });
});
