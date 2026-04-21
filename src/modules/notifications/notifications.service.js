import AppError from '../../utils/appError.js';
export async function getUnreadNotificationCount(prisma, userId) {
    return await prisma.viewer.count({ where: { userId, isViewed: false } });
}
export async function getUserNotifications(prisma, userId) {
    const viewers = await prisma.viewer.findMany({
        where: { userId },
        include: { detail: { include: { master: true } } },
        orderBy: { detail: { createdAt: 'desc' } },
    });
    return viewers.map((v) => ({
        id: v.detail.id,
        masterID: {
            id: v.detail.master.id,
            ref: v.detail.master.ref,
            type: v.detail.master.type,
            title: v.detail.master.title,
            message: v.detail.master.message,
        },
        isViewed: v.isViewed,
    }));
}
export async function markNotificationAsRead(prisma, userId, detailId) {
    const viewer = await prisma.viewer.findUnique({
        where: { detailId_userId: { detailId, userId } },
    });
    if (!viewer)
        throw new AppError('Notification not found', 404);
    if (!viewer.isViewed) {
        await prisma.viewer.update({
            where: { id: viewer.id },
            data: { isViewed: true, viewedAt: new Date() },
        });
    }
}
export async function markAllNotificationsAsRead(prisma, userId) {
    return await prisma.viewer.updateMany({
        where: { userId, isViewed: false },
        data: { isViewed: true, viewedAt: new Date() },
    });
}
