export async function createBrand(prisma, data) {
    return await prisma.brand.create({ data });
}
export async function getBrands(prisma) {
    return await prisma.brand.findMany({ include: { products: true } });
}
export async function getBrandById(prisma, { id }) {
    return await prisma.brand.findUnique({ where: { id }, include: { products: true } });
}
export async function updateBrand(prisma, { id }, data) {
    return await prisma.brand.update({ where: { id }, data });
}
export async function deleteBrand(prisma, { id }) {
    return await prisma.brand.delete({ where: { id } });
}
