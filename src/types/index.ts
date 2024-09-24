export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  unitOfMeasure: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductData {
  name: string;
  description: string;
  unitOfMeasure: string;
  price: number;
}


export interface Sale {
  orderId: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleDetail {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  createdAt: string;
}

export interface CustomerPreferences {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  preferredPurchaseDay: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  products: string[];
  quantity: number[];
  generated: boolean;
  status: string;
  paymentMethod: string | undefined;
}

export interface PaginatedResponse {
  data: any[];
  result: any;
  totalRecords: number;
  pageSize: number;
  currentPage: number;
  totalPages: number
}

export interface OrderDetail {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPreferences {
  id: string;
  customerId: string;
  productId: string;
  preferredPurchaseDay: string; // Changed back to a single string
  quantity: number;
}

export enum PaymentMethod {
  Pix= "Pix",
  Cash= "Cash",
  Courtesy= "Courtesy"
}

export type CustomerPendingPayment = {
  customerId: string;
  customerName: string;
  totalPendingAmount: number;
};
