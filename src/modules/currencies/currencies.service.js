export async function createCurrency(prisma, data) {
    return await prisma.currency.create({ data });
}
export async function getCurrencies(prisma) {
    return await prisma.currency.findMany();
}
export async function getCurrencyById(prisma, { id }) {
    return await prisma.currency.findUnique({ where: { id } });
}
export async function updateCurrency(prisma, { id }, data) {
    return await prisma.currency.update({ where: { id }, data });
}
export async function deleteCurrency(prisma, { id }) {
    return await prisma.currency.delete({ where: { id } });
}
