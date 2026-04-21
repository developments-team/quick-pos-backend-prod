export async function createCategory(prisma, data) {
    return await prisma.category.create({ data });
}
export async function getCategories(prisma) {
    return await prisma.category.findMany();
}
export async function getCategoryById(prisma, { id }) {
    return await prisma.category.findUnique({ where: { id } });
}
export async function updateCategory(prisma, { id }, data) {
    return await prisma.category.update({ where: { id }, data });
}
export async function deleteCategory(prisma, { id }) {
    return await prisma.category.delete({ where: { id } });
}
export async function getCategoriesInProducts(prisma) {
    const categoryIdsInUse = await prisma.product.findMany({
        select: { categoryId: true },
        distinct: ['categoryId'],
    });
    const categoryIds = categoryIdsInUse.map((p) => p.categoryId).filter((id) => id !== null);
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
    });
    const result = await Promise.all(categories.map(async (cat) => {
        const count = await prisma.product.count({ where: { categoryId: cat.id } });
        return { id: cat.id, name: cat.name, description: cat.description, productCount: count };
    }));
    return result;
}
