import AppError from './appError.js';
import { capitalizeFirstLetter } from './dataHelpers.js';
const extractModelName = (err) => {
    if (err.meta?.modelName) {
        return err.meta.modelName.charAt(0).toUpperCase() + err.meta.modelName.slice(1);
    }
    if (err.message) {
        const match = err.message.match(/prisma\.([^.]+)\./);
        if (match) {
            return match[1].charAt(0).toUpperCase() + match[1].slice(1);
        }
    }
    return null;
};
const handleNotFoundError = (err) => {
    const model = extractModelName(err) || 'Resource';
    const message = `${model} not found with the provided criteria.`;
    return new AppError(message, 404);
};
const handleUniqueConstraintError = (err) => {
    let field = err.meta?.target?.join(', ') || 'field';
    if (!err.meta?.target && err.message) {
        const match = err.message.match(/Unique constraint failed on the fields: \((.+?)\)/);
        if (match) {
            field = match[1]
                .split(',')
                .map((f) => f.trim().replace(/`/g, ''))
                .join(', ');
        }
    }
    const model = extractModelName(err) || '';
    const modelPart = model;
    let duplicatedValue = 'the provided value';
    if (err.requestBody) {
        const value = err.requestBody[field];
        if (value !== undefined && value !== null) {
            duplicatedValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        }
    }
    const message = `Duplicate ${capitalizeFirstLetter(field)} found: "${duplicatedValue}" already exists.`;
    return new AppError(message, 400);
};
const handleForeignKeyConstraintError = (err) => {
    const fieldName = err.meta?.field_name?.replace(/`/g, '') || 'related field';
    const relatedModel = fieldName.replace(/Id$/, '').charAt(0).toUpperCase() + fieldName.replace(/Id$/, '').slice(1) || 'Related resource';
    const model = extractModelName(err) || '';
    const modelPart = model ? ` in ${model}` : '';
    const message = `Operation failed due to a related ${relatedModel}${modelPart} that could not be found.`;
    return new AppError(message, 400);
};
const handleValidationError = (err) => {
    let message = 'Invalid input data.';
    const model = extractModelName(err) || '';
    const modelPart = model ? ` for ${model}` : '';
    if (err.meta) {
        if (err.meta.constraint) {
            message = `Violated constraint${modelPart}: ${err.meta.constraint}`;
        }
        else if (err.meta.target) {
            message = `Validation failed for field(s)${modelPart}: ${err.meta.target.join(', ')}`;
        }
        else if (err.meta.column_name) {
            message = `Value for column ${err.meta.column_name}${modelPart} is invalid or too long.`;
        }
        else if (err.meta.field_name) {
            message = `Invalid value for field ${err.meta.field_name}${modelPart}.`;
        }
        else if (err.meta.details) {
            message += `${modelPart} ${err.meta.details}`;
        }
    }
    return new AppError(message, 400);
};
const handleInvalidIdError = (err) => {
    const model = extractModelName(err) || '';
    const modelPart = model ? `${model} ` : '';
    const message = `Invalid ${modelPart}ID format: ${err.meta?.value}`;
    return new AppError(message, 400);
};
const handleConstraintFailedError = (err) => {
    const model = extractModelName(err) || '';
    const modelPart = model ? ` in ${model}` : '';
    const message = `A constraint failed on the database${modelPart}: ${err.meta?.database_error || 'unknown error'}.`;
    return new AppError(message, 400);
};
const handleRelationError = (err) => {
    let message = 'Relation error: Issue with related records.';
    const model = extractModelName(err) || '';
    const modelPart = model ? ` in ${model}` : '';
    if (err.meta?.details) {
        message += `${modelPart} ${err.meta.details}`;
    }
    else if (err.meta?.constraint) {
        message += `${modelPart} Violated constraint: ${err.meta.constraint}.`;
    }
    return new AppError(message, 400);
};
const handleDatabaseStructureError = (err) => {
    let message = 'Database structure error.';
    const model = extractModelName(err) || '';
    const modelPart = model ? ` for ${model}` : '';
    if (err.code === 'P2021') {
        message = `Table ${err.meta?.table || 'unknown'}${modelPart} does not exist.`;
    }
    else if (err.code === 'P2022') {
        message = `Column ${err.meta?.column || 'unknown'}${modelPart} does not exist.`;
    }
    return new AppError(message, 500);
};
const handleConnectionPoolTimeout = (err) => {
    const message = `Timed out fetching a new connection from the connection pool. Please try again later.`;
    return new AppError(message, 500);
};
const handleUnsupportedFeature = (err) => {
    const message = `Current platform does not support a feature used in the query: ${err.meta?.cause || 'unknown'}.`;
    return new AppError(message, 500);
};
const handlePrismaConnectionError = (err) => {
    let message = 'Database connection or configuration error.';
    let statusCode = 500;
    switch (err.code) {
        case 'P1000':
            message = `Authentication failed for user ${err.meta?.database_user || 'unknown'} at ${err.meta?.database_host || 'unknown'}. Please check credentials.`;
            break;
        case 'P1001':
            message = `Cannot reach database server at ${err.meta?.database_host || 'unknown'}:${err.meta?.database_port || 'unknown'}. Ensure the server is running.`;
            break;
        case 'P1002':
            message = `Connection to database server at ${err.meta?.database_host || 'unknown'}:${err.meta?.database_port || 'unknown'} timed out.`;
            break;
        case 'P1003':
            message = `Database ${err.meta?.database_name || err.meta?.database_schema_name || err.meta?.database_file_name || 'unknown'} does not exist.`;
            break;
        case 'P1008':
            message = `Operations timed out after ${err.meta?.time || 'unknown duration'}.`;
            break;
        case 'P1009':
            message = `Database ${err.meta?.database_name || 'unknown'} already exists on the server.`;
            break;
        case 'P1010':
            message = `Access denied for user ${err.meta?.database_user || 'unknown'} on database ${err.meta?.database_name || 'unknown'}.`;
            break;
        case 'P1011':
            message = `TLS connection error: ${err.meta?.message || 'unknown issue'}.`;
            break;
        case 'P1012':
            message = `Schema validation error: ${err.message || 'invalid schema configuration'}.`;
            break;
        case 'P1013':
            message = `Invalid database connection string: ${err.meta?.details || 'unknown'}.`;
            break;
        case 'P1014':
            message = `Underlying database object for model ${err.meta?.model || 'unknown'} does not exist.`;
            break;
        case 'P1015':
            message = `Schema features not supported by database version ${err.meta?.database_version || 'unknown'}: ${err.meta?.errors || ''}.`;
            break;
        case 'P1016':
            message = `Raw query parameter mismatch. Expected: ${err.meta?.expected || 'unknown'}, actual: ${err.meta?.actual || 'unknown'}.`;
            break;
        case 'P1017':
            message = `Database server closed the connection unexpectedly.`;
            break;
        default:
            message = `Unknown connection error: ${err.message || ''}.`;
    }
    return new AppError(message, statusCode);
};
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);
const sendErrorDev = (err, request, reply) => {
    if (request.url.startsWith('/api')) {
        return reply.code(err.statusCode).send({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    else {
        return reply.code(err.statusCode).send(`<h1>${err.message}</h1><pre>${err.stack}</pre>`);
    }
};
const sendErrorProd = (err, request, reply, msg) => {
    if (request.url.startsWith('/api')) {
        if (err.isOperational) {
            return reply.code(err.statusCode).send({
                status: err.status,
                message: err.message,
            });
        }
        console.error('ERROR 💥', err);
        return reply.code(500).send({
            status: false,
            message: 'Something went wrong!',
        });
    }
    else {
        if (err.isOperational) {
            return reply.code(err.statusCode).send(`<h1>${err.message}</h1>`);
        }
        else {
            console.error('ERROR 💥', err);
            return reply.code(500).send('<h1>Something went wrong!</h1>');
        }
    }
};
export default (err, request, reply) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || false;
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, request, reply);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message };
        if (error.code === 'P2025')
            error = handleNotFoundError(error);
        if (error.code === 'P2002')
            error = handleUniqueConstraintError(error);
        if (error.code === 'P2003')
            error = handleForeignKeyConstraintError(error);
        if (error.code === 'P2023')
            error = handleInvalidIdError(error);
        if (error.code === 'P2004')
            error = handleConstraintFailedError(error);
        if (['P2014', 'P2015', 'P2017', 'P2018'].includes(error.code))
            error = handleRelationError(error);
        if (['P2021', 'P2022'].includes(error.code))
            error = handleDatabaseStructureError(error);
        if (error.code === 'P2024')
            error = handleConnectionPoolTimeout(error);
        if (error.code === 'P2026')
            error = handleUnsupportedFeature(error);
        if ([
            'P2000',
            'P2001',
            'P2005',
            'P2006',
            'P2007',
            'P2008',
            'P2009',
            'P2010',
            'P2011',
            'P2012',
            'P2013',
            'P2016',
            'P2019',
            'P2020',
            'P2027',
            'P2028',
            'P2030',
            'P2033',
            'P2034',
            'P2035',
            'P2036',
            'P2037',
        ].includes(error.code))
            error = handleValidationError(error);
        if (error.code && error.code.startsWith('P10'))
            error = handlePrismaConnectionError(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, request, reply, err.message);
    }
};
