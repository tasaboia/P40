import FormData from "form-data";
import fetch from "node-fetch";
import { prisma } from "../prisma";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("blob upload completed", blob, tokenPayload);

        try {
        } catch (error) {
          throw new Error("Could not update user");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: "eventId não fornecido" },
      { status: 400 }
    );
  }

  try {
    const dailyPrayerTopics = await prisma.dailyPrayerTopic.findMany({
      where: { eventId },
      include: { event: true },
    });

    return NextResponse.json({
      success: true,
      data: dailyPrayerTopics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, res) {
  try {
    const { id } = req.query;

    const dailyPrayerTopic = await prisma.dailyPrayerTopic.findUnique({
      where: {
        id: id,
      },
    });

    if (!dailyPrayerTopic) {
      return res.status(404).json({ error: "Tópico não encontrado" });
    }

    if (dailyPrayerTopic.imageUrl) {
      const imageUrl = dailyPrayerTopic.imageUrl;
      const fileName = imageUrl.split("/").pop();

      await fetch(`${process.env.NEXT_PUBLIC_STORAGE_URL}/delete/${fileName}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      });
    }

    await prisma.dailyPrayerTopic.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      data: "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    // Garantir que o body da requisição está correto
    const { id, eventId, description, date, imageUrl } = await req.json();

    // Verifique se o id está presente
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id não fornecido",
        },
        { status: 400 }
      );
    }

    // Agora, vamos garantir que a função `upsert` vai funcionar
    const updatedOrCreatedTopic = await prisma.dailyPrayerTopic.upsert({
      where: { id }, // id é a chave primária
      update: {
        eventId,
        description,
        date: new Date(date), // Verifique se a data é válida
        imageUrl,
      },
      create: {
        id, // Criação de um novo tópico
        eventId,
        description,
        date: new Date(date), // Certifique-se que a data é válida
        imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrCreatedTopic,
    });
  } catch (error) {
    console.error("Erro ao atualizar ou criar o tópico:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
