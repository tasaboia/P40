import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Log from "@p40/services/logging";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const zions = await prisma.zion.findMany();

    const groupedZions = zions.reduce((acc, zion) => {
      if (!acc[zion.region]) acc[zion.region] = [];
      acc[zion.region].push({
        id: zion.id,
        name: zion.name,
        city: zion.city,
        country: zion.country,
      });
      return acc;
    }, {} as Record<string, { id: string; name: string; city: string; country: string }[]>);

    return NextResponse.json(groupedZions, { status: 200 });
  } catch (error) {
    Log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
