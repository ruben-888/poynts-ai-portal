import {
  GiftCardProvider,
  ProviderConfig,
  PurchaseRequest,
  PurchaseResponse,
  BalanceResponse,
  CatalogResponse,
} from "../types";
import {
  BlackhawkPurchaseRequest,
  BlackhawkProduct,
  BlackhawkPurchaseResponse,
  BlackhawkBalanceResponse,
  BlackhawkCatalogResponse,
} from "./types";

export const createBlackhawkProvider = (
  config: ProviderConfig,
): GiftCardProvider => {
  const apiUrl = config.sandbox
    ? "https://sandbox-api.blackhawk.com/v1"
    : "https://api.blackhawk.com/v1";

  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  // Helper to make API calls
  const fetchFromBlackhawk = async <T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(`Blackhawk API error: ${error.message}`);
    }

    return response.json();
  };

  const purchaseGiftCard = async (
    data: PurchaseRequest,
  ): Promise<PurchaseResponse> => {
    const blackhawkRequest: BlackhawkPurchaseRequest = {
      sku: data.productId,
      amount: data.amount,
      recipient: {
        email: data.recipientEmail,
        name: data.recipientName,
      },
    };

    const response = await fetchFromBlackhawk<BlackhawkPurchaseResponse>(
      "/cards/purchase",
      {
        method: "POST",
        body: JSON.stringify(blackhawkRequest),
      },
    );

    return {
      orderId: response.transactionId,
      status: response.status === "COMPLETED" ? "SUCCESS" : "PENDING",
      cardNumber: response.card.number,
      pin: response.card.pin,
      amount: response.card.balance,
      expirationDate: response.card.expiresAt,
      redemptionInstructions: response.redemptionUrl,
    };
  };

  const checkBalance = async (cardNumber: string): Promise<BalanceResponse> => {
    const response = await fetchFromBlackhawk<BlackhawkBalanceResponse>(
      `/cards/${cardNumber}/balance`,
    );

    return {
      cardNumber: response.card.number,
      balance: response.card.balance,
      isActive: response.card.isActive,
      expirationDate: response.card.expiresAt,
    };
  };

  const getCatalog = async (): Promise<CatalogResponse> => {
    const response =
      await fetchFromBlackhawk<BlackhawkCatalogResponse>("/catalog");

    const mapProduct = (product: BlackhawkProduct) => ({
      productId: product.sku,
      brandName: product.brandName,
      description: product.description,
      imageUrl: product.imageUrl,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      fixedAmounts: product.availableDenominations,
      terms: product.termsAndConditions,
    });

    return {
      products: response.products.map(mapProduct),
    };
  };

  return {
    purchaseGiftCard,
    checkBalance,
    getCatalog,
  };
};
