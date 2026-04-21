export const toSentenceCase = (enumValue) => {
    if (!enumValue)
        return '';
    const clean = enumValue.toLowerCase().replace(/_/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};
export const toTitleCase = (enumValue) => {
    if (!enumValue)
        return '';
    return enumValue
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
export const toSlug = (name) => {
    if (!name)
        return '';
    return name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
