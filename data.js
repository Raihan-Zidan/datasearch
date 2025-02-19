export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    const url = `https://search.brave.com/images?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await response.text();

    // Regex untuk menangkap URL gambar, judul (alt/title)
    const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/[^"]+\.(jpg|jpeg|png|gif))"[^>]+(alt="([^"]*)")?[^>]*(title="([^"]*)")?/g)];

    // Buat array gambar dengan info lengkap
    const images = imageMatches.map(match => ({
      url: match[1],                     // URL gambar
      title: match[3] || match[5] || "No Title",  // Gunakan alt atau title (jika ada)
      description: match[3] || match[5] || "No Description" // Gunakan alt atau title (jika ada)
    }));

    return new Response(JSON.stringify({ images }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
