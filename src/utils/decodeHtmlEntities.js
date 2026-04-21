export const decodeHtmlEntities = (str) => {
    if (typeof str === 'string') {
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }
    return str;
};
