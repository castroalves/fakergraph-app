// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, GraphQLClient } from "graphql-request";
import type { NextApiRequest, NextApiResponse } from "next";
import { faker } from "@faker-js/faker";

const endpoint = process.env.HYGRAPH_CONTENT_API as string;
const authToken = process.env.HYGRAPH_AUTH_TOKEN as string;

const contentClient = new GraphQLClient(endpoint, {
    headers: {
        Authorization: `Bearer ${authToken}`,
    },
});

const createBlogPosts = gql`
    mutation createBlogPost($data: BlogPostCreateInput!) {
        createBlogPost(data: $data) {
            id
        }
    }
`;

const allowedFields = (type: string) => {
    let value;
    switch (type) {
        case "color":
            value = {
                hex: faker.internet.color(),
            };
            break;
        case "email":
            value = faker.internet.email().toLowerCase();
            break;
        case "sentence":
            value = faker.lorem.sentence();
            break;
        case "paragraphs":
            value = faker.lorem.paragraphs(5);
            break;
        case "html":
        case "markdown":
        case "richtext":
        case "rte":
            // add support to slate: faker.lorem.paragraphs(5)
            value = {
                children: [
                    {
                        type: "paragraph",
                        children: [
                            {
                                text: " ",
                            },
                        ],
                    },
                ],
            };
            break;
        case "date":
            value = faker.date.recent().toString().substring(0, 10); // 2022-10-14
        case "datetime":
            value = faker.date.recent();
            break;
        case "boolean":
            value = faker.datatype.boolean();
            break;
        case "category":
        case "adjective":
            value = faker.word.adjective();
            break;
        case "number":
            value = faker.datatype.number(1000);
            break;
        case "amount":
            value = Number.parseFloat(faker.finance.amount(0, 1000));
            break;
        case "slug":
            value = faker.lorem.slug();
            break;
        case "location":
            const gps = faker.address.nearbyGPSCoordinate();
            value = {
                latitude: Number.parseFloat(gps[0]),
                longitude: Number.parseFloat(gps[1]),
            };
            break;
        default:
            value = faker.lorem.sentence();
            break;
    }
    return value;
};

function generateData(fields: any) {
    const data: any = {};
    Object.keys(fields).map((key: string) => {
        // Workaround while we add support for images
        if (
            fields[key] !== "image" &&
            fields[key] !== "skip" &&
            fields[key] !== "ignore"
        ) {
            data[key] = allowedFields(fields[key]);
        }
    });
    return data;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log(req.body);
    const { quantity, model } = req.body;
    const fields = req.body[model];
    console.log(fields);

    const query = gql`
        mutation create${model}($data: ${model}CreateInput!) {
          create${model}(data: $data) {
            id
          }
        }
      `;

    let entries = [];
    for (let i = 0; i < quantity; i++) {
        let data = generateData(fields);
        entries.push(data);
    }

    // console.log("entries:", entries);

    let created: any = [];
    await Promise.all(
        entries.map(async (entry) => {
            const createContent: any = await contentClient.request(query, {
                data: entry,
            });
            created.push(createContent);
        })
    );

    res.status(201).json(created);
}
