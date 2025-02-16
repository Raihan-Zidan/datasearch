export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/gambar/")) {
      return await proxyGambar(request);
    } else {
      return await fetchDuckDuckGoData(url);
    }
  },
};

// Fungsi untuk menangani pencarian DuckDuckGo
async function fetchDuckDuckGoData(url) {
  const query = url.searchParams.get("q");

  if (!query) {
    return new Response(JSON.stringify({ error: "Parameter 'q' diperlukan" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  // Generate random string untuk parameter tambahan
  function generateRandomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

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
    return new Response(JSON.stringify({ error: "Kosong" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

// Fungsi untuk proxy gambar dari DuckDuckGo
async function proxyGambar(request) {
  const url = new URL(request.url);
  const imagePath = url.pathname.replace("/gambar/", ""); // Ambil path gambar

  if (!imagePath) {
    return new Response(null, { status: 204 }); // Tidak ada gambar, kosongkan respons
  }

  const imageUrl = `https://duckduckgo.com/${imagePath}`;

  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }, // Hindari pemblokiran
    });

    if (!response.ok) {
      return new Response(null, { status: 204 }); // Jika gagal, kosongkan respons
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Cache-Control": "public, max-age=86400", // Cache 1 hari
        "Access-Control-Allow-Origin": "*", // Fix CORS
      },
    });
  } catch (error) {
    return new Response(null, { status: 204 }); // Error? Kosongkan respons
  }
}
