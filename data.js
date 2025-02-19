export default {
  async fetch(request) {
    try {
      // Ambil query dari URL, default "chickens" jika tidak ada
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "chickens";

      // Buat URL Google Images
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

      // Fetch halaman Google Images dengan header yang benar
      const response = await fetch(googleUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://www.google.com/",
        },
      });

      // Ambil HTML dari response
      const html = await response.text();

      // Gunakan regex untuk menangkap data gambar dari script Google
      const match = html.match(/AF_initDataCallback\((.*?)\);<\/script>/s);
      if (!match) {
        throw new Error("Gagal menemukan data gambar. Google mungkin mengubah format.");
      }

      // Parse JSON dari data yang ditemukan
      const jsonData = JSON.parse(match[1].replace(/^[^{]+/, "").replace(/;$/, ""));

      // Ambil bagian yang berisi data gambar
      const imagesData = jsonData?.data?.[31]?.[0]?.[12]?.[2] || [];

      // Ubah data menjadi format JSON yang bersih
      const results = imagesData.slice(0, 10).map((item) => ({
        image_url: item?.[1]?.[3]?.[0]?.[0] || null,
        title: item?.[1]?.[9]?.[2003]?.[3]?.[0] || "No title",
        source: item?.[1]?.[9]?.[2003]?.[2] || "Unknown",
        page_url: item?.[1]?.[9]?.[2003]?.[0] || "No link",
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
