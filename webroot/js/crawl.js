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
function formatSportGame(event) {
    try {
        var comp = event.competitions[0];
        var status = comp.status;
        var home = comp.competitors.find(function(c) { return c.homeAway === 'home'; });
        var away = comp.competitors.find(function(c) { return c.homeAway === 'away'; });
        var hAbbr = home.team.abbreviation;
        var aAbbr = away.team.abbreviation;
        if (status.type.state === 'pre') {
            return aAbbr + ' vs ' + hAbbr + '  ' + status.type.shortDetail;
        }
        var hScore = home.score !== undefined ? home.score : '0';
        var aScore = away.score !== undefined ? away.score : '0';
        var detail = status.type.completed ? 'FINAL' : (status.type.shortDetail || 'LIVE');
        return aAbbr + ' ' + aScore + '  ' + hAbbr + ' ' + hScore + '  ' + detail;
    } catch(e) {
        return '';
    }
}

var sportsGames = [];
var sportsGameIdx = 0;
var sportsRotateInterval = null;
var leagueBadgeColors = {
    'NFL': '#013369',
    'NBA': '#C9082A',
    'MLB': '#002D72',
    'NHL': '#041E42',
    'EPL': '#3D195B',
};

function showSportsGame(idx) {
    var game = sportsGames[idx];
    var $badge = $('#crawl .sports-ticker .sports-badge');
    var $score = $('#crawl .sports-ticker .sports-score');
    var $counter = $('#crawl .sports-ticker .sports-counter');
    $score.fadeOut(200, function() {
        $badge.text(game.league);
        $badge.css('background', leagueBadgeColors[game.league] || '#c8102e');
        $score.text(game.score);
        $counter.text((idx + 1) + ' / ' + sportsGames.length);
        $score.fadeIn(200);
    });
}

function sportsTickerStart() {
    $.getJSON('/sports', function(leagues) {
        sportsGames = [];
        leagues.forEach(function(leagueData) {
            if (!leagueData.events || leagueData.events.length === 0) return;
            leagueData.events.forEach(function(event) {
                var score = formatSportGame(event);
                if (score) sportsGames.push({ league: leagueData.league, score: score });
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