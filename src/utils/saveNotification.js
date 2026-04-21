export async function saveNotification({ prisma, ref, type, title, message, user }) {
    await prisma.$transaction(async (tx) => {
        const master = await tx.notifications.create({
            data: {
                ref,
                type,
                title,
                message,
                users: { connect: { id: user } },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        await tx.notificationDetails.create({
            data: {
                notifications: { connect: { id: master.id } },
                createdAt: new Date(),
            },
        });
    });
}
