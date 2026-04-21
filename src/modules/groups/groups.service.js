export async function createGroup(prisma, data) {
    return await prisma.group.create({ data });
}
export async function getGroups(prisma) {
    return await prisma.group.findMany({ include: { products: true } });
}
export async function getGroupById(prisma, { id }) {
    return await prisma.group.findUnique({ where: { id }, include: { products: true } });
}
export async function updateGroup(prisma, { id }, data) {
    return await prisma.group.update({ where: { id }, data });
}
export async function deleteGroup(prisma, { id }) {
    return await prisma.group.delete({ where: { id } });
}
