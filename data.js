export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();
    
    // Regex sederhana untuk mencari URL gambar
    const imageUrls = [...html.matchAll(/"image":"(https:\/\/[^"]+)"/g)].map(match => match[1]);

    return new Response(JSON.stringify({ images: imageUrls }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
