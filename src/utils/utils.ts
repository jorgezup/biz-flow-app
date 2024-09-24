import { Customer } from "@/types"


const getCustomerName = (customers:Customer[], customerId: string) => {
  return customers.find(customer => customer.customerId === customerId)?.name
}

const getPaymentMethod = (payment: string | undefined) => {
  return payment?.toLocaleLowerCase() ?? "noPaymentRegistered"
}

export {getCustomerName, getPaymentMethod}