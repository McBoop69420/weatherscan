const fetch = require('node-fetch');
const express = require('express');
const path = require('path')
const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, 'webroot')));

app.listen(port, '0.0.0.0', () => {
    console.log("Weatherscan XL by Mist Weather Media")
    console.log(`Webroot serving on 127.0.0.1:${port}`);
  });

app.get('/airports', async (req, res) => {
  try {
    const response = await fetch('https://nasstatus.faa.gov/api/airport-events');
    const airportData = await response.json();
    res.json(airportData);
    console.log("Client requested airport data.")
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch airport data' });
  }
})

app.get('/sports', async (req, res) => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }).replace(/-/g, '');
  const leagues = [
    { name: 'NFL',   url: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${today}` },
    { name: 'NBA',   url: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${today}` },
    { name: 'MLB',   url: `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${today}` },
    { name: 'NHL',   url: `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${today}` },
    { name: 'EPL',   url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${today}` },
    { name: 'NCAAB', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${today}`, top25Only: true, rankingsUrl: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/rankings' },
    { name: 'NCAAW', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard?dates=${today}`, top25Only: true, rankingsUrl: 'https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/rankings' },
    { name: 'WNBA',  url: `https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates=${today}` },
    { name: 'PWHL',  url: `https://site.api.espn.com/apis/site/v2/sports/hockey/pwhl/scoreboard?dates=${today}` },
    { name: 'WBC',   url: `https://site.api.espn.com/apis/site/v2/sports/baseball/wbc/scoreboard?dates=${today}` },
  ];
  const results = [];
  for (const league of leagues) {
    try {
      const response = await fetch(league.url);
      const data = await response.json();
      const logo = data.leagues && data.leagues[0] && data.leagues[0].logos && data.leagues[0].logos[0] ? data.leagues[0].logos[0].href : null;
      let events = data.events || [];
      const total = events.length;
      if (league.top25Only && league.rankingsUrl) {
        let top25Ids = new Set();
        try {
          const rankRes = await fetch(league.rankingsUrl);
          const rankData = await rankRes.json();
          const poll = rankData.rankings && rankData.rankings[0];
          if (poll && poll.ranks) {
            poll.ranks.slice(0, 25).forEach(r => {
              if (r.team && r.team.id) top25Ids.add(String(r.team.id));
            });
          }
        } catch (e) {
          console.log(`${league.name}: rankings fetch failed, including all games`);
        }
        if (top25Ids.size > 0) {
          events = events.filter(event => {
            const comp = event.competitions && event.competitions[0];
            if (!comp) return false;
            return comp.competitors.some(c => c.team && top25Ids.has(String(c.team.id)));
          });
        }
        console.log(`${league.name}: ${total} total, ${events.length} with top-25 team`);
      } else {
        console.log(`${league.name}: ${total} event(s)`);
      }
      results.push({ league: league.name, logo, events });
    } catch (err) {
      console.log(`${league.name}: fetch failed - ${err.message}`);
      results.push({ league: league.name, events: [] });
    }
  }
  res.json(results);
})