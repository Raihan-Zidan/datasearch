export default {
  async fetch(request, env) {
    return new Response(JSON.stringify({
      GOOGLE_API_KEY: env.GOOGLE_API_KEY ? "Loaded" : "Missing",
      GOOGLE_CX: env.GOOGLE_CX ? "Loaded" : "Missing"
    }));
  }
}
