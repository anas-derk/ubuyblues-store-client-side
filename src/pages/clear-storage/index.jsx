import { useEffect } from "react";

export default function Checkout() {
    
    useEffect(() => {
        localStorage.clear();
    }, []);

    return (
        <div className="clear-storage">Hello To You In Clear Storage</div>
    );
}