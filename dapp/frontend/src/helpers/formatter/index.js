const formatBlockchainAddress = (address) => {
    if (!address) return 'unknow';
    return `${ address.substring(0, 5) }...${ address.substring(address.length-4, address.length) }`;
};