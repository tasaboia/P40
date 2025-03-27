import { NextResponse } from "next/server";
import { prisma } from "../prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("userId");
  try {
      const user = await prisma.user.findFirst({
        where: { id },
      });
      return NextResponse.json({ success: true, user: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
