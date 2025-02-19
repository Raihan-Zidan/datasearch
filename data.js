export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const proxy = searchParams.get("proxy") === "true"; // Jika ?proxy=true, konversi gambar ke base64

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    const url = `https://search.brave.com/images?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await response.text();

    // Ambil judul halaman
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "No Title";

    // Ambil deskripsi meta
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    const description = descMatch ? descMatch[1] : "No Description";

    // Ambil URL gambar dari hasil pencarian Brave
    const imageMatches = [...html.matchAll(/"https:\/\/[^"]+\.(jpg|jpeg|png|gif)"/g)];
    let images = imageMatches.map(match => match[0].replace(/"/g, ""));

    // Jika proxy gambar diaktifkan, konversi gambar ke base64
    if (proxy) {
      const proxiedImages = await Promise.all(
        images.map(async (imgUrl) => {
          try {
            const imgRes = await fetch(imgUrl);
            const imgBuffer = await imgRes.arrayBuffer();
            const base64Img = Buffer.from(imgBuffer).toString("base64");
            return `data:${imgRes.headers.get("content-type")};base64,${base64Img}`;
          } catch (err) {
            return null; // Jika gagal fetch gambar, return null
          }
        })
      );
      images = proxiedImages.filter(Boolean); // Hapus yang null
    }

    return new Response(JSON.stringify({ title, description, images }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
