import { NextResponse } from "next/server";
import { prisma } from "../prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("userId");
  const churchId = searchParams.get("churchId");

  try {
    let user;
    if (churchId) {
      user = await prisma.user.findMany({
        where: { churchId },
      });
      return NextResponse.json({ success: true, users: user }, { status: 200 });
    } else if (id) {
      user = await prisma.user.findFirst({
        where: { id },
      });
      return NextResponse.json({ success: true, user: user }, { status: 200 });
    }
    return NextResponse.json({ success: true, user: null }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
