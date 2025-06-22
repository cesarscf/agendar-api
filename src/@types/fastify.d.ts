import "fastify"

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentPartnerId(): Promise<string>
    getCurrentEstablishmentId(): Promise<{
      establishmentId: string
      partnerId: string
    }>
    getCurrentCustomerId(): Promise<string>
    getCurrentCustomerEstablishmentId(): Promise<{
      establishmentId: string
      customerId: string
    }>
  }
}
