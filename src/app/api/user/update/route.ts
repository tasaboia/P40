import { NextResponse } from "next/server";
import { prisma } from "../../prisma";

export async function POST(req: Request) {
  try {
    const { id, name, email, whatsapp, zionId } = await req.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    let whatsappFormatted;

    if (whatsapp) {
      whatsappFormatted = whatsapp.replace(/\s+/g, "").replace(/\+/g, "");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        whatsapp: whatsappFormatted,
        onboarding: true,
        churchId: zionId,
      },
    });

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
