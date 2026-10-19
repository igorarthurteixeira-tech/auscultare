import Stripe from "stripe";
import { PLANS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { planId, userId, origin } = await req.json();

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return new Response("Plano inválido.", { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: plan.price,
            product_data: {
              name: `Auscultare — ${plan.name}`,
              description: plan.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planId, hours: String(plan.hours) },
      success_url: `${origin}/chat?payment=success`,
      cancel_url: `${origin}/chat?payment=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return new Response("Erro ao criar sessão de pagamento.", { status: 500 });
  }
}
