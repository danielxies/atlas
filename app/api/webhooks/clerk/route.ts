import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const payload = await req.json();
  const svixHeaders = headers();
  const rawHeaders = Object.fromEntries(svixHeaders.entries());
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const event = wh.verify(payload, rawHeaders) as {
      data: { id: string; email_addresses: { email_address: string }[] };
      type: string;
    };

    if (event.type === 'user.created') {
      await supabase.from('user_profiles').upsert({
        clerk_id: event.data.id,
        email: event.data.email_addresses[0].email_address,
        created_at: new Date(),
      });
    }

    return new Response('Success', { status: 200 });
  } catch (err) {
    return new Response('Error', { status: 400 });
  }
}
