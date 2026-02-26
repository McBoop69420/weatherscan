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

function sportsTickerStart() {
    $.getJSON('/sports', function(leagues) {
        var segments = [];
        leagues.forEach(function(leagueData) {
            if (!leagueData.events || leagueData.events.length === 0) return;
            var games = leagueData.events
                .map(formatSportGame)
                .filter(function(s) { return s !== ''; })
                .join('     \u25AA     ');
            if (games) {
                segments.push(leagueData.league + ':   ' + games);
            }
        });
        if (segments.length === 0) {
            $('#crawl .sports-ticker').fadeOut(0);
            return;
        }
        var tickerText = segments.join('          \u25C6          ');
        var $crawl = $('#crawl .sports-ticker .crawltext');
        $crawl.marquee('destroy');
        $crawl.text(tickerText);
        $('#crawl .sports-ticker').fadeIn(0);
        $crawl.marquee({ speed: 100, delayBeforeStart: 500, pauseOnHover: false });
    }).fail(function() {
        $('#crawl .sports-ticker').fadeOut(0);
    });
}

function crawlKickOff() {
    sportsTickerStart();
    setInterval(sportsTickerStart, 5 * 60 * 1000);
}