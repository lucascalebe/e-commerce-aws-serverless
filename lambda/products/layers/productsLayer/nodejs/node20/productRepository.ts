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

    async create(product: Product): Promise<Product> {
        product.id = uuid()
        await this.dynamoClient.put({
            TableName: this.productsTable,
            Item: product
        }).promise()

        return product
    }

    async deleteProduct(productId: string): Promise<Product> {
        const data = await this.dynamoClient.delete({
            TableName: this.productsTable,
            Key: {
                id: productId
            },
            ReturnValues: "ALL_OLD"
        }).promise()


        if (data.Attributes) {
            return data.Attributes as Product
        } else {
            throw new Error(`Product with id ${productId} not found`)
        }
    }

    async updateProduct(productId: string, product: Product): Promise<Product> {
        const data = await this.dynamoClient.update({
            TableName: this.productsTable,
            Key: {
                id: productId
            },
            ConditionExpression: "attribute_exists(id)",
            UpdateExpression: "set productName = :productName, price = :price, model = :model",
            ExpressionAttributeValues: {
                ":productName": product.productName,
                ":price": product.price,
                ":model": product.model
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        data.Attributes!.id = productId

        return data.Attributes as Product
    }
}