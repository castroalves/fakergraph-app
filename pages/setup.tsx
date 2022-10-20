import { useApp } from "@graphcms/app-sdk-react";
import { Button, Flex, Heading, Inline, Stack, Text } from "@hygraph/baukasten";
import { useState } from "react";

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
        <Flex gap="16" flexDirection="column" width="300px">
            <Heading as="h2">FakerGraph</Heading>
            <Text>Generate fake content, powered by Faker.js</Text>
            <Inline>
                <Button
                    onClick={() =>
                        updateInstallation({ status: "PENDING", config: {} })
                    }
                >
                    Install App
                </Button>
            </Inline>
        </Flex>
    );
}

function Configure({ config }: any) {
    const { updateInstallation } = useApp();
    const [loading, setLoading] = useState(false);

    return (
        <Flex gap="16" flexDirection="column" width="300px">
            <Heading as="h2">FakerGraph</Heading>
            <Text>Generate fake content, powered by Faker.js</Text>
            <form>
                {/* <Stack gap="8">
                    <strong>Erase fake content:</strong>
                    <input type="text" placeholder="Type here to erase" />
                    <button>Erase</button>
                </Stack> */}
                <Inline>
                    <Button
                        loading={loading}
                        loadingText="Saving..."
                        onClick={async () => {
                            setLoading(true);
                            await updateInstallation({
                                status: "COMPLETED",
                            });
                            setLoading(false);
                        }}
                    >
                        Save
                    </Button>
                </Inline>
            </form>
        </Flex>
    );
}
