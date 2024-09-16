#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';
import { EventsDynamoStack } from '../lib/eventsDynamo-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "780273477543",
  region: "us-east-1"
}

const tags = {
  cost: "ECommerce",
  team: "LucasCalebeDev"
}

const productsAppLayersStack = new ProductsAppLayersStack(app, "ProductsAppLayers", {
  env,
  tags
})

const eventsDynamoStack = new EventsDynamoStack(app, "EventsDynamo", {
  env,
  tags
})

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  eventsDynamoTable: eventsDynamoStack.table,
  env,
  tags
});

productsAppStack.addDependency(productsAppLayersStack)
productsAppStack.addDependency(eventsDynamoStack)

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  env,
  tags,
})

eCommerceApiStack.addDependency(productsAppStack)