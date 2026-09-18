
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE SELECT (author_id) ON public.posts FROM authenticated;
REVOKE SELECT (author_id) ON public.comments FROM authenticated;

DROP VIEW public.posts_public;
DROP VIEW public.comments_public;

CREATE VIEW public.posts_public AS
SELECT
  p.id,
  p.created_at,
  p.category,
  p.content,
  p.is_anonymous,
  (p.author_id = auth.uid()) AS is_mine,
  CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END AS author_id,
  CASE WHEN p.is_anonymous THEN NULL ELSE pr.display_name END AS display_name,
  CASE WHEN p.is_anonymous THEN NULL ELSE pr.avatar_url END AS avatar_url
FROM public.posts p
LEFT JOIN public.profiles pr ON pr.id = p.author_id;
GRANT SELECT ON public.posts_public TO authenticated;

CREATE VIEW public.comments_public AS
SELECT
  c.id,
  c.post_id,
  c.parent_id,
  c.created_at,
  c.content,
  c.is_anonymous,
  (c.author_id = auth.uid()) AS is_mine,
  CASE WHEN c.is_anonymous THEN NULL ELSE c.author_id END AS author_id,
  CASE WHEN c.is_anonymous THEN NULL ELSE pr.display_name END AS display_name,
  CASE WHEN c.is_anonymous THEN NULL ELSE pr.avatar_url END AS avatar_url
FROM public.comments c
LEFT JOIN public.profiles pr ON pr.id = c.author_id;
GRANT SELECT ON public.comments_public TO authenticated;
