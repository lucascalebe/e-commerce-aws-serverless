import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

export interface Product {
    id: string;
    productName: string;
    price: number;
    model: string;
}

export class ProductRepository {
    private dynamoClient: DocumentClient
    private productsTable: string

    constructor(dynamoClient: DocumentClient, productsTable: string) {
        this.dynamoClient = dynamoClient
        this.productsTable = productsTable
    }

    async findAllProducts(): Promise<Product[]> {
        const data = await this.dynamoClient.scan({
            TableName: this.productsTable
        }).promise()

        return data.Items as Product[]
    }

    async findProductById(id: number): Promise<Product> {
        const data = await this.dynamoClient.get({
            TableName: this.productsTable,
            Key: {
                id
            }
        }).promise()

        if (data.Item) {
            return data.Item as Product
        } else {
            throw new Error(`Product with id ${id} not found`)
        }
    }
}