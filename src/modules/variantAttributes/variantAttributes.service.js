export async function createVariantAttribute(prisma, data) {
    return await prisma.variantAttribute.create({ data });
}
export async function getVariantAttributes(prisma) {
    return await prisma.variantAttribute.findMany({ include: { productVariants: true } });
}
export async function getVariantAttributeById(prisma, { id }) {
    return await prisma.variantAttribute.findUnique({ where: { id }, include: { productVariants: true } });
}
export async function updateVariantAttribute(prisma, { id }, data) {
    return await prisma.variantAttribute.update({ where: { id }, data });
}
export async function deleteVariantAttribute(prisma, { id }) {
    return await prisma.variantAttribute.delete({ where: { id } });
}
