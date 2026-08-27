import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabaseRouteClient';
import { createServiceClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (unauthorized) {
    return unauthorized as Response;
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing handout id.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('handouts').update({ status: 'rejected' }).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
