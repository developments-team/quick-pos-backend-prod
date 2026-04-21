import catchAsync from '../../utils/catchAsync.js';
import { getUnreadNotificationCount, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, } from './notifications.service.js';
export const getUnreadNotificationCountHandler = catchAsync(async (request, reply) => {
    const count = await getUnreadNotificationCount(request.prisma, request.user.id);
    return reply.code(200).send({ status: true, count });
});
export const getUserNotificationsHandler = catchAsync(async (request, reply) => {
    const notifications = await getUserNotifications(request.prisma, request.user.id);
    return reply.code(200).send({ status: true, results: notifications.length, data: notifications });
});
export const markNotificationAsReadHandler = catchAsync(async (request, reply) => {
    const { detailId } = request.params;
    await markNotificationAsRead(request.prisma, request.user.id, detailId);
    return reply.code(200).send({ status: true, message: 'Notification marked as read' });
});
export const markAllNotificationsAsReadHandler = catchAsync(async (request, reply) => {
    const result = await markAllNotificationsAsRead(request.prisma, request.user.id);
    return reply
        .code(200)
        .send({ status: true, message: 'All notifications marked as read', modifiedCount: result.count });
});
