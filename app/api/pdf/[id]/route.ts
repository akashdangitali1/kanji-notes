import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabaseRouteClient';
import { createServiceClient, HANDOUTS_BUCKET } from '@/lib/supabaseServer';

// Serves the raw PDF for a handout. Approved handouts are viewable by anyone
// (that's the whole point of the archive); pending/rejected ones are only
// viewable by a logged-in admin, so a guessed/shared link can't leak an
// unreviewed upload.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const service = createServiceClient();

  const { data: handout, error } = await service
    .from('handouts')
    .select('pdf_path, status, title')
    .eq('id', params.id)
    .single();

  if (error || !handout) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  if (handout.status !== 'approved') {
    const routeClient = createRouteClient();
    const { data: userData } = await routeClient.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: 'Not available yet.' }, { status: 403 });
    }
  }

  const { data: fileData, error: downloadError } = await service.storage
    .from(HANDOUTS_BUCKET)
    .download(handout.pdf_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Could not load the file.' }, { status: 500 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(handout.title || 'handout')}.pdf"`,
      'Cache-Control': handout.status === 'approved' ? 'public, max-age=3600' : 'no-store',
    },
  });
}
