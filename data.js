export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "chickens"; // Default query: "chickens"
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://www.google.com/",
        },
      });

      const html = await response.text();

      // Menggunakan HTMLRewriter untuk parsing HTML (lebih akurat dari regex)
      let images = [];

      new HTML
