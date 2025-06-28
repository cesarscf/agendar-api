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
    getActiveSubscription(): {
      status: string
      id: string
      createdAt: Date
      updatedAt: Date | null
      partnerId: string
      planId: string
      integrationSubscriptionId: string
      currentPeriodEnd: Date
      endedAt: Date | null
      changedFromSubscriptionId: string | null
    }
    getCurrentAdminId(): string
    getCurrentAdminRole(): string | null
  }
}
