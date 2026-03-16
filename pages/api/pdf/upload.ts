import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import formidable from "formidable";
import fs from "fs";
import { extractTextFromPDF } from "@/lib/pdf";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const files = await new Promise<formidable.Files>((resolve, reject) => {
      const form = formidable();

      form.parse(req, (err, _fields, parsedFiles) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(parsedFiles);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files allowed" });
    }

    const buffer = fs.readFileSync(file.filepath);
    const text = await extractTextFromPDF(buffer);

    console.log("PDF TEXT LENGTH:", text.length);

    return res.status(200).json({
      message: "PDF processed successfully",
      text,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return res.status(500).json({ error: "Failed to process PDF upload" });
  }
}
