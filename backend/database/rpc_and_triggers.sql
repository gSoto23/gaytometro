-- 1. Trigger for auto-incrementing votes
CREATE OR REPLACE FUNCTION increment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_super_gay = TRUE THEN
        UPDATE public.photos SET super_gay_votes = super_gay_votes + 1 WHERE id = NEW.photo_id;
    ELSE
        UPDATE public.photos SET no_gay_votes = no_gay_votes + 1 WHERE id = NEW.photo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_vote_counts
AFTER INSERT ON public.votes
FOR EACH ROW EXECUTE FUNCTION increment_vote_counts();

-- 2. RPC to get 10 random unvoted photos
CREATE OR REPLACE FUNCTION get_unvoted_photos()
RETURNS SETOF public.photos AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.photos p
    WHERE p.is_active = TRUE
      AND p.user_id != auth.uid() -- No retornar las fotos del propio usuario
      AND NOT EXISTS (
          SELECT 1
          FROM public.votes v
          WHERE v.photo_id = p.id
            AND v.user_id = auth.uid()
      )
    ORDER BY random()
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
