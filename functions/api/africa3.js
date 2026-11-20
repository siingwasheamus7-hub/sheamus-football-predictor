
export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  try {
    const url =
      "https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=5057";

    const response = await fetch(url);

    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: "TheSportsDB request failed",
        status: response.status
      }), {
        status: 502,
        headers
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      success: true,
      source: "TheSportsDB",
      competition: "CAF Confederation Cup",
      events: data.events || []
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers
    });
  }
}
