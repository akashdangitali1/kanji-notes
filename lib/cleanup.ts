import { createServiceClient, HANDOUTS_BUCKET } from './supabaseServer';

// Change this single number to adjust how long a handout survives before
// it's permanently deleted (both the PDF file and its database record).
// Currently set low to stay comfortably under Supabase's free 1GB storage cap.
export const RETENTION_DAYS = 5;

export async function cleanupOldHandouts() {
  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: expired, error } = await supabase
    .from('handouts')
    .select('id, pdf_path')
    .lt('created_at', cutoff);

  if (error) throw new Error(`Could not query expired handouts: ${error.message}`);
  if (!expired || expired.length === 0) return { deleted: 0 };

  const paths = expired.map((h) => h.pdf_path);
  const { error: storageError } = await supabase.storage.from(HANDOUTS_BUCKET).remove(paths);
  // Don't hard-fail on a storage error (e.g. a file already missing) — still
  // clean up the database rows so they don't linger forever.
  if (storageError) console.error('Storage cleanup warning:', storageError.message);

  const ids = expired.map((h) => h.id);
  const { error: deleteError } = await supabase.from('handouts').delete().in('id', ids);
  if (deleteError) throw new Error(`Could not delete expired rows: ${deleteError.message}`);

  return { deleted: ids.length };
}
