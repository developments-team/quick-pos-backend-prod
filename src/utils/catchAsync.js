export default (fn) => (request, reply) => {
    return fn(request, reply).catch((err) => {
        err.requestBody = request.body;
        throw err;
    });
};
