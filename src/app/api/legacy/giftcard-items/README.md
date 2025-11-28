# Gift Card Items API

This API provides endpoints to manage gift card items in the CarePoynt system.

## Endpoints

### List Gift Card Items

```
GET /api/legacy/giftcard-items
```

Retrieves a list of all active gift card items with their associated brands, providers, and gift cards.

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "valueType": "FIXED_VALUE",
      "minValue": null,
      "maxValue": null,
      "rewardName": "Amazon Gift Card",
      "status": "active",
      "rewardStatus": "active",
      "rewardAvailability": "AVAILABLE",
      "rewardType": "giftcard",
      "providerRewardId": "abc123",
      "rebateInfo": {
        "providerPercentage": 0.05,
        "basePercentage": 0.02,
        "customerPercentage": 0.03,
        "cpPercentage": 0
      },
      "brand": {
        "id": 456,
        "key": "amazon",
        "name": "Amazon",
        "imageUrls": {
          "small": "https://example.com/amazon-small.png",
          "medium": "https://example.com/amazon-medium.png",
          "large": "https://example.com/amazon-large.png"
        }
      },
      "provider": {
        "id": 789,
        "name": "GiftCardProvider",
        "code": "GCP",
        "enabled": true,
        "status": "active"
      },
      "giftCards": {
        "count": 3,
        "lowestValue": 25,
        "highestValue": 100,
        "valuesList": "25, 50, 100",
        "items": [
          {
            "id": 1001,
            "value": 25,
            "poyntsValue": 2500,
            "inventoryType": "unlimited",
            "inventoryRemaining": 999,
            "language": "en",
            "tags": ["popular", "digital"],
            "customTitle": null,
            "cpidx": "CP001"
          },
          // Additional gift cards...
        ]
      }
    },
    // Additional gift card items...
  ]
}
```

### Get Gift Card Item

```
GET /api/legacy/giftcard-items/[item_id]
```

Retrieves a specific gift card item by ID with its associated brand, provider, and gift cards.

#### Parameters

- `item_id` (path parameter): The ID of the gift card item to retrieve

#### Response Format

```json
{
  "id": 123,
  "valueType": "FIXED_VALUE",
  "minValue": null,
  "maxValue": null,
  "rewardName": "Amazon Gift Card",
  "status": "active",
  "rewardStatus": "active",
  "rewardAvailability": "AVAILABLE",
  "rewardType": "giftcard",
  "providerRewardId": "abc123",
  "rebateInfo": {
    "providerPercentage": 0.05,
    "basePercentage": 0.02,
    "customerPercentage": 0.03,
    "cpPercentage": 0
  },
  "brand": {
    "id": 456,
    "key": "amazon",
    "name": "Amazon",
    "imageUrls": {
      "small": "https://example.com/amazon-small.png",
      "medium": "https://example.com/amazon-medium.png",
      "large": "https://example.com/amazon-large.png"
    }
  },
  "provider": {
    "id": 789,
    "name": "GiftCardProvider",
    "code": "GCP",
    "enabled": true,
    "status": "active"
  },
  "giftCards": {
    "count": 3,
    "lowestValue": 25,
    "highestValue": 100,
    "valuesList": "25, 50, 100",
    "items": [
      {
        "id": 1001,
        "value": 25,
        "poyntsValue": 2500,
        "inventoryType": "unlimited",
        "inventoryRemaining": 999,
        "language": "en",
        "tags": ["popular", "digital"],
        "customTitle": null,
        "cpidx": "CP001"
      },
      // Additional gift cards...
    ]
  }
}
```

### Update Gift Card Item

```
PUT /api/legacy/giftcard-items/[item_id]
```

Updates a specific gift card item by ID with the provided data.

#### Parameters

- `item_id` (path parameter): The ID of the gift card item to update

#### Request Body

```json
{
  "valueType": "VARIABLE_VALUE",
  "minValue": 0.01,
  "maxValue": 1000,
  "rewardName": "(RED) Donation",
  "status": "active",
  "rewardStatus": "active",
  "rewardAvailability": "AVAILABLE",
  "rebateInfo": {
    "providerPercentage": 0,
    "basePercentage": 0,
    "customerPercentage": 1,
    "cpPercentage": 0
  },
  "brand": {
    "id": 456
  }
}
```

Only include the fields you want to update. Fields not included in the request will remain unchanged.

#### Response Format

The response will be the complete updated gift card item in the same format as the GET endpoint.

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses have the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Field Descriptions

### Gift Card Item

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the gift card item |
| valueType | string | Type of value: "FIXED_VALUE" or "VARIABLE_VALUE" |
| minValue | number | Minimum value for variable value gift cards |
| maxValue | number | Maximum value for variable value gift cards |
| rewardName | string | Display name of the gift card item |
| status | string | Status of the item: "active" or "inactive" |
| rewardStatus | string | Status of the reward: "active" or "inactive" |
| rewardAvailability | string | Availability status: "AVAILABLE" or "UNAVAILABLE" |
| rewardType | string | Type of reward: "giftcard" or "offer" |
| providerRewardId | string | External provider's ID for this reward |
| rebateInfo | object | Information about rebate percentages |
| brand | object | Brand information |
| provider | object | Provider information |
| giftCards | object | Gift card information and inventory |

## Usage Examples

### Fetch a specific gift card item

```javascript
const fetchGiftCardItem = async (itemId) => {
  const response = await fetch(`/api/legacy/giftcard-items/${itemId}`);
  const data = await response.json();
  return data;
};
```

### Update a gift card item

```javascript
const updateGiftCardItem = async (itemId, updateData) => {
  const response = await fetch(`/api/legacy/giftcard-items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  const data = await response.json();
  return data;
};
``` 