export async function createAdjustmentType(prisma, data) {
    return await prisma.adjustmentType.create({ data });
}
export async function getAdjustmentTypes(prisma) {
    return await prisma.adjustmentType.findMany();
}
export async function getAdjustmentTypeById(prisma, { id }) {
    return await prisma.adjustmentType.findUnique({ where: { id } });
}
export async function updateAdjustmentType(prisma, { id }, data) {
    return await prisma.adjustmentType.update({ where: { id }, data });
}
export async function deleteAdjustmentType(prisma, { id }) {
    return await prisma.adjustmentType.delete({ where: { id } });
}
