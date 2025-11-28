# Gift Card Item Detail API

This API provides endpoints to retrieve and update a specific gift card item by ID.

## Endpoints

### Get Gift Card Item

```
GET /api/legacy/giftcard-items/[item_id]
```

Retrieves a specific gift card item by ID with its associated brand, provider, and gift cards.

#### Parameters

- `item_id` (path parameter): The ID of the gift card item to retrieve

#### Response Format

The response is the complete gift card item object:

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

The request body should contain only the fields you want to update:

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

Fields not included in the request will remain unchanged.

#### Response Format

The response will be the complete updated gift card item with the same format as the GET endpoint.

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters or ID mismatch
- `404 Not Found`: Gift card item not found
- `500 Internal Server Error`: Server error

Error responses have the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Usage Examples

### Fetch a specific gift card item

```javascript
const fetchGiftCardItem = async (itemId) => {
  try {
    const response = await fetch(`/api/legacy/giftcard-items/${itemId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch gift card item');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching gift card item:', error);
    throw error;
  }
};
```

### Update a gift card item

```javascript
const updateGiftCardItem = async (itemId, updateData) => {
  try {
    const response = await fetch(`/api/legacy/giftcard-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update gift card item');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating gift card item:', error);
    throw error;
  }
};
```

## Implementation Notes

- The GET endpoint returns the gift card item directly at the root level (not nested under a data key)
- The PUT endpoint only updates the fields provided in the request
- After updating, the complete updated gift card item is fetched and returned
- The endpoint validates that the ID in the path matches the ID in the body (if provided)
- Empty gift card arrays are handled safely to prevent errors 