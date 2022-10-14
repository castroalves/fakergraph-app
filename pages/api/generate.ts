// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, GraphQLClient } from "graphql-request";
import type { NextApiRequest, NextApiResponse } from "next";
import { faker } from "@faker-js/faker";

const endpoint =
    "https://api-eu-central.contentql.com/v2/cl0b0o706009f01uj7wu5181r/master";
const authToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1kZXZlbG9wbWVudCJ9.eyJ3ZWJhcHAiOnRydWUsInZlcnNpb24iOjQsImlhdCI6MTY2NTc1NDMyNywiZXhwIjoxNjY1Nzk3NTI3LCJhdWQiOlsiaHR0cHM6Ly9hcGktZXUtY2VudHJhbC5jb250ZW50cWwuY29tL3YyL2NsMGIwbzcwNjAwOWYwMXVqN3d1NTE4MXIvbWFzdGVyIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5jb250ZW50cWwuY29tLyIsInN1YiI6ImQ3NGFjMDI4LTM1MWYtNDMwZC04MGYyLTRlMmUzYmE0YzY0OSIsImp0aSI6ImNrdnV2NXRpazAxbTkwMXVlNWdwdWcxMGIifQ.MysDVoHyFbrmvLLrAiTAuAo_SznCcOeR70ZqeNtRrk4GdAz4vFOIFU4zcREmoRKhWJc1hDGN1ATelaEzQR1WO7zrNdEJysnREUvR4ZNSkSYt1Sv6ABFMkDxBw4CEeSPnX23Il2o6_HeImQ__fPwTZnSvM0jRzaJNBRrzVlz035CMxUlUnkEdLeO7RpR84OGG-koONwsZAPsI-cbKXjly62KYW0X5BNkw-zNhUwD0iFHmEM5wkJCUY0QIYVkuDuG8zbCYsAelb-8hIHyX6gPIfjGDYYlgx6viZJNm_ATsgBCcny6GdqVofmOXOWNagSMzCDNwVKPXvS6mxn9562Xp51GLJuSy9b99yihEhuk0YRq61qaS9XzJz-60P9z29zYnF4N_2-CHrL4gTrwJoMHWYHWENMhfHnvcLjFXLFuZrqRhuoFTkzeEaBZNsrLJ_5hIihb88Z8FH-yMnNdv_NFMg0-s39Nf6w7QweMkywK1i_PSo6D6zjzRb6VgaNlvXyWgyxWvh2Pjf1A9EzIAaYbsLkTAhs4kSncD1XOlkMWAdyuNroR6P40Y_VCbayLSE1BcT30SuxvduuDJIYNsNBr2ySGVe5T-a60LDTvuJHzAOL1qfpUcstiZzlyuQHPq0e5fLpUK_3QUMUGF3nyUftz9gW3tf2BxzKfp1cAngqV6diw";

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
