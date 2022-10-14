import { useApp } from "@graphcms/app-sdk-react";
import { useEffect } from "react";

export default function Sidebar() {
    return <FormSidebar />;
}

function FormSidebar() {
    const {
        // @ts-expect-error
        model: { fields },
    } = useApp();

    useEffect(() => {
        console.log(fields);
    }, []);

    return <p>FakerGraph</p>;
}
