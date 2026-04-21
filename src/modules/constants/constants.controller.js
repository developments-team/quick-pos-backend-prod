import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { getUserTypes, getPortals, getBusinessTypes, getSupportTypes, getReportLevels, getAccountTypes, getAccountGroups, getTransactionStatuss, getVendorTypes, getSexs, getProgressStages, getActions, } from './constants.service.js';
export const getActionsHandler = catchAsync(async (request, reply) => {
    const actions = getActions();
    if (!actions || actions.length === 0)
        throw new AppError('No actions found', 404);
    return reply.code(200).send({ status: true, results: actions.length, data: actions });
});
export const getUserTypesHandler = catchAsync(async (request, reply) => {
    const types = getUserTypes();
    if (!types || types.length === 0)
        throw new AppError('No user types found', 404);
    return reply.code(200).send({ status: true, results: types.length, data: types });
});
export const getPortalsHandler = catchAsync(async (request, reply) => {
    const portals = getPortals();
    if (!portals || portals.length === 0)
        throw new AppError('No portals found', 404);
    return reply.code(200).send({ status: true, results: portals.length, data: portals });
});
export const getBusinessTypesHandler = catchAsync(async (request, reply) => {
    const types = getBusinessTypes();
    if (!types || types.length === 0)
        throw new AppError('No business types found', 404);
    return reply.code(200).send({ status: true, results: types.length, data: types });
});
export const getSupportTypesHandler = catchAsync(async (request, reply) => {
    const types = getSupportTypes();
    if (!types || types.length === 0)
        throw new AppError('No support types found', 404);
    return reply.code(200).send({ status: true, results: types.length, data: types });
});
export const getReportLevelsHandler = catchAsync(async (request, reply) => {
    const levels = getReportLevels();
    if (!levels || levels.length === 0)
        throw new AppError('No report levels found', 404);
    return reply.code(200).send({ status: true, results: levels.length, data: levels });
});
export const getAccountTypesHandler = catchAsync(async (request, reply) => {
    const types = getAccountTypes();
    if (!types || types.length === 0)
        throw new AppError('No account types found', 404);
    return reply.code(200).send({ status: true, results: types.length, data: types });
});
export const getAccountGroupsHandler = catchAsync(async (request, reply) => {
    const groups = getAccountGroups();
    if (!groups || groups.length === 0)
        throw new AppError('No account groups found', 404);
    return reply.code(200).send({ status: true, results: groups.length, data: groups });
});
export const getTransactionStatussHandler = catchAsync(async (request, reply) => {
    const statuses = getTransactionStatuss();
    if (!statuses || statuses.length === 0)
        throw new AppError('No transaction statuses found', 404);
    return reply.code(200).send({ status: true, results: statuses.length, data: statuses });
});
export const getVendorTypesHandler = catchAsync(async (request, reply) => {
    const types = getVendorTypes();
    if (!types || types.length === 0)
        throw new AppError('No vendor types found', 404);
    return reply.code(200).send({ status: true, results: types.length, data: types });
});
export const getSexsHandler = catchAsync(async (request, reply) => {
    const sexes = getSexs();
    if (!sexes || sexes.length === 0)
        throw new AppError('No sex options found', 404);
    return reply.code(200).send({ status: true, results: sexes.length, data: sexes });
});
export const getProgressStagesHandler = catchAsync(async (request, reply) => {
    const stages = getProgressStages();
    if (!stages || stages.length === 0)
        throw new AppError('No progress stages found', 404);
    return reply.code(200).send({ status: true, results: stages.length, data: stages });
});
