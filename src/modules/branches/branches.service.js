export async function createBranch(prisma, data) {
    const ddd = { ...data };
    return await prisma.branch.create({ data });
}
export async function getBranches(prisma) {
    return await prisma.branch.findMany();
}
export async function getBranchById(prisma, { id }) {
    return await prisma.branch.findUnique({
        where: { id: id },
        include: {
            purchases: true,
            purchaseReturns: true,
            sales: true,
            saleReturns: true,
            stockInventories: true,
        },
    });
}
export async function updateBranch(prisma, { id }, data) {
    return await prisma.branch.update({
        where: { id: id },
        data,
    });
}
export async function deleteBranch(prisma, { id }) {
    return await prisma.branch.delete({ where: { id: id } });
}
