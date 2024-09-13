import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

const dynamoClient = new DynamoDB.DocumentClient();
const productsTable = process.env.PRODUCTS_TABLE!
const productRepository = new ProductRepository(dynamoClient, productsTable);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

    const httpMethod = event.httpMethod;

    if (event.resource === "/products") {
        if (httpMethod === "GET") {
            console.log("GET /products");

            const products = await productRepository.findAllProducts()

            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string;
        console.log(`GET /products/${productId}`)

        try {

            const product = await productRepository.findProductById(productId)
            return {
                statusCode: 200,
                body: JSON.stringify({product})
            }
        } catch (error) {
            console.error((<Error>error).message)
            return {
                statusCode: 404,
                body: (<Error>error).message
            }
        }

    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request" })
    }
}