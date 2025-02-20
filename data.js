export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/images/")) {
      return await proxyGambar(request);
    } else if (path.startsWith("/suggest")) {
      return await fetchEcosiaSuggestions(url);
    } else if (path.startsWith("/favicon")) {
      return await fetchGoogleFavicon(url);
    } else {
      return await fetchDuckDuckGoData(url);
    }
  },
};

async function fetchDuckDuckGoData(url) {
  const query = url.searchParams.get("q");

  if (!query || query.toLowerCase().includes("israel")) {
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
    const response = await fetch(duckduckgoURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Terjadi kesalahan." }), {
        headers: { "Content-Type": "application/json" },
        status: response.status,
      });
    }

    let results = await response.json();

    let filteredData = {
      title: results.Heading || "",
      type: results.Infobox?.content?.some(item => item.label === "Capital") ? "country" : "",
      image: results.Image ? `https://datasearch.raihan-zidan2709.workers.dev/images/${results.Image.replace("/i/", "")}` : "",
      source: results.AbstractSource || "",
      sourceUrl: results.AbstractURL || "",
      snippet: results.Abstract || "",
      url: results.AbstractURL || "",
      infobox: results.Infobox ? results.Infobox.content : [],
    };

    return new Response(JSON.stringify(filteredData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

async function proxyGambar(request) {
  const url = new URL(request.url);
  const imagePath = url.pathname.replace("/images/", "");

  if (!imagePath) {
    return new Response(null, { status: 204 });
  }

  const imageUrl = `https://duckduckgo.com/i/${imagePath}`;

  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return new Response(null, { status: 204 });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(null, { status: 204 });
  }
}

//  suggest  //

async function fetchEcosiaSuggestions(url) {
  const query = url.searchParams.get("q");
  if (!query) {
    return new Response(JSON.stringify({ error: "Parameter tidak valid." }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const ecosiaURL = `https://ac.ecosia.org/autocomplete?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(ecosiaURL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    const suggestions = await response.json();

    return new Response(JSON.stringify(suggestions), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

async function fetchGoogleFavicon(url) {
  const site = url.searchParams.get("url");
  if (!site) {
    return new Response(JSON.stringify({ error: "Parameter tidak valid." }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(site)}`;

  // Base64 string dari gambar default (globe.png)
  const defaultFaviconBase64 = "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";
  const defaultFaviconBuffer = Uint8Array.from(atob(defaultFaviconBase64), c => c.charCodeAt(0));

  try {
    const response = await fetch(faviconUrl, { headers: { "User-Agent": "Mozilla/5.0" } });

    if (!response.ok || response.headers.get("Content-Length") === "0") {
      return new Response(defaultFaviconBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(defaultFaviconBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

