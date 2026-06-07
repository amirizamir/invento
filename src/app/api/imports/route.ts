import { NextRequest } from "next/server";

export { GET } from "../import/route";

export async function POST(request: NextRequest) {
  const { POST: importPost } = await import("../import/route");
  return importPost(request);
}
