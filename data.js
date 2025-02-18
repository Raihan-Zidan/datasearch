export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter is required" }), { status: 400 });
    }

    const searchUrl = `https://duckduckgo.com/i.js?l=us-en&q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch images" }), { status: 500 });
    }

    const data = await response.json();
    const images = data.results.map(img => ({
      title: img.title || "No Title",  // Judul gambar
      image_url: img.image,            // URL gambar asli
      thumbnail: img.thumbnail,        // Thumbnail kecil
      source: img.url                  // Sumber halaman asli
    }));

    return new Response(JSON.stringify({ query, images }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
