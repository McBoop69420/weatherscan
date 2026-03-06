var alertCrawlActive = false
var adCrawlActive = false
function crawlCheck() {
    console.log("CRAWLCHECK")
    if (alertCrawlActive == false) {
        if (weatherData.alerts.alertsAmount > 0) {
            for (var ii = 0; ii < weatherData.alerts.alertsAmount; ii++) {
                if (crawlChooser(weatherData.alerts.warnings[ii].warningtitle) == true) {
                    //console.log("activate crawl from no crawl previously")
                    if (beepWarning(weatherData.alerts.warnings[ii].warningtitle) == true || beepWatch(weatherData.alerts.warnings[ii].warningtitle) == true) {
                        audioPlayer.playWarningBeep()
                    }
                    alertCrawlActive = true
                    $('#crawl .alert .alert-background').css('background-image', 'url("/images/skeletons/crawl/alert_' + weatherData.alerts.warnings[0].significance + '.png')
                    $('#crawl .alert .alert-header').text(weatherData.alerts.warnings[0].warningtitle.toUpperCase() + " " + weatherData.alerts.warnings[0].alertType.toUpperCase())
                    $('#crawl .alert .alert-crawl .crawltext').text(weatherData.alerts.warnings[0].warningdesc)
                    $('#crawl .alert').fadeIn(0)
                    $('#crawl .alert .alert-crawl .crawltext').marquee({speed: 103, delayBeforeStart: 1000, pauseOnHover: false, pauseOnCycle: true})
                    $('#crawl .alert .alert-crawl .crawltext').on('finished', function() {
                        if (beepWarning(weatherData.alerts.warnings[ii].warningtitle) == true) {
                            audioPlayer.playWarningBeep()
                        }
                    })
                    break
                } else {
                    alertCrawlActive = false
                    $('#crawl .alert .alert-background').css('background-image', 'none')
                    $('#crawl .alert').fadeOut(0)
                    //console.log("still no crawl")
                    $('#crawl .alert .alert-header').text("")
                    $('#crawl .alert .alert-crawl .crawltext').text("")
                    $('#crawl .alert .alert-crawl .crawltext').marquee("destroy")
                }
            }
        } else {
            alertCrawlActive = false
            $('#crawl .alert .alert-background').css('background-image', 'none')
            $('#crawl .alert').fadeOut(0)
            //console.log("still no crawl")
            $('#crawl .alert .alert-header').text("")
            $('#crawl .alert .alert-crawl .crawltext').text("")
            $('#crawl .alert .alert-crawl .crawltext').marquee("destroy")
        }
    } else if (alertCrawlActive == true) {
        if (weatherData.alerts.alertsAmount == 0) {
            //console.log("crawl no longer active, alerts are done")
            $('#crawl .alert .alert-background').css('background-image', 'none')
            alertCrawlActive = false
            $('#crawl .alert').fadeOut(0)
            $('#crawl .alert .alert-header').text("")
            $('#crawl .alert .alert-crawl .crawltext').text("")
            $('#crawl .alert .alert-crawl .crawltext').marquee("destroy")
        } else {
            if ($('#crawl .alert .alert-crawl .crawltext').text() != weatherData.alerts.warnings[0].warningdesc) {
                //console.log("new alert found")
                if (beepWarning(weatherData.alerts.warnings[ii].warningtitle) == true || beepWatch(weatherData.alerts.warnings[ii].warningtitle) == true) {
                    audioPlayer.playWarningBeep()
                }
                alertCrawlActive = true
                $('#crawl .alert .alert-crawl .crawltext').marquee("destroy")
                $('#crawl .alert .alert-background').css('background-image', 'url("/images/skeletons/crawl/alert_' + weatherData.alerts.warnings[0].significance + '.png')
                $('#crawl .alert .alert-header').text(weatherData.alerts.warnings[0].warningtitle.toUpperCase() + " " + weatherData.alerts.warnings[0].alertType.toUpperCase())
                $('#crawl .alert .alert-crawl .crawltext').text(weatherData.alerts.warnings[0].warningdesc)
                $('#crawl .alert').fadeIn(0)
                $('#crawl .alert .alert-crawl .crawltext').marquee({speed: 103, delayBeforeStart: 1000, pauseOnHover: false, pauseOnCycle: true})
                $('#crawl .alert .alert-crawl .crawltext').on('finished', function() {
                    if (beepWarning(weatherData.alerts.warnings[ii].warningtitle) == true) {
                        audioPlayer.playWarningBeep()
                    }
                })
            } else {
                //console.log("same alert")
                alertCrawlActive = true
                $('#crawl .alert').fadeIn(0)
            }
        }
    }
}
function teamLogoChip(team, rec) {
    var logo = team.logo || '';
    var abbr = team.abbreviation || '';
    var img = logo
        ? '<img class="sport-logo" src="' + logo + '" alt="' + abbr + '">'
        : '<span class="sport-abbr">' + abbr + '</span>';
    var recStr = rec ? ' <span class="sport-rec">' + rec + '</span>' : '';
    return img + recStr;
}

function formatSportGame(event) {
    try {
        var comp = event.competitions[0];
        var status = comp.status;
        var home = comp.competitors.find(function(c) { return c.homeAway === 'home'; });
        var away = comp.competitors.find(function(c) { return c.homeAway === 'away'; });
        var hRec = home.records && home.records[0] ? '(' + home.records[0].summary + ')' : '';
        var aRec = away.records && away.records[0] ? '(' + away.records[0].summary + ')' : '';

        var broadcast = '';
        if (comp.broadcasts && comp.broadcasts.length > 0) {
            var nat = comp.broadcasts.find(function(b) { return b.market === 'national'; });
            if (nat && nat.names && nat.names[0]) broadcast = nat.names[0];
        }
        var venue = comp.venue && comp.venue.fullName ? comp.venue.fullName : '';

        var scoreHTML, detailLine;

        if (status.type.state === 'pre') {
            scoreHTML = teamLogoChip(away.team, aRec) + '&nbsp;&nbsp;<span class="sport-vs">vs</span>&nbsp;&nbsp;' + teamLogoChip(home.team, hRec) + '&nbsp;&nbsp;&nbsp;<span class="sport-status">\u00B7&nbsp;&nbsp;' + status.type.shortDetail.replace(/^[\d\/]+ - /, '').replace(/\s+[A-Z]{2,4}$/, '') + '</span>';
            var pre = [];
            if (broadcast) pre.push(broadcast);
            if (venue) pre.push(venue);
            detailLine = pre.join('<br>');
        } else {
            var hScore = home.score || '0';
            var aScore = away.score || '0';
            var gameStatus = status.type.completed ? 'FINAL' : (status.type.shortDetail || 'LIVE');
            var live = !status.type.completed;
            scoreHTML = teamLogoChip(away.team, live ? '' : aRec) + ' <span class="sport-score-num">' + aScore + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' + teamLogoChip(home.team, live ? '' : hRec) + ' <span class="sport-score-num">' + hScore + '</span>&nbsp;&nbsp;&nbsp;<span class="sport-status">' + gameStatus + '</span>';

            var sub = [];
            if (status.type.completed) {
                var topPts = null;
                [away, home].forEach(function(team) {
                    if (!team.leaders) return;
                    var ptsCat = team.leaders.find(function(l) { return l.name === 'points'; });
                    if (ptsCat && ptsCat.leaders && ptsCat.leaders[0]) {
                        var l = ptsCat.leaders[0];
                        if (!topPts || l.value > topPts.value) {
                            topPts = { name: l.athlete.shortName, value: l.value, display: l.displayValue };
                        }
                    }
                });
                if (topPts) sub.push('Top: ' + topPts.name + '  ' + topPts.display + ' PTS');
            }
            if (broadcast) sub.push(broadcast);
            detailLine = sub.join('<br>');
        }

        return { score: scoreHTML, detail: detailLine };
    } catch(e) {
        return null;
    }
}

var sportsGames = [];
var sportsGameIdx = 0;
var sportsRotateInterval = null;
var leagueLogos = {
    'NFL': 'https://a.espncdn.com/i/teamlogos/leagues/500-dark/nfl.png',
    'NBA': 'https://a.espncdn.com/i/teamlogos/leagues/500-dark/nba.png',
    'MLB': 'https://a.espncdn.com/i/teamlogos/leagues/500-dark/mlb.png',
    'NHL': 'https://a.espncdn.com/i/teamlogos/leagues/500-dark/nhl.png',
    'EPL': 'https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png',
};
var leagueBadgeColors = {
    'NFL': '#013369',
    'NBA': '#C9082A',
    'MLB': '#002D72',
    'NHL': '#041E42',
    'EPL': '#3D195B',
};

function showSportsGame(idx) {
    var game = sportsGames[idx];
    var $badge  = $('#crawl .sports-ticker .sports-badge');
    var $score  = $('#crawl .sports-ticker .sports-score');
    var $detail = $('#crawl .sports-ticker .sports-detail');
    var $counter = $('#crawl .sports-ticker .sports-counter');
    $score.add($detail).fadeOut(200, function() {
        $badge.css('background', leagueBadgeColors[game.league] || '#c8102e');
        var logoUrl = leagueLogos[game.league] || game.leagueLogo;
        if (logoUrl) {
            $badge.html('<img class="league-logo" src="' + logoUrl + '" alt="' + game.league + '">');
        } else {
            $badge.text(game.league);
        }
        $score.html(game.score);
        $detail.html(game.detail);
        $counter.text((idx + 1) + ' / ' + sportsGames.length);
        $score.add($detail).fadeIn(200);
    });
}

function sportsTickerStart() {
    $.getJSON('/sports', function(leagues) {
        sportsGames = [];
        leagues.forEach(function(leagueData) {
            if (!leagueData.events || leagueData.events.length === 0) return;
            leagueData.events.forEach(function(event) {
                var g = formatSportGame(event);
                if (g) sportsGames.push({ league: leagueData.league, leagueLogo: leagueData.logo || null, score: g.score, detail: g.detail });
            });
        });
        if (sportsGames.length === 0) {
            $('#crawl .sports-ticker').fadeOut(300);
            return;
        }
        sportsGameIdx = 0;
        $('#crawl .sports-ticker').fadeIn(0);
        showSportsGame(sportsGameIdx);
        if (sportsRotateInterval) clearInterval(sportsRotateInterval);
        sportsRotateInterval = setInterval(function() {
            sportsGameIdx = (sportsGameIdx + 1) % sportsGames.length;
            showSportsGame(sportsGameIdx);
        }, 5000);
    }).fail(function() {
        $('#crawl .sports-ticker').fadeOut(300);
    });
}

function crawlKickOff() {
    sportsTickerStart();
    setInterval(sportsTickerStart, 5 * 60 * 1000);
}