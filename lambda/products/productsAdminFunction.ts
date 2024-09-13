import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

    const httpMethod = event.httpMethod;

    if (event.resource === "/products") {
        console.log("POST /products")   

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "POST /products Created" })
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string;

        if (httpMethod === "PUT") {
            console.log(`PUT /products/${productId}`)
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "PUT /products/{id} Updated" })
            }
        } else if (httpMethod === "DELETE") {
            console.log(`DELETE /products/${productId}`)
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "DELETE /products/{id} Updated" })
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request" })
    }
}