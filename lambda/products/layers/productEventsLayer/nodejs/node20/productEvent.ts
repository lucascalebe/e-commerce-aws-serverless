export enum ProductEventType {
    CREATED = "PRODUCT_CREATED",
    UPDATED = "PRODUCT_UPDATED",
    DELETED = "PRODUCT_DELETED"
}

export interface ProductEvent {
    productId: string;
    requestId: string;
    eventType: ProductEventType;
    productCode: string;
    productPrice: number;
    email: string;
}