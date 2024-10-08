import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"

interface ProductsAppStackProps extends cdk.StackProps {
    eventsDynamoTable : dynamodb.Table
}

export class ProductsAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
    readonly productsAdminHandler: lambdaNodeJS.NodejsFunction
    readonly productsTable: dynamodb.Table

    constructor(scope: Construct, id: string, props: ProductsAppStackProps) {
        super(scope, id, props)

        this.productsTable = new dynamodb.Table(this, "Products", {
            tableName: "Products",
            partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1,
        })

        // Products Layer
        const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn")
        const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn)

        const productEventsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductEventsLayerVersionArn")
        const productEventsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductEventsLayerVersionArn", productEventsLayerArn)


        const productEventsHandler = new lambdaNodeJS.NodejsFunction(this, "ProductEventsFunction", {
            runtime: lambda.Runtime.NODEJS_20_X,
            functionName: "ProductEventsFunction",
            entry: "lambda/products/productEventsFunction.ts",
            handler: "handler",
            memorySize: 512,
            timeout: cdk.Duration.seconds(2),
            bundling: {
                minify: true,
                sourceMap: false
            },
            description: "Events related to system",
            environment: {
                EVENTS_TABLE: props.eventsDynamoTable.tableName
            },
            layers: [productEventsLayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_317_0
        })

        props.eventsDynamoTable.grantWriteData(productEventsHandler)

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
            },
            layers: [productsLayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_317_0
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
                PRODUCTS_TABLE: this.productsTable.tableName,
                PRODUCT_EVENTS_FUNCTION_NAME: productEventsHandler.functionName
            },
            layers: [productsLayer, productEventsLayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_317_0
        })

        this.productsTable.grantWriteData(this.productsAdminHandler)
        productEventsHandler.grantInvoke(this.productsAdminHandler)

    }
}