import { Metadata, ResolvingMetadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

// Fetch photo and votes directly from Supabase for SSR
async function getPhotoData(id: string) {
  const { data: photo, error: photoError } = await supabase
    .from("photos")
    .select("id, url")
    .eq("id", id)
    .single();

  if (photoError || !photo) {
    return null;
  }

  // Count votes
  const { count: superGayCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", id)
    .eq("is_super_gay", true);

  const { count: noGayCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", id)
    .eq("is_super_gay", false);

  const superVotes = superGayCount || 0;
  const noVotes = noGayCount || 0;
  const totalVotes = superVotes + noVotes;
  const vibeScore = totalVotes > 0 ? Math.round((superVotes / totalVotes) * 100) : 0;

  return { photo, vibeScore, totalVotes };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const data = await getPhotoData(params.id);

  if (!data) {
    return {
      title: "Foto no encontrada | GAYMOMETRO",
    };
  }

  const title = `¡Mira mi resultado en GAYMOMETRO! (${data.vibeScore}% GAY)`;
  const description = `Basado en ${data.totalVotes} votos. ¿Tú qué opinas? ¡Entra a GAYMOMETRO y descubre tu propio porcentaje!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const data = await getPhotoData(params.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-white dark:bg-[#0a0a0a]">
      <div className="w-full max-w-sm mx-auto text-center">
        <h1 className="text-3xl font-black tracking-widest bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] bg-clip-text text-transparent mb-6">
          GAYMOMETRO
        </h1>

        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl mb-8 border border-gray-200 dark:border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.photo.url}
            alt="User photo"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <p className="text-white font-black text-2xl drop-shadow-lg">
              Veredicto: {data.vibeScore}% GAY 🦄
            </p>
            <p className="text-white/80 text-sm mt-1">
              Basado en {data.totalVotes} votos
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Estás de acuerdo con el resultado?
        </h2>
        
        <Link 
          href="/"
          className="block w-full py-4 bg-[linear-gradient(90deg,#FF0018,#FFA52C,#FFFF41,#008018,#0000F9,#86007D)] rounded-2xl font-black shadow-xl text-black hover:scale-[1.02] active:scale-95 transition-transform text-lg"
        >
          ¡Jugar ahora!
        </Link>
      </div>
    </div>
  );
}
