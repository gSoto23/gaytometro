DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.photos CASCADE;

-- Supabase Schema for Gaytometro

-- 1. Create Photos Table
CREATE TABLE public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    super_gay_votes INTEGER DEFAULT 0,
    no_gay_votes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Votes Table (To prevent duplicate voting)
CREATE TABLE public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_super_gay BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(photo_id, user_id) -- Garantiza que un usuario no vote dos veces por la misma foto
);

-- 3. Create Reports Table (For moderation)
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(photo_id, reporter_id) -- Un usuario solo puede reportar una foto una vez
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Photos: Anyone can read active photos, only owners can insert/delete
CREATE POLICY "Fotos activas son publicas" ON public.photos FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Usuarios pueden ver sus propias fotos" ON public.photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden subir fotos" ON public.photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden borrar sus fotos" ON public.photos FOR DELETE USING (auth.uid() = user_id);

-- Votes: Users can insert their own votes
CREATE POLICY "Usuarios pueden votar" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden ver todos los votos" ON public.votes FOR SELECT USING (true);

-- Reports: Users can insert reports
CREATE POLICY "Usuarios pueden reportar" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 6. Trigger for Auto-Moderation (Hide photo immediately if reported)
CREATE OR REPLACE FUNCTION auto_hide_reported_photo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.photos SET is_active = FALSE WHERE id = NEW.photo_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hide_photo_on_report
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION auto_hide_reported_photo();
