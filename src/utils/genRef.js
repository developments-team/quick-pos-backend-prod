const incrementLastref = (prf, lastItem) => {
    if (lastItem) {
        const prefix = lastItem.match(/^\D*/)[0];
        const numberPart = lastItem.slice(prefix.length);
        const newNumber = (parseInt(numberPart, 10) + 1).toString().padStart(numberPart.length, '0');
        return `${prefix}${newNumber}`;
    }
    return `${prf}0000000001`;
};
export default incrementLastref;
