exports.handler = async function () {
  try {
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard"
    );

    if (!response.ok) {
      throw new Error("Football data service unavailable");
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
