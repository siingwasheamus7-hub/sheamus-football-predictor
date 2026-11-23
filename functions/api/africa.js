
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

  const competitions = [
    {
      id: 4720,
      name: "CAF Champions League",
      category: "African Clubs",
      season: "2026-2027",
      type: "next"
    },
    {
      id: 5057,
      name: "CAF Confederation Cup",
      category: "African Clubs",
      season: "2026-2027",
      type: "next"
    },
    {
      id: 4496,
      name: "Africa Cup of Nations",
      category: "National Teams",
      season: "2025",
      type: "season"
    }
  ];

  const api = "https://www.thesportsdb.com/api/v1/json/123/";

  function score(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function convertEvent(event) {
    const finished = /finished|full time|ft/i.test(
      event.strStatus || ""
    );

    const date = event.strTimestamp || event.dateEvent || null;

    return {
      fixture: {
        id: event.idEvent,
        date,
        status: {
          short: finished ? "FT" : "NS",
          long: event.strStatus || (finished ? "Match Finished" : "Not Started")
        },
        venue: {
          name: event.strVenue || "Venue not available"
        },
        timezone: "Africa/Lusaka"
      },
      league: {
        id: Number(event.idLeague),
        name: event.strLeague,
        country: "Africa",
        season: event.strSeason,
        logo: event.strLeagueBadge || null
      },
      teams: {
        home: {
          id: event.idHomeTeam || null,
          name: event.strHomeTeam,
          logo: event.strHomeTeamBadge || null
        },
        away: {
          id: event.idAwayTeam || null,
          name: event.strAwayTeam,
          logo: event.strAwayTeamBadge || null
        }
      },
      goals: {
        home: score(event.intHomeScore),
        away: score(event.intAwayScore)
      },
      score: {
        fulltime: {
          home: score(event.intHomeScore),
          away: score(event.intAwayScore)
        }
      },
      competitionCategory:
        competitions.find(c => c.id === Number(event.idLeague))?.category
    };
  }

  try {
    const cache = caches.default;
    const cacheKey = new Request(
      new URL("/api/africa-cache-v5", context.request.url)
    );

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const requests = competitions.map(async competition => {
      const endpoint = competition.type === "next"
        ? "eventsnextleague.php"
        : "eventsseason.php";

      const url = new URL(api + endpoint);
      url.searchParams.set("id", competition.id);

      if (competition.type === "season") {
        url.searchParams.set("s", competition.season);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          competition.name + " request failed: " + response.status
        );
      }

      const data = await response.json();

      return (data.events || []).map(convertEvent);
    });

    const results = await Promise.all(requests);

const fixtures = results.flatMap(item => item.upcoming);
const recentResults = results.flatMap(item => item.recent);

    fixtures.sort((a, b) =>
      new Date(a.fixture.date || 0) -
      new Date(b.fixture.date || 0)
    );

    const result = new Response(JSON.stringify({
      success: true,
      message: "African football data loaded successfully",
      source: "TheSportsDB",
      total: fixtures.length,
      competitions,
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
