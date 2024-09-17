import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"

interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJS.NodejsFunction;
    productsAdminHandler: lambdaNodeJS.NodejsFunction;
    ordersHandler: lambdaNodeJS.NodejsFunction;
}

export class ECommerceApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
        super(scope, id, props)

        const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs")

        const api = new apigateway.RestApi(this, "ECommereceApi", {
            restApiName: "ECommerceApi",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    ip: true,
                    caller: true,
                    user: true,
                    requestTime: true,
                    httpMethod: true,
                    protocol: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                })
            },
        })

        this.createProductsService(props, api)

        this.createOrdersService(props, api)
    }

    private createProductsService(props: ECommerceApiStackProps, api: apigateway.RestApi) {
        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
        const productsResource = api.root.addResource("products")

        // GET /products
        productsResource.addMethod("GET", productsFetchIntegration)

        // GET /products/{id}
        const productIdResource = productsResource.addResource("{id}")
        productIdResource.addMethod("GET", productsFetchIntegration)


        const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler)
        // POST/products
        productsResource.addMethod("POST", productsAdminIntegration)

        // PUT /products/{id}
        productIdResource.addMethod("PUT", productsAdminIntegration)

        // DELETE /products/{id}
        productIdResource.addMethod("DELETE", productsAdminIntegration)
    }

    private createOrdersService(props: ECommerceApiStackProps, api: apigateway.RestApi) {
        const ordersIntegration = new apigateway.LambdaIntegration(props.ordersHandler)
        const ordersResource = api.root.addResource("orders")

        // GET /orders
        // GET /orders?email=mock@email.com
        // GET /orders?email=mock@email.com&orderId=123
        ordersResource.addMethod("GET", ordersIntegration)

        // POST /orders
        ordersResource.addMethod("POST", ordersIntegration)

        // DELETE /orders?email=mock@email.com&orderId=123
        ordersResource.addMethod("DELETE", ordersIntegration)
    }
}