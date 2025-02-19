export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const engine = searchParams.get("engine") || "google"; // Default ke Google

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    let searchUrl;
    switch (engine) {
      case "google":
        searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
        break;
      case "bing":
        searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
        break;
      case "ecosia":
        searchUrl = `https://www.ecosia.org/images?q=${encodeURIComponent(query)}`;
        break;
      case "brave":
        searchUrl = `https://search.brave.com/images?q=${encodeURIComponent(query)}`;
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid search engine" }), { status: 400 });
    }

    const response = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await response.text();

    // Regex untuk mendapatkan URL gambar, judul, dan deskripsi
    const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/[^"]+\.(jpg|jpeg|png|gif|webp))"[^>]+alt="([^"]*)"[^>]*>/g)];

    const images = imageMatches.map(match => ({
      url: match[1],                  // URL gambar
      title: match[2] || "No Title",  // Judul dari atribut alt
      description: match[2] || "No Description" // Deskripsi dari atribut alt
    }));

    return new Response(JSON.stringify({ engine, images }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
