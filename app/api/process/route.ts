import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabaseRouteClient';
import { createServiceClient, HANDOUTS_BUCKET } from '@/lib/supabaseServer';
import { extractFromPdf } from '@/lib/gemini';

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

  const { data: handout, error: fetchError } = await supabase
    .from('handouts')
    .select('id, pdf_path')
    .eq('id', id)
    .single();

  if (fetchError || !handout) {
    return NextResponse.json({ error: 'Handout not found.' }, { status: 404 });
  }

  await supabase.from('handouts').update({ status: 'processing' }).eq('id', id);

  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(HANDOUTS_BUCKET)
      .download(handout.pdf_path);

    if (downloadError || !fileData) {
      throw new Error(downloadError?.message ?? 'Could not download the PDF from storage.');
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const extracted = await extractFromPdf(buffer);

    const { error: updateError } = await supabase
      .from('handouts')
      .update({ status: 'approved', extracted, error_message: null })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ ok: true, extracted });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown processing error.';
    await supabase.from('handouts').update({ status: 'failed', error_message: message }).eq('id', id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
