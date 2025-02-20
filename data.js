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
  const defaultFavicon = "https://datasearch.raihan-zidan2709.workers.dev/images/favicon-default.png"; // Gunakan favicon default dari Workers Anda

  try {
    const response = await fetch(faviconUrl, { headers: { "User-Agent": "Mozilla/5.0" } });

    if (!response.ok || response.headers.get("Content-Length") === "0") {
      return await fetch(defaultFavicon);
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type"),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return await fetch(defaultFavicon);
  }
}

