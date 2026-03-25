import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Farcaster Mini App Webhook
 *
 * Handles events from Farcaster:
 * - frame_added: User added the Mini App
 * - frame_removed: User removed the Mini App
 * - notifications_enabled: User enabled notifications
 * - notifications_disabled: User disabled notifications
 */

interface WebhookEvent {
  event: string;
  fid?: number;
  notificationDetails?: {
    url: string;
    token: string;
  };
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.FARCASTER_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = request.headers.get('X-Farcaster-Signature');
      if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.warn('[Farcaster Webhook] FARCASTER_WEBHOOK_SECRET not configured, skipping signature verification');
    }

    const body = JSON.parse(rawBody) as WebhookEvent;

    switch (body.event) {
      case 'frame_added':
        console.log(`[Farcaster Webhook] User ${body.fid} added Mini App`);
        break;

      case 'frame_removed':
        console.log(`[Farcaster Webhook] User ${body.fid} removed Mini App`);
        break;

      case 'notifications_enabled':
        console.log(`[Farcaster Webhook] User ${body.fid} enabled notifications`);
        // Store notification token for future push notifications
        if (body.notificationDetails) {
          console.log(`[Farcaster Webhook] Notification URL: ${body.notificationDetails.url}`);
        }
        break;

      case 'notifications_disabled':
        console.log(`[Farcaster Webhook] User ${body.fid} disabled notifications`);
        break;

      default:
        console.log(`[Farcaster Webhook] Unknown event: ${body.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Farcaster Webhook] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
