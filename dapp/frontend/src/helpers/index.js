const formatAddress = (address) => {
    if (!address) return 'unknow';
    return `${ address.substring(0, 5) }...${ address.substring(address.length-4, address.length) }`;
};

const copyToClipboard = (address) => navigator.clipboard.writeText(address);