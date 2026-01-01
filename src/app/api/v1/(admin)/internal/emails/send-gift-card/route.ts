/**
 * Send Gift Card Email API Proxy Route
 *
 * POST /api/v1/internal/emails/send-gift-card
 *
 * Creates a gift card via provider and sends email with claim code.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { forwardRequest, parseBody } from "../../../../_lib/proxy-client";
import { handleError } from "../../../../_lib/errors";

interface SendGiftCardRequest {
  source_id: string;
  source_identifier: string;
  amount: number;
  currency: string;
  recipient_email: string;
  recipient_name: string;
  from_email: string;
  from_name: string;
  subject: string;
  custom_message: string;
}

/**
 * POST /api/v1/internal/emails/send-gift-card
 *
 * Create gift card and send email to recipient.
 * Requires authentication.
 */
export async function POST(request: Request) {
  try {
    // Check Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await parseBody<SendGiftCardRequest>(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Validate required fields
    const requiredFields = [
      "source_id",
      "source_identifier",
      "amount",
      "currency",
      "recipient_email",
      "recipient_name",
      "from_email",
      "from_name",
      "subject",
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof SendGiftCardRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Forward to backend (admin route, no org filtering)
    return forwardRequest(
      {
        method: "POST",
        path: "/v1/internal/emails/send-gift-card",
        body,
      },
      {
        isAdminRoute: true,
        includeOrgId: false,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}
