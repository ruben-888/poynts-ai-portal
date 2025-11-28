import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllClients } from "@/app/api/services/clients/get-all-clients";
import { createNewClient } from "@/app/api/services/clients/create-new-client";
import { updateSingleClient } from "@/app/api/services/clients/update-single-client";
import { UserContext, extractUserContext } from "../../_shared/types";

export async function GET() {
  try {
    const { has } = await auth();
    const canReadClients = has({ permission: "org:clients:view" });
    if (!canReadClients) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getAllClients();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch client data" },
      { status: 500 }
    );
  }
}

// Add POST endpoint for creating new clients
export async function POST(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();
    const canCreateClient = has({ permission: "org:clients:manage" });
    if (!canCreateClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    try {
      const newClient = await createNewClient(data, userContext);

      return NextResponse.json(
        {
          message: "Client created successfully",
          client: newClient,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

// Add PUT endpoint for updating clients
export async function PUT(request: Request) {
  try {
    const { has, userId, sessionClaims } = await auth();

    const canUpdateClient = has({ permission: "org:clients:manage" });
    if (!canUpdateClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // Extract user context from session claims
    const userContext = extractUserContext(userId, sessionClaims);

    try {
      const updatedClient = await updateSingleClient(data, userContext);

      return NextResponse.json({
        message: "Client updated successfully",
        client: updatedClient,
      });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// TODO: Add DELETE / ARCHIVE endpoint for removing clients
export async function DELETE(request: Request) {
  try {
    const { has } = await auth();

    const canDeleteClient = has({ permission: "org:clients:manage" });
    if (!canDeleteClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // TODO: Add validation for client data
    // TODO: Add database operation to delete client

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
