import app from '../../app.js';
import catchAsync from '../../utils/catchAsync.js';
import { login } from './auth.service.js';
export const loginHandler = catchAsync(async (request, reply) => {
    const user = await login(request.body);
    const token = await app.jwtSign({
        user: {
            id: user.id,
            email: user.email,
        },
    });
    const { id, ...data } = user;
    return reply.code(200).send({ status: true, message: 'Logged in successfully.', token, data: data });
});
