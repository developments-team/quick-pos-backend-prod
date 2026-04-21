export async function createTax(prisma, data) {
    return await prisma.tax.create({ data });
}
export async function getTaxes(prisma) {
    return await prisma.tax.findMany({ include: { products: true } });
}
export async function getTaxById(prisma, { id }) {
    return await prisma.tax.findUnique({ where: { id }, include: { products: true } });
}
export async function updateTax(prisma, { id }, data) {
    return await prisma.tax.update({ where: { id }, data });
}
export async function deleteTax(prisma, { id }) {
    return await prisma.tax.delete({ where: { id } });
}
