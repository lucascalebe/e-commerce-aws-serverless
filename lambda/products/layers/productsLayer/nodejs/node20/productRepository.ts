import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { v4 as uuid } from "uuid"

export interface Product {
    id: number;
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
}