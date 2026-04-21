import { Sex } from '../../generated/prisma/client.js';
export async function createProfile(prisma, data) {
    return await prisma.profile.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            address: data.address,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            sex: data.sex ? Sex[data.sex.toUpperCase().trim()] : undefined,
            picture: data.picture,
            bio: data.bio,
            userId: data.userId,
        },
    });
}
export async function getProfileById(prisma, { id }) {
    return await prisma.profile.findUnique({ where: { id } });
}
export async function updateProfile(prisma, { id }, data) {
    return await prisma.profile.update({
        where: { id },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            address: data.address,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            sex: data.sex ? Sex[data.sex.toUpperCase().trim()] : undefined,
            picture: data.picture,
            bio: data.bio,
            userId: data.userId,
            updatedAt: new Date(),
        },
    });
}
