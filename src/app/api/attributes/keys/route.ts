import { DataLoader } from "@/app/utils/dataLoader";
import { SupplierAttributeQueryEngine } from "@/app/utils/query-engine/attributes";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const attributes = DataLoader.getAttributes();
    const queryEngine = new SupplierAttributeQueryEngine(attributes);
    const keys = await queryEngine.getKeys();

    return Response.json({ keys });
  } catch (error) {
    console.error("Error retrieving attribute keys:", error);
    return NextResponse.json(
      { error: "Failed to retrieve attribute keys" },
      { status: 500 },
    );
  }
}
