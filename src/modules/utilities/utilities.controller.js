import catchAsync from '../../utils/catchAsync.js';
import { deleteAllData } from './utilities.service.js';
export const deleteAllDataHandler = catchAsync(async (request, reply) => {
    await deleteAllData(request.prisma);
    return reply.code(200).send({ status: true, message: 'All data deleted successfully', data: null });
});
