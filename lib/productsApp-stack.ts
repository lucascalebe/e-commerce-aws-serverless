import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynadb from "aws-cdk-lib/aws-dynamodb"
import { Construct } from "constructs"

export class ProductsAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
    readonly productsAdminHandler: lambdaNodeJS.NodejsFunction
    readonly productsTable: dynadb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.productsTable = new dynadb.Table(this, "Products", {
            tableName: "Products",
            partitionKey: { name: "id", type: dynadb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynadb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1,
        })

        this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsFetchFunction", {
            runtime: lambda.Runtime.NODEJS_20_X,
            functionName: "ProductsFetchFunction",
            entry: "lambda/products/productsFetchFunction.ts",
            handler: "handler",
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false
            },
            description: "Fetch products from DynamoDB",
            environment: {
                PRODUCTS_TABLE: this.productsTable.tableName
            }
        })

        this.productsTable.grantReadData(this.productsFetchHandler)

        this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsAdminFunction", {
            runtime: lambda.Runtime.NODEJS_20_X,
            functionName: "ProductsAdminFunction",
            entry: "lambda/products/productsAdminFunction.ts",
            handler: "handler",
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false
            },
            description: "Create, Delete and Update products from DynamoDB",
            environment: {
                PRODUCTS_TABLE: this.productsTable.tableName
            }
        })

        this.productsTable.grantWriteData(this.productsFetchHandler)

    }
}