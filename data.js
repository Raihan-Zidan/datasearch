
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
 const apiKey = "ac297d92e17eeec5536517574b560f560b863c0de8575884503724302442676f";  
    const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${query}&api_key=${apiKey}`);
    const results = await response.json();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Izinkan semua domain
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
};
