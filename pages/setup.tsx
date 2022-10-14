import { useApp, Wrapper } from "@graphcms/app-sdk-react";

export default function Page() {
    return <Setup />;
}

function Setup() {
    const { installation } = useApp();
    if (installation) {
        const { config } = installation;
        return <Configure config={config} />;
    }
    return <Install />;
}

function Install() {
    const { updateInstallation } = useApp();
    return (
        <button
            onClick={() =>
                updateInstallation({ status: "PENDING", config: {} })
            }
        >
            Install App
        </button>
    );
}

function Configure({ config }: any) {
    const { updateInstallation } = useApp();

    return (
        <div>
            <h2>Settings</h2>
            <form>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong>Erase fake content:</strong>
                    <input type="text" placeholder="Type here to erase" />
                    <button>Erase</button>
                </div>
                <div>
                    <button
                        onClick={async () =>
                            await updateInstallation({
                                status: "COMPLETED",
                            })
                        }
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
