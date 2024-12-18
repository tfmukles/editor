import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const abc = await request.json();
  return NextResponse.json({ message: "requested webhook" });
};
