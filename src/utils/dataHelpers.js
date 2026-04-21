export const normalizeField = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    return value;
};
export const capitalizeFirstLetter = (str) => {
    if (!str) {
        return str;
    }
    const firstChar = str.charAt(0).toUpperCase();
    const restOfString = str.slice(1);
    return firstChar + restOfString;
};
