export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), { status: 400 });
    }

    const apiKey = env.GOOGLE_API_KEY;  // Pastikan ini sesuai dengan Cloudflare Worker
    const cx = env.GOOGLE_CX;
    console.log("GOOGLE_API_KEY:", env.GOOGLE_API_KEY);
console.log("GOOGLE_CX:", env.GOOGLE_CX);

    if (!apiKey || !cx) {
      return new Response(JSON.stringify({ error: "API Key or CX is missing in Worker Environment" }), { status: 500 });
    }

    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${cx}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch from Google API", details: error.message }), {
        status: 500,
      });
    }
  }
};
