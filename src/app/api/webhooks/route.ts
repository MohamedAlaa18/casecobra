import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import OrderReceivedEmail from "@/components/email/OrderReceivedEmail";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = headers().get("stripe-signature");

        if (!signature) {
            return new Response('Invalid signature', { status: 400 });
        }

        const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
        console.log(JSON.stringify(event, null, 2));

        if (event.type === 'checkout.session.completed') {
            const customerDetails = event.data.object.customer_details;
            if (!customerDetails?.email) {
                throw new Error('Missing user email');
            }

            const session = event.data.object as Stripe.Checkout.Session;
            const { userId, orderId } = session.metadata || { userId: null, orderId: null };

            if (!userId || !orderId) {
                throw new Error('Invalid request metadata');
            }

            const shippingDetails = event.data.object.shipping_details;
            const billingAddress = customerDetails.address;
            const shippingAddress = shippingDetails?.address;

            const updatedOrder = await db.order.update({
                where: { id: orderId },
                data: {
                    isPaid: true,
                    ShippingAddress: {
                        create: {
                            name: customerDetails.name!,
                            city: shippingAddress?.city || '',
                            country: shippingAddress?.country || '',
                            postalCode: shippingAddress?.postal_code || '',
                            street: shippingAddress?.line1 || '',
                            state: shippingAddress?.state || '',
                        },
                    },
                    BillingAddress: {
                        create: {
                            name: customerDetails.name!,
                            city: billingAddress?.city || '',
                            country: billingAddress?.country || '',
                            postalCode: billingAddress?.postal_code || '',
                            street: billingAddress?.line1 || '',
                            state: billingAddress?.state || '',
                        },
                    },
                },
            });

            await resend.emails.send({
                from: "cobraCover <mohamed.alaa.elhefny@gmail.com>",
                to: [customerDetails.email],
                subject: 'Thanks for your order!',
                react: OrderReceivedEmail({
                    orderId,
                    orderDate: updatedOrder.createdAt.toLocaleDateString(),
                     // @ts-ignore
                    shippingAddress: {
                        name: customerDetails.name!,
                        city: shippingAddress?.city || '',
                        country: shippingAddress?.country || '',
                        postalCode: shippingAddress?.postal_code || '',
                        street: shippingAddress?.line1 || '',
                        state: shippingAddress?.state || '',
                    },
                }),
            });
        }

        return NextResponse.json({ result: event, ok: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: 'Something went wrong', ok: false },
            { status: 500 }
        );
    }
}
