import { NextRequest } from "next/server";
import { saveResultHandler } from "@/lib/results/save-result";

export async function POST(req: NextRequest) {
  return saveResultHandler(req);
}
