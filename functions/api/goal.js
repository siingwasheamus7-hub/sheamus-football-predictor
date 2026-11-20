
export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store"
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const apiKey = context.env.GOAL_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "GOAL_API_KEY is missing from Cloudflare Secrets"
      }), { status: 500, headers });
    }

    const response = await fetch(
      "https://api.goal-api.com/v1/leagues",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify({
      success: response.ok,
      source: "GOAL API",
      status: response.status,
      result: data
    }), {
      status: response.ok ? 200 : 502,
      headers
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers });
  }
}
