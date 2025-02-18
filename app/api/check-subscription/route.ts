import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({error: 'User ID is required'}, {status: 400});
    }

    const profile = await prisma.profile.findUnique({where: {userId}, select: {subscriptionActive: true}});
    return NextResponse.json({subscriptionActive: profile?.subscriptionActive || false});
  } catch (e: any) {
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}