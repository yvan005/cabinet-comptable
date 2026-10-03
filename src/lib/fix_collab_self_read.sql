-- ============================================================
-- Correctif : un collaborateur doit pouvoir lire SA PROPRE ligne
-- dans "collaborateurs", même sans la permission "collab"."voir",
-- car l'app en a besoin pour charger ses propres permissions
-- juste après la connexion (sinon il est déconnecté aussitôt).
-- ============================================================

drop policy if exists "collab_select" on collaborateurs;

create policy "collab_select" on collaborateurs for select to authenticated using (
  has_permission('collab', 'voir')
  or email = auth.jwt() ->> 'email'
);
