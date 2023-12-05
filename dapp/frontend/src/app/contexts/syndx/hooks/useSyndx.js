import { useContext } from "react";

import SyndxContext from "@/app/contexts/syndx/syndx.context";

const useSyndx = () => {

    const context = useContext(SyndxContext);
    if (!context) throw new Error ('useSyndx must be used within a SyndxContextProvider');
    return context;
    
}

export default useSyndx;