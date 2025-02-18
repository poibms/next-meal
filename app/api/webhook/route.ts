import {NextRequest, NextResponse} from "next/server";
import Stripe from 'stripe';
import {stripe} from "@/lib/stripe";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret);
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 400});
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'invoice.payment_failed': {
        const session = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(session);

      }
      case 'customer.subscription.deleted': {
        const session = event.data.object as Stripe.Subscription
        await handleCustomerSubscriptionDeleted(session);
      }

      default:
        console.log('Unhandled event type', event.type);
    }
  } catch (e: any) {
    return NextResponse.json({error: e.message}, {status: 500});
  }

  return NextResponse.json({});
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.clerkUserId;
  if (!userId) {
    console.log('No user ID');
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.log('No subscription ID');
    return;
  }

  try {
    await prisma.profile.update({where: {userId},
      data: {
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        subscriptionTier: session.metadata?.planType
      }
    });
  } catch (e: any) {
    console.error('Failed to update user profile', e.message)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoice.subscription as string;
  if(!subId) {
    return;
  }

  let userId: string | undefined;

  try{
    const profile = await prisma.profile.findUnique({where: {stripeSubscriptionId: subId}, select: {userId: true}});
    if(!profile) {
      console.log('No profile found');
      return;
    }
    userId = profile.userId;
  } catch(e: any) {
    console.log(e.message)
    return
  }

  try {
    await prisma.profile.update({where: {userId}, data: {subscriptionActive: false}});
  } catch(e: any) {
    console.log(e.message)
  }
}

async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  let userId: string | undefined;
  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true },
    });

    if (!profile?.userId) {
      console.error("No profile found for this subscription ID.");
      return;
    }

    userId = profile.userId;
  } catch (error: any) {
    console.error("Prisma Query Error:", error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        subscriptionActive: false,
        stripeSubscriptionId: null,
      },
    });
    console.log(`Subscription canceled for user: ${userId}`);
  } catch (error: any) {
    console.error("Prisma Update Error:", error.message);
  }
}