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
    { name: 'NFL', url: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${today}` },
    { name: 'NBA', url: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${today}` },
    { name: 'MLB', url: `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${today}` },
    { name: 'NHL', url: `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${today}` },
    { name: 'EPL', url: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${today}` },
  ];
  const results = [];
  for (const league of leagues) {
    try {
      const response = await fetch(league.url);
      const data = await response.json();
      const logo = data.leagues && data.leagues[0] && data.leagues[0].logos && data.leagues[0].logos[0] ? data.leagues[0].logos[0].href : null;
      results.push({ league: league.name, logo, events: data.events || [] });
    } catch (err) {
      results.push({ league: league.name, events: [] });
    }
  }
  res.json(results);
})