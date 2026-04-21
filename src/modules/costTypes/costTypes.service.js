export async function createCostType(prisma, data) {
    return await prisma.costType.create({ data });
}
export async function getCostTypes(prisma) {
    return await prisma.costType.findMany();
}
export async function getCostTypeById(prisma, { id }) {
    return await prisma.costType.findUnique({ where: { id } });
}
export async function updateCostType(prisma, { id }, data) {
    return await prisma.costType.update({ where: { id }, data });
}
export async function deleteCostType(prisma, { id }) {
    return await prisma.costType.delete({ where: { id } });
}
