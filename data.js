export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Bypass favicon.ico requests
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 }); // No Content
    }

    const query = url.searchParams.get("q");
    const start = parseInt(url.searchParams.get("start")) || 0;

    console.log("Query diterima:", query);

    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), {
        status: 400,
        headers: getCorsHeaders(),
      });
    }

    let imageResults = [];

    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&start=${start}`;
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://www.google.com/",
        },
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: `Terjadi kesalahan.` }), {
          status: response.status,
          headers: getCorsHeaders(),
        });
      }

      const html = await response.text();
      const images = extractImageData(html);

      for (const image of images) {
        const resizedUrl = getCloudflareResizedUrl(image.url);
        imageResults.push({
          image: image.url,
          thumbnail: resizedUrl,
          title: image.title,
          siteName: image.siteName,
          pageUrl: image.pageUrl,
        });
      }

      console.log("Response JSON:", { query, images: imageResults });

      return new Response(JSON.stringify({ query, images: imageResults }), {
        status: 200,
        headers: getCorsHeaders(),
      });

    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: `Terjadi kesalahan. ${error.message}` }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  },
};
