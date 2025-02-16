export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/images/")) {
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
    return new Response(JSON.stringify({ error: "Parameter tidak valid." }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  function generateRandomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  const duckduckgoURL = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1&m=${generateRandomString(5)}`;

  try {
    const response = await fetch(duckduckgoURL);
    let results = await response.json();

    // 🔥 Filter data agar lebih ringan
    let filteredData = {
      title: results.Heading || "",
      image: results.Image ? `https://datasearch.raihan-zidan2709.workers.dev/images${results.Image}` : "",
      source: results.AbstractSource || "",
      snippet: results.Abstract || "",
      abstractURL: results.AbstractURL || "",
      infobox: results.Infobox ? results.Infobox.content : []
    };

    // 🔥 Cek apakah ada "Capital" di dalam Infobox
    if (filteredData.Infobox.some(item => item.label === "Capital")) {
      filteredData.type = "country"; // Tambahkan type: country
    }

    return new Response(JSON.stringify(filteredData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Gagal mengambil data dari DuckDuckGo" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

// Fungsi untuk proxy gambar dari DuckDuckGo
async function proxyGambar(request) {
  const url = new URL(request.url);
  const imagePath = url.pathname.replace("/images/", ""); // Ambil nama gambar

  if (!imagePath) {
    return new Response(null, { status: 204 }); // Tidak ada gambar, kosongkan respons
  }

  const imageUrl = `https://duckduckgo.com/i/${imagePath}`;

  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return new Response(null, { status: 204 }); // Jika gagal, kosongkan respons
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(null, { status: 204 }); // Error? Kosongkan respons
  }
}
