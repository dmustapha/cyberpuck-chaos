import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://air-hockey-base.vercel.app';

  return NextResponse.json({
    accountAssociation: {
      header: "eyJmaWQiOjExMTc3NTksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhlZDcwMzZEMjU0NkJiY2U4OEE1NWNlM0YzRDBGODU3QTU2RUMyZTQ5In0",
      payload: "eyJkb21haW4iOiJhaXItaG9ja2V5LWJhc2UudmVyY2VsLmFwcCJ9",
      signature: "hhvdoAuxz0/n3P7abAx0IUiRqdsVao2J/VbBUjtcWKxhDHiwgg40/Mx3SsQM9Qk0bRfnLXsgR5UaUOxLa+HwUhw=",
    },
    frame: {
      version: "1",
      name: "Cyber Air Hockey",
      homeUrl: appUrl,
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0a0a0f",
      webhookUrl: `${appUrl}/api/farcaster/webhook`,
    },
  });
}
