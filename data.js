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
    
    // Regex untuk mengambil URL gambar
    const imageUrls = [...html.matchAll(/"https:\/\/[^"]+\.(jpg|jpeg|png|gif)"/g)].map(match => match[0].replace(/"/g, ""));

    return new Response(JSON.stringify({ images: imageUrls }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
