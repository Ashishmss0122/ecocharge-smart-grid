DROP POLICY IF EXISTS "public read chargers" ON public.chargers;
CREATE POLICY "public read chargers" ON public.chargers
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.stations s WHERE s.id = chargers.station_id AND s.status = 'approved'));

DROP POLICY IF EXISTS "public read reviews" ON public.reviews;
CREATE POLICY "public read reviews" ON public.reviews
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.stations s WHERE s.id = reviews.station_id AND s.status = 'approved'));

CREATE POLICY "own reviews read" ON public.reviews
FOR SELECT TO authenticated
USING (user_id = auth.uid());

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owns_station(uuid, uuid) FROM anon, authenticated;