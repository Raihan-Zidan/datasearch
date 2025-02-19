export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
      const url = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}&tbm=isch`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://www.google.com/",
        },
      });

      const html = await response.text();

      // Regex untuk menangkap URL gambar dari berbagai sumber
      const imageRegex = /"(https?:\/\/[^"<>]+\.(?:jpg|jpeg|png|gif|bmp|webp))"/gi;
      const images = [...html.matchAll(imageRegex)].map((match) => match[1]);

      // Regex untuk menangkap link halaman sumber
      const pageRegex = /"(https?:\/\/[^"<>]+)"/gi;
      const pages = [...html.matchAll(pageRegex)].map((match) => match[1]);

      // Regex untuk menangkap judul gambar
      const titleRegex = /<div class=".*?">([^<]+)<\/div>/gi;
      const titles = [...html.matchAll(titleRegex)].map((match) => match[1]);

      // Regex untuk menangkap sumber website
      const sourceRegex = /<span class="rQMQod Xb5VRe">([^<]+)<\/span>/gi;
      const sources = [...html.matchAll(sourceRegex)].map((match) => match[1]);

      // Menyiapkan hasil dalam format JSON
      const results = images.slice(0, 10).map((img, index) => ({
        image_url: img,
        title: titles[index] || "No title",
        source: sources[index] || "Unknown",
        page_url: pages[index] || "No link",
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
