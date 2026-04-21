import catchAsync from '../../utils/catchAsync.js';
import { getTrialBalance, getBalanceSheet, getIncomeStatement, getOwnersEquity, getGeneralLedger, } from './accountingReports.service.js';
export const getTrialBalanceHandler = catchAsync(async (request, reply) => {
    const data = await getTrialBalance(request.prisma, request.query);
    return reply.code(200).send({ status: true, message: `Trial Balance as of ${request.query.asOfDate}`, data });
});
export const getBalanceSheetHandler = catchAsync(async (request, reply) => {
    const data = await getBalanceSheet(request.prisma, request.query);
    return reply.code(200).send({ status: true, message: `Balance Sheet as of ${request.query.asOfDate}`, data });
});
export const getIncomeStatementHandler = catchAsync(async (request, reply) => {
    const data = await getIncomeStatement(request.prisma, request.query);
    return reply
        .code(200)
        .send({
        status: true,
        message: `Income Statement from ${request.query.startDate} to ${request.query.endDate}`,
        data,
    });
});
export const getOwnersEquityHandler = catchAsync(async (request, reply) => {
    const data = await getOwnersEquity(request.prisma, request.query);
    return reply
        .code(200)
        .send({
        status: true,
        message: `Statement of Owner's Equity from ${request.query.startDate} to ${request.query.endDate}`,
        data,
    });
});
export const getGeneralLedgerHandler = catchAsync(async (request, reply) => {
    const data = await getGeneralLedger(request.prisma, request.query);
    return reply
        .code(200)
        .send({
        status: true,
        message: `General Ledger from ${request.query.startDate} to ${request.query.endDate}`,
        data,
    });
});
