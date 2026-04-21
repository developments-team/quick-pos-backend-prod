export async function createCustomerGroup(prisma, data) {
    return await prisma.customerGroup.create({ data });
}
export async function getCustomerGroups(prisma) {
    return await prisma.customerGroup.findMany();
}
export async function getCustomerGroupById(prisma, { id }) {
    return await prisma.customerGroup.findUnique({ where: { id } });
}
export async function updateCustomerGroup(prisma, { id }, data) {
    return await prisma.customerGroup.update({ where: { id }, data });
}
export async function deleteCustomerGroup(prisma, { id }) {
    return await prisma.customerGroup.delete({ where: { id } });
}
