import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

    const httpMethod = event.httpMethod;

    if (event.resource === "/products") {
        if (httpMethod === "GET") {
            console.log("GET /products");

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "GET Products - OK" })
            }
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string;
        console.log(`GET /products/${productId}`)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `GET Product by ID ${productId} - OK` })
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request" })
    }
}