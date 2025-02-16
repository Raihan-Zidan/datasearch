export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const query = url.searchParams.get("q");
        const startIndex = url.searchParams.get("start") || 0;
        const safeSearch = url.searchParams.get("sf") == 1 ? "&safe=active" : "";
        const idLang = url.searchParams.get("idlang") ? "&gl=id&lr=lang_id&hl=id" : "";
        
        if (!query) {
            return new Response(JSON.stringify({ error: "Query parameter 'q' is required" }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            });
        }

        const apiKey = env.GOOGLE_API_KEY;
        const cx = env.GOOGLE_CX;
        console.log(env.GOOGLE_API_KEY, env.GOOGLE_CX);
        const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&start=${startIndex}&key=${apiKey}&cx=${cx}${safeSearch}${idLang}`;

        try {
            const response = await fetch(googleSearchUrl);
            const results = await response.json();

            return new Response(JSON.stringify(results, null, 2), {
                headers: { "Content-Type": "application/json" },
                status: response.status,
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Failed to fetch search results" }), {
                headers: { "Content-Type": "application/json" },
                status: 500,
            });
        }
    },
};

