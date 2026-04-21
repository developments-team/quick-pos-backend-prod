import { getUnreadNotificationCountHandler, getUserNotificationsHandler, markNotificationAsReadHandler, markAllNotificationsAsReadHandler, } from './notifications.controller.js';
import { notificationDetailParamsSchema } from './notifications.schema.js';
export default async function notificationRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Notifications'] };
    });
    server.get('/count', getUnreadNotificationCountHandler);
    server.get('/', getUserNotificationsHandler);
    server.patch('/:detailId/read', { schema: { params: notificationDetailParamsSchema } }, markNotificationAsReadHandler);
    server.patch('/readAll', markAllNotificationsAsReadHandler);
}
