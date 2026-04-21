import catchAsync from '../../utils/catchAsync.js';
import { getCustomerStatementSummary } from './customerStatementReports.service.js';
export const getStatementHandler = catchAsync(async (request, reply) => {
    const { customerId, fromDate, toDate } = request.query;
    const ledger = await getCustomerStatementSummary(request.prisma, customerId, new Date(fromDate), new Date(toDate));
    return reply.code(200).send({ status: true, data: ledger });
});
