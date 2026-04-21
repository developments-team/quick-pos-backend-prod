import catchAsync from '../../utils/catchAsync.js';
import { getAllInventory, getAllProducts } from './inventory.service.js';
export const getAllInventoryHandler = catchAsync(async (request, reply) => {
    const inventory = await getAllInventory(request.prisma, request.query);
    return reply.code(200).send({ status: true, data: inventory });
});
export const getAllProductsHandler = catchAsync(async (request, reply) => {
    const results = await getAllProducts(request.prisma, request.protocol, request.hostname);
    return reply.code(200).send({ status: true, results: results.length, data: results });
});
