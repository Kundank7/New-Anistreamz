import { AnimeService } from "@/lib/services/anime";
import globalDb from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = globalDb;
    if (!db) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Get a random anime slug from the database
    // Only pick from anime that have at least one episode
    const randomAnime = db.prepare(`
      SELECT slug 
      FROM anime a 
      WHERE EXISTS (SELECT 1 FROM episodes WHERE anime_id = a.id)
      ORDER BY RANDOM() 
      LIMIT 1
    `).get() as { slug: string } | undefined;

    if (!randomAnime) {
      return NextResponse.json({ error: "No anime found" }, { status: 404 });
    }

    return NextResponse.json({ slug: randomAnime.slug });
  } catch (error) {
    console.error("Error fetching random anime:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
