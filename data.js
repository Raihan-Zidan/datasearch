export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q"); // Ambil query dari parameter URL

    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = env.GOOGLE_API_KEY; // Ambil API Key dari environment variable
    const cx = env.GOOGLE_CX; // Ambil Custom Search Engine ID dari environment variable

    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

    try {
      const googleResponse = await fetch(searchUrl);
      const data = await googleResponse.json();

      return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch data from Google API" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
