export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    const url = `https://search.brave.com/images?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await response.text();

    // Regex untuk mengambil URL gambar, judul, dan deskripsi
    const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/[^"]+\.(jpg|jpeg|png|gif))"[^>]+alt="([^"]*)"[^>]*>/g)];

    // Ambil data gambar dari hasil regex
    let images = imageMatches.map(match => ({
      url: match[1],         // URL asli gambar
      title: match[2] || "No Title",  // Ambil alt sebagai judul, jika kosong berikan "No Title"
      description: match[2] || "No Description" // Pakai alt sebagai deskripsi juga
    }));

    // Konversi semua gambar ke base64
    const proxiedImages = await Promise.all(
      images.map(async (img) => {
        try {
          const imgRes = await fetch(img.url);
          const imgBuffer = await imgRes.arrayBuffer();
          const base64Img = Buffer.from(imgBuffer).toString("base64");
          return {
            ...img,
            base64: `data:${imgRes.headers.get("content-type")};base64,${base64Img}`
          };
        } catch (err) {
          return null; // Jika gagal fetch gambar, return null
        }
      })
    );

    // Hapus data yang gagal
    images = proxiedImages.filter(Boolean);

    return new Response(JSON.stringify({ images }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
