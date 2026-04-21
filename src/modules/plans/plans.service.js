import { globalPrisma } from '../../lib/prisma.js';
import AppError from '../../utils/appError.js';
export async function createPlan(data) {
    const recommendedExists = await globalPrisma.plan.findFirst({
        where: { isRecommended: true },
    });
    if (data.isRecommended) {
        await globalPrisma.plan.updateMany({
            where: { isRecommended: true },
            data: { isRecommended: false },
        });
    }
    else if (!recommendedExists) {
        data.isRecommended = true;
    }
    const row = await globalPrisma.plan.create({
        data: {
            ...data,
            reportLevel: data.reportLevel,
            supportType: data.supportType,
            createdById: data.createdById,
        },
    });
    if (!row || !row.id) {
        throw new AppError('Failed to create plan', 500);
    }
    return row;
}
export async function getPlans() {
    return await globalPrisma.plan.findMany({
        orderBy: {
            createdAt: 'asc',
        },
    });
}
export async function getPlansForPublic() {
    return await globalPrisma.plan.findMany({
        orderBy: {
            createdAt: 'asc',
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            branchLimit: true,
            userLimit: true,
            productLimit: true,
            reportLevel: true,
            supportType: true,
            isRecommended: true,
        },
    });
}
export async function getPlanById({ id }) {
    return await globalPrisma.plan.findUnique({ where: { id } });
}
export async function updatePlan({ id }, data) {
    if (data.isRecommended === false) {
        const current = await globalPrisma.plan.findUnique({ where: { id } });
        if (current?.isRecommended) {
            throw new AppError('Cannot remove recommended status — at least one plan must be recommended. Set another plan as recommended first.', 400);
        }
    }
    if (data.isRecommended) {
        await globalPrisma.plan.updateMany({
            where: { isRecommended: true, id: { not: id } },
            data: { isRecommended: false },
        });
    }
    return await globalPrisma.plan.update({
        where: { id },
        data: {
            ...data,
            reportLevel: data.reportLevel,
            supportType: data.supportType,
        },
    });
}
export async function deletePlan({ id }) {
    const plan = await globalPrisma.plan.findUnique({ where: { id } });
    if (plan?.isRecommended) {
        throw new AppError('Cannot delete the recommended plan. Set another plan as recommended first.', 400);
    }
    return await globalPrisma.plan.delete({ where: { id } });
}
