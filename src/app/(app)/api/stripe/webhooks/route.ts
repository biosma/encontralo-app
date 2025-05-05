import { stripe } from '@/lib/stripe';
import { ExpandedLineItem } from '@/modules/checkout/types';
import config from '@payload-config';
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import Stripe from 'stripe';

export async function POST(req: Request) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get('stripe-signature') as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    if (e instanceof Error) {
      console.error(e);
    }
    console.error(`❌ Error message: ${errorMessage}`);

    return NextResponse.json({ message: `Webhook error: ${errorMessage}` }, { status: 400 });
  }
  console.log(`✅ Event success: ${event.id}`);
  const permittedEvents: string[] = ['checkout.session.completed', 'account.updated'];
  const payload = await getPayload({ config });
  if (permittedEvents.includes(event.type)) {
    let data;
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          data = event.data.object as Stripe.Checkout.Session;
          if (!data.metadata?.userId) throw new Error('User id is required');
          const user = await payload.findByID({
            collection: 'users',
            id: data.metadata.userId,
          });
          if (!user) throw new Error('User not found');
          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ['line_items.data.price.product'],
            },
            {
              stripeAccount: event.account,
            },
          );

          if (!expandedSession.line_items?.data || !expandedSession.line_items?.data.length) {
            throw new Error('No line items found');
          }
          const lineItems = expandedSession.line_items.data as ExpandedLineItem[];

          for (const lineItem of lineItems) {
            await payload.create({
              collection: 'orders',
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                product: lineItem.price.product.metadata.id,
                name: lineItem.price.product.name,
              },
            });
          }
          break;
        case 'account.updated':
          data = event.data.object as Stripe.Account;
          await payload.update({
            collection: 'tenants',
            where: {
              stripeAccountId: {
                equals: data.id,
              },
            },
            data: {
              // This also checks if the tenant loses its stripe details or is deleted
              stripeDetailsSubmitted: data.details_submitted,
            },
          });
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (e) {
      console.log(e);
      return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
    }
  }
  return NextResponse.json({ message: 'Received' }, { status: 200 });
}
