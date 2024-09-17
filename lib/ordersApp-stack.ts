import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"

interface OrdersAppStackProps extends cdk.StackProps {
    productsTable: dynamodb.Table
}

export class OrdersAppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: OrdersAppStackProps) {
        super(scope, id, props)


    }
}