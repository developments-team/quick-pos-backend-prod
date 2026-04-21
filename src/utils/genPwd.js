const genPwd = () => {
    const getRandomChar = (rangeStart, rangeEnd) => String.fromCharCode(Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart);
    const letters = Array.from({ length: 3 }, () => Math.random() < 0.5
        ? getRandomChar(97, 122)
        : getRandomChar(65, 90)).join('');
    const symbols = '@_';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const numbers = Array.from({ length: 4 }, () => getRandomChar(48, 57)).join('');
    return letters + symbol + numbers;
};
export default genPwd;
