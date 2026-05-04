-- =============================================================
-- Supabase Storage setup para branding de barberías
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- =============================================================

-- 1. Crear bucket público "branding"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  3145728, -- 3 MB
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Policy: cualquier autenticado puede subir a su org (path empieza con {orgId}/)
--    donde orgId está en sus memberships.
DROP POLICY IF EXISTS "branding upload by org member" ON storage.objects;
CREATE POLICY "branding upload by org member"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM memberships
    WHERE user_id = auth.uid()
  )
);

-- 3. Policy: leer públicamente (el bucket es público de todas formas,
--    pero esto permite que Next.js sirva imágenes server-side sin auth)
DROP POLICY IF EXISTS "branding read public" ON storage.objects;
CREATE POLICY "branding read public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'branding');

-- 4. Policy: borrar solo si eres miembro de esa org
DROP POLICY IF EXISTS "branding delete by org member" ON storage.objects;
CREATE POLICY "branding delete by org member"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM memberships
    WHERE user_id = auth.uid()
  )
);

-- 5. Policy: actualizar (reemplazar) solo si eres miembro
DROP POLICY IF EXISTS "branding update by org member" ON storage.objects;
CREATE POLICY "branding update by org member"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM memberships
    WHERE user_id = auth.uid()
  )
);
