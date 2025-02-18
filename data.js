export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter is required" }), { status: 400 });
    }

    const apiKey = "YOUR_SCRAPERAPI_KEY";  // Ganti dengan API Key dari ScraperAPI
    const duckduckgoUrl = `https://duckduckgo.com/i.js?l=us-en&q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(duckduckgoUrl)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch images via proxy" }), { status: 500 });
    }

    const data = await response.json();
    const images = data.results.map(img => ({
      title: img.title || "No Title",
      image_url: img.image,
      thumbnail: img.thumbnail,
      source: img.url
    }));

    return new Response(JSON.stringify({ query, images }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
