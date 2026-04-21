import AppError from '../../utils/appError.js';
export async function createCustomer(prisma, data) {
    return await prisma.customer.create({ data });
}
export async function getCustomers(prisma) {
    return await prisma.customer.findMany({
        where: { name: { not: 'Walk-in Customer' } },
        include: { customerGroup: true, receivableAccount: true },
    });
}
export async function getCustomerById(prisma, { id }) {
    return await prisma.customer.findUnique({
        where: { id },
        include: { customerGroup: true, receivableAccount: true, receipts: true, sales: true, saleReturns: true },
    });
}
export async function updateCustomer(prisma, { id }, data) {
    return await prisma.customer.update({ where: { id }, data });
}
export async function deleteCustomer(prisma, { id }) {
    const customer = await prisma.customer.findUnique({ where: { id, isDefault: true } });
    if (customer)
        throw new AppError('Default customers cannot be deleted', 400);
    return await prisma.customer.delete({ where: { id } });
}
