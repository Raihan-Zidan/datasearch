export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Parameter 'q' diperlukan" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Fungsi untuk generate random string
    function generateRandomString(maxLen) {
      let randomString = '';
      for (let i = 0; i < maxLen; i++) {
        randomString += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      }
      return randomString;
    }

    // Request ke DuckDuckGo API
    const duckduckgoURL = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1&m=${generateRandomString(5)}`;
    
    try {
      const response = await fetch(duckduckgoURL);
      const results = await response.json();

      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // CORS Fix
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Gagal mengambil data dari DuckDuckGo" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  },
};
