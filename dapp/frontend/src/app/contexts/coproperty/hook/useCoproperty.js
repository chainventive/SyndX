import { useContext } from "react";

import CopropertyContext from "@/app/contexts/coproperty/coproperty.context";

const useCoproperty = () => {

    const context = useContext(CopropertyContext);
    if (!context) throw new Error ('useCoproperty must be used within a CopropertyContextProvider');
    return context;
    
}

export default useCoproperty;