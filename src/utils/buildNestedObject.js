export const buildNestedObject = (data) => {
    const processEntry = (keys, value, obj = {}) => {
        const [key, ...restKeys] = keys;
        if (restKeys.length === 0) {
            obj[key] = value.trim();
            return obj;
        }
        const nextKey = restKeys[0];
        obj[key] = obj[key] || (isNaN(nextKey) ? {} : []);
        obj[key] = processEntry(restKeys, value, obj[key]);
        return obj;
    };
    const recursiveBuild = (entries, index = 0, result = {}) => {
        if (index >= entries.length)
            return result;
        const [key, value] = entries[index];
        const keyParts = key.replace(/\]/g, '').split(/[[\].]+/);
        return recursiveBuild(entries, index + 1, processEntry(keyParts, value, result));
    };
    return recursiveBuild(Object.entries(data));
};
