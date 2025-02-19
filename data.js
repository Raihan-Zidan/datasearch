export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
      const url = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}&tbm=nws`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://www.google.com/",
        },
      });

      const html = await response.text();

      // Regex untuk menangkap judul berita
      const titleRegex = /<div class="BNeawe vvjwJb AP7Wnd">([^<]+)<\/div>/gi;
      const titles = [...html.matchAll(titleRegex)].map((match) => match[1]);

      // Regex untuk menangkap sumber berita
      const sourceRegex = /<div class="BNeawe UPmit AP7Wnd">([^<]+)<\/div>/gi;
      const sources = [...html.matchAll(sourceRegex)].map((match) => match[1]);

      // Regex untuk menangkap deskripsi berita
      const descriptionRegex = /<div class="BNeawe s3v9rd AP7Wnd">([^<]+)<\/div>/gi;
      const descriptions = [...html.matchAll(descriptionRegex)].map((match) => match[1]);

      // Regex untuk menangkap link berita
      const linkRegex = /<a href="(https?:\/\/news\.google\.com\/[^"<>]+)"/gi;
      const links = [...html.matchAll(linkRegex)].map((match) => match[1]);

      // Menyiapkan hasil dalam format JSON
      const results = titles.slice(0, 10).map((title, index) => ({
        title: title || "No title",
        source: sources[index] || "Unknown",
        description: descriptions[index] || "No description",
        link: links[index] || "No link",
      }));

      return new Response(JSON.stringify(results, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  },
};
