export default {
  async fetch(request) {
          const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
    const url = "https://www.google.com/search?tbm=isch&q=" + query;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://www.google.com/",
      },
    });

    return new Response(response.body, response);
  },
};

