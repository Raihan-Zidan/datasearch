export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // API Key langsung dalam kode (tidak sebagai secret)
    const apiKey = "ac297d92e17eeec5536517574b560f560b863c0de8575884503724302442676f";  

    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${query}&api_key=${apiKey}`;

    const response = await fetch(serpApiUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
