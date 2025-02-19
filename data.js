export default {
  async fetch(request) {
    try {
      const searchQuery = "chickens"; // Kata kunci pencarian
      const url = `https://www.google.com/search?q=${encodeURIComponent(
        searchQuery
      )}&tbm=isch`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const html = await response.text();

      // Menggunakan regex untuk menangkap URL gambar
      const imageRegex = /"https:\/\/[^"]*\.gstatic\.com[^"]*"/g;
      const images = [...html.matchAll(imageRegex)].map((match) =>
        match[0].replace(/"/g, "")
      );

      // Menggunakan regex untuk menangkap link halaman sumber
      const pageRegex = /"https?:\/\/[^"]*"/g;
      const pages = [...html.matchAll(pageRegex)].map((match) =>
        match[0].replace(/"/g, "")
      );

      // Menggunakan regex untuk menangkap judul gambar
      const titleRegex = /<div class=".*?">([^<]+)<\/div>/g;
      const titles = [...html.matchAll(titleRegex)].map((match) => match[1]);

      // Menggunakan regex untuk menangkap sumber website
      const sourceRegex = /<span class="rQMQod Xb5VRe">([^<]+)<\/span>/g;
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
