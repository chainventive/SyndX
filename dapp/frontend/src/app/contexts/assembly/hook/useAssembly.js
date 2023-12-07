import { useContext } from "react";

import AssemblyContext from "@/app/contexts/assembly/assembly.context";

const useAssembly = () => {

    const context = useContext(AssemblyContext);
    if (!context) throw new Error ('useCoproperty must be used within a AssemblyContextProvider');
    return context;
    
}

export default useAssembly;