import { useEffect, useState } from "react";

import { useApp } from "@graphcms/app-sdk-react";

import { gql, GraphQLClient } from "graphql-request";

import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    Flex,
    Input,
    Label,
    Stack,
    Heading,
    Text,
    Select,
} from "@hygraph/baukasten";

const PROJECT_QUERY = gql`
    query GetProjectInfo($id: ID!) {
        viewer {
            project(id: $id) {
                environment(name: "master") {
                    contentModel {
                        models {
                            apiId
                            apiIdPlural
                            displayName
                            isLocalized
                            fields {
                                apiId
                                displayName
                                id
                                isSystem
                            }
                        }
                        locales {
                            apiId
                            displayName
                            isDefault
                        }
                    }
                }
            }
        }
    }
`;

export default function Page() {
    return <FormPage />;
}

type FormData = {
    // fields: any;
    // quantity: number;
    // model: string;
};

const dataTypes = [
    { label: "Skip", value: "skip" },
    { label: "Color", value: "color" },
    { label: "Email", value: "email" },
    { label: "Sentence", value: "sentence" },
    { label: "Paragraphs", value: "paragraphs" },
    { label: "HTML", value: "html" },
    { label: "Date", value: "date" },
    { label: "Date and Time", value: "datetime" },
    { label: "Boolean", value: "boolean" },
    { label: "Category", value: "category" },
    { label: "Number", value: "number" },
    { label: "Amount", value: "amount" },
    { label: "Slug", value: "slug" },
    { label: "GPS Location", value: "location" },
];

function FormPage() {
    const {
        context: { environment, project },
        installation: { config },
        showToast,
    } = useApp();

    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    const [models, setModels] = useState([]);
    const [modelName, setModelName] = useState("");
    const [modelFields, setModelFields] = useState([]);
    const [buttonLabel, setButtonLabel] = useState("Generate Entries");
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState([]);

    // Hygraph Content API Endpoint and Auth Token
    // const { endpoint, authToken, name } = environment;

    // Hygraph Management API Endpoint and Auth Token
    const { id, mgmtApi, mgmtToken } = project;

    const mgmtClient = new GraphQLClient(mgmtApi, {
        headers: {
            Authorization: `Bearer ${mgmtToken}`,
        },
    });

    const normalizePluralModel = (model: string) => {
        return model.charAt(0).toLowerCase() + model.slice(1);
    };

    const fetchMgmtData = async () => {
        const data = await mgmtClient.request(PROJECT_QUERY, {
            id,
        });
        return data;
    };

    const getFields = (model: any) => {
        if (!model) return;
        const newField = model.fields.filter((field: any) => {
            if (!field.isSystem) {
                return field;
            }
        });
        return newField;
    };

    const generate = (formData: any) => {
        console.log("formData:", formData);
        axios
            .post("/api/generate", formData)
            .then((response: any) => {
                const { data } = response;
                if (data) {
                    setLoading(false);
                    setModelFields([]);
                    setEntries(data);
                    setButtonLabel("Generate Content");
                }
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
                setButtonLabel("Generate Content");
            })
            .finally(() => {
                setLoading(false);
                setButtonLabel("Generate Content");
            });
    };

    const onSubmit = (data: any) => {
        // setLoading(true);
        // setButtonLabel("Generating...");
        console.log("formData", data);
        // generate(data);
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchMgmtData();
            if (data) {
                const models =
                    data.viewer.project.environment.contentModel.models;
                setModels(models);
                setModelName(models[0].apiIdPlural);
                const fields = getFields(models[0]);
                setModelFields(fields);
            }
        };
        fetchData();
    }, []);

    return (
        <Flex
            flexDirection="column"
            style={{
                padding: "4rem",
            }}
        >
            <h3>FakeGraph</h3>

            {entries.length > 0 && (
                <Alert variantColor="success">
                    {entries.length === 1
                        ? `${entries.length} ${modelName} was created!`
                        : `${entries.length} ${modelName}s were created!`}
                </Alert>
            )}

            <Flex gap="16" py="m">
                <Text>Select a model to generate fake content.</Text>
            </Flex>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex gap="16" flexDirection="column" width="200px">
                    <Stack gap="8">
                        <Label>Select a Model:</Label>
                        <select
                            onChange={(e: any) => {
                                setEntries([]);
                                const fields = getFields(
                                    models[e.target.selectedIndex]
                                );
                                setModelFields(fields);
                                setModelName(e.target.value);
                                setValue("model", e.target.value);
                            }}
                        >
                            {models?.map((model: any) => (
                                <option key={model.apiId} value={model.apiId}>
                                    {model.displayName}
                                </option>
                            ))}
                        </select>
                    </Stack>
                    <Stack gap="8">
                        <Label>Number of entries to generate:</Label>
                        <Input
                            id="quantity"
                            type="number"
                            defaultValue={5}
                            min="1"
                            max="10"
                            {...register("quantity", {
                                minLength: 1,
                                maxLength: 10,
                            })}
                        />
                    </Stack>
                    <Heading as="h4">{modelName} Fields:</Heading>
                    {modelFields?.map((modelField: any, index: number) => {
                        return (
                            <>
                                <Stack key={index} gap="8">
                                    <Label>{modelField.displayName}</Label>
                                    <Controller
                                        name={`${modelName}.${modelField.apiId}`}
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                value={field.value}
                                                onChange={field.onChange}
                                            >
                                                <option value="">
                                                    Select a data type
                                                </option>
                                                {dataTypes.map((type) => (
                                                    <option value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            // <Input
                                            //     type="text"
                                            //     value={field.value}
                                            //     onChange={field.onChange}
                                            // />
                                        )}
                                    />
                                </Stack>
                            </>
                        );
                    })}
                    <Button
                        loading={loading}
                        loadingText="Generating..."
                        type="submit"
                    >
                        {buttonLabel}
                    </Button>
                </Flex>
            </form>
        </Flex>
    );
}
