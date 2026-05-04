import Stripe from "stripe";
import { addBalance, markFreeTrialUsed } from "@/lib/balance";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Webhook signature invalid.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, hours } = session.metadata ?? {};
    if (userId && hours) {
      const seconds = parseInt(hours) * 3600;
      await addBalance(userId, seconds);
      await markFreeTrialUsed(userId);
    }
  }

  return new Response("ok");
}
