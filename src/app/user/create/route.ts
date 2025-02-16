import { prisma } from "@p40/app/api/prisma";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, imageUrl } = await req.json();

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        imageUrl,
        whatsapp: null,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
