import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const languages = await prisma.language.findMany();
    res.status(200).json(languages);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
