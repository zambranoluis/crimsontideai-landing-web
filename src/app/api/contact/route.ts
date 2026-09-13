import { handleContact } from "./handler";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  return handleContact(request);
}
