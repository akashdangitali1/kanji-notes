import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, HANDOUTS_BUCKET } from '@/lib/supabaseServer';

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB — generous for a phone photo of a page

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const title = (formData.get('title') as string | null)?.trim() || 'Untitled handout';
    const classDate = (formData.get('class_date') as string | null) || null;
    const uploaderName = (formData.get('uploader_name') as string | null)?.trim() || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was attached.' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 15MB).' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const path = `${crypto.randomUUID()}.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(HANDOUTS_BUCKET)
      .upload(path, buffer, { contentType: 'application/pdf' });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data, error: insertError } = await supabase
      .from('handouts')
      .insert({
        title,
        class_date: classDate,
        uploader_name: uploaderName,
        pdf_path: path,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json({ error: `Could not save record: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, message: 'Uploaded. Waiting on admin approval.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong during upload.' }, { status: 500 });
  }
}
