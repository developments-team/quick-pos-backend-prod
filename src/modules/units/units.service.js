export async function createUnit(prisma, data) {
    return await prisma.unit.create({ data });
}
export async function getUnits(prisma) {
    return await prisma.unit.findMany({ include: { purchaseUnits: true, saleUnits: true } });
}
export async function getUnitById(prisma, { id }) {
    return await prisma.unit.findUnique({ where: { id }, include: { purchaseUnits: true, saleUnits: true } });
}
export async function updateUnit(prisma, { id }, data) {
    return await prisma.unit.update({ where: { id }, data });
}
export async function deleteUnit(prisma, { id }) {
    return await prisma.unit.delete({ where: { id } });
}
