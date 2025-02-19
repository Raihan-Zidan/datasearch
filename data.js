export default {
  async fetch(request) {
    try {
      // Ambil query pencarian dari URL, default = "chickens"
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "chickens";
      
      // URL pencarian Google Images
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

      // Ambil halaman Google Images
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      // Konversi ke teks HTML
      const html = await response.text();

      // Cari JSON yang berisi data gambar
      const match = html.match(/AF_initDataCallback\((.*?)\);<\/script>/);
      if (!match) {
        throw new Error("Data tidak ditemukan, Google mungkin telah memperbarui struktur halaman.");
      }

      // Parse JSON dengan format Google
      const jsonData = JSON.parse(match[1]);

      // Cari array yang berisi gambar
      const imageDataArray = jsonData?.data?.[31]?.[0]?.[12]?.[2] || [];

      // Ambil data gambar yang relevan
      const results = imageDataArray.slice(0, 10).map((data) => ({
        image_url: data[1]?.[3]?.[0]?.[0] || null, // URL gambar asli
        title: data[1]?.[9]?.[2003]?.[3]?.[0] || "No title", // Judul gambar
        source: data[1]?.[9]?.[2003]?.[2] || "Unknown", // Sumber website
        page_url: data[1]?.[9]?.[2003]?.[0] || "No link", // Link halaman asli
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
