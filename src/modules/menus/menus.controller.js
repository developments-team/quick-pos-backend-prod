import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createMenu, getMenus, getMenuById, updateMenu, deleteMenu, getNavigationMenus } from './menus.service.js';
export const createMenuHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createMenu({ ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Menu created', data: row });
});
export const getMenusHandler = catchAsync(async (request, reply) => {
    const rows = await getMenus(request.query);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getMenuByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getMenuById({ id });
    if (!row)
        throw new AppError('Menu not found', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateMenuHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateMenu({ id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Menu updated', data: row });
});
export const deleteMenuHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteMenu({ id });
    return reply.code(200).send({ status: true, message: 'Menu deleted', data: null });
});
export const getNavigationMenusHandler = catchAsync(async (request, reply) => {
    const { roleId } = request.params;
    const menus = await getNavigationMenus({ roleId });
    return reply.code(200).send({ status: true, count: menus.length, data: menus });
});
