import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";

AWSXRay.captureAWS(require('aws-sdk'));

const dynamoClient = new DynamoDB.DocumentClient();
const productsTable = process.env.PRODUCTS_TABLE!
const productRepository = new ProductRepository(dynamoClient, productsTable);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const lambdaRequestId = context.awsRequestId;
    const apiRequestId = event.requestContext.requestId;

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

    const httpMethod = event.httpMethod;

    if (event.resource === "/products") {
        console.log("POST /products")

        const product =  JSON.parse(event.body!) as Product
        const productCreated = await productRepository.create(product)

        return {
            statusCode: 201,
            body: JSON.stringify(productCreated)
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string;

        if (httpMethod === "PUT") {
            console.log(`PUT /products/${productId}`)
            const product = JSON.parse(event.body!) as Product

            try {
                const productUpdated = await productRepository.updateProduct(productId, product)

                return {
                    statusCode: 200,
                    body: JSON.stringify(productUpdated)
                }
            } catch (ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: "Product not found"
                }
            }
        } else if (httpMethod === "DELETE") {
            console.log(`DELETE /products/${productId}`)

            try {
                const product = await productRepository.deleteProduct(productId)
    
                return {
                    statusCode: 200,
                    body: JSON.stringify(product)
                }
            } catch (error) {
                console.error((<Error>error).message)
                return {
                    statusCode: 404,
                    body: (<Error>error).message
                }
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request" })
    }
}