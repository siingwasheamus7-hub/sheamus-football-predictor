
export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=600"
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }

  const africanLeagues = [
    { id: 36, name: "AFCON Qualifiers", category: "National Teams" },
    { id: 922, name: "Women's AFCON", category: "National Teams" },
    { id: 538, name: "AFCON U20", category: "National Teams" },
    { id: 973, name: "AFCON U17", category: "National Teams" },
    { id: 535, name: "CECAFA Senior Challenge Cup", category: "National Teams" },
    { id: 1159, name: "CECAFA U20", category: "National Teams" },
    { id: 771, name: "COSAFA U20", category: "National Teams" },
    { id: 12, name: "CAF Champions League", category: "African Clubs" },
    { id: 20, name: "CAF Confederation Cup", category: "African Clubs" },
    { id: 533, name: "CAF Super Cup", category: "African Clubs" },
    { id: 869, name: "CECAFA Club Cup", category: "African Clubs" },
    { id: 1164, name: "CAF Women's Champions League", category: "African Clubs" }
  ];

  try {
    const cache = caches.default;
    const cacheKey = new Request(
      new URL("/api/africa-cache-v2", context.request.url).toString()
    );

    const cached = await cache.match(cacheKey);

    if (cached) return cached;

    const apiKey = context.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      throw new Error("API_FOOTBALL_KEY is not configured");
    }

    const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Lusaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

const endDate = new Date(today + "T00:00:00Z");
endDate.setUTCDate(endDate.getUTCDate() + 6);

const toDate = endDate.toISOString().slice(0, 10);

    const url = new URL(
      "https://v3.football.api-sports.io/fixtures"
    );

    url.searchParams.set("date", today);
    url.searchParams.set("timezone", "Africa/Lusaka");

    const response = await fetch(url.toString(), {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("API-Football request failed: " + response.status);
    }

    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(
        "API-Football error: " + JSON.stringify(data.errors)
      );
    }

    const leagueMap = new Map(
      africanLeagues.map(league => [league.id, league])
    );

    const fixtures = (data.response || [])
      .filter(match => leagueMap.has(match.league?.id))
      .map(match => ({
        fixture: match.fixture,
        league: match.league,
        teams: match.teams,
        goals: match.goals,
        score: match.score,
        competitionCategory:
          leagueMap.get(match.league.id).category
      }));

    const result = new Response(JSON.stringify({
      success: true,
      message: "African football fixtures loaded successfully",
      date: today,
      total: fixtures.length,
      competitions: africanLeagues,
      fixtures
    }), {
      status: 200,
      headers
    });

    await cache.put(cacheKey, result.clone());

    return result;

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...headers,
        "Cache-Control": "no-store"
      }
    });
  }
}
