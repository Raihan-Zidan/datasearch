export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "chickens"; // Default query: "chickens"
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://www.google.com/",
        },
      });

      const html = await response.text();

      // Menggunakan HTMLRewriter untuk parsing HTML (lebih akurat dari regex)
      let images = [];

      new HTMLRewriter()
        .on("div.islrc div", {
          element(el) {
            let image = { image_url: "", title: "", source: "", page_url: "" };

            el.on("img", (imgEl) => {
              const imgSrc = imgEl.getAttribute("src");
              if (imgSrc && !imgSrc.includes("base64")) {
                image.image_url = imgSrc;
              }
            });

            el.on("a", (aEl) => {
              const href = aEl.getAttribute("href");
              if (href && href.startsWith("/imgres?imgurl=")) {
                const urlParams = new URLSearchParams(href);
                image.page_url = urlParams.get("imgrefurl");
              }
            });

            el.on("h3", (h3El) => {
              image.title = h3El.text.trim();
            });

            el.on("span", (spanEl) => {
              if (!image.source) {
                image.source = spanEl.text.trim();
              }
            });

            if (image.image_url) {
              images.push(image);
            }
          },
        })
        .transform(new Response(html));

      // Filter hasil agar tidak ada duplikat
      images = images.filter(
        (img, index, self) =>
          img.image_url &&
          img.page_url &&
          self.findIndex((t) => t.image_url === img.image_url) === index
      );

      return new Response(JSON.stringify(images.slice(0, 10), null, 2), {
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
