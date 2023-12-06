export const easeContractEvent = (events) => {
    return events.map((event, index) => ({
        index: index,
        blocknumber: Number(event.blockNumber),
        name: event.eventName,
        args: event.args
    }));
};