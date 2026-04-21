export async function createPaymentType(prisma, data) {
    return await prisma.paymentType.create({ data });
}
export async function getPaymentTypes(prisma) {
    return await prisma.paymentType.findMany();
}
export async function getPaymentTypeById(prisma, { id }) {
    return await prisma.paymentType.findUnique({ where: { id } });
}
export async function updatePaymentType(prisma, { id }, data) {
    return await prisma.paymentType.update({ where: { id }, data });
}
export async function deletePaymentType(prisma, { id }) {
    return await prisma.paymentType.delete({ where: { id } });
}
