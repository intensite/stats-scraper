var _ = require('lodash');
var fs = require('fs');
var Handlebars = require('handlebars');
var http = require('http');
var request = require('request');
var BaseController = require("./base");


// var options = {
//     host: 'sslsags.publicationsports.com',
//     port: 80,
//     method: 'GET',
//     schedule_path: '/serviceV2/service.php?lang=fr&batch[0][request]=TeamSchedule&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=7&batch[0][subSeasonId]=1&batch[0][categoryId]=5881&batch[0][teamId]=38237',
//     stats_path: 'https://sags3.publicationsports.com/serviceV2/service.php?lang=fr&batch[0][request]=OrganisationInformation&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=8&batch[0][subSeasonId]=1&batch[0][categoryId]=6796&batch[1][request]=TeamSchedule&batch[1][type]=league&batch[1][id]=27&batch[1][seasonId]=8&batch[1][subSeasonId]=1&batch[1][categoryId]=6796&batch[1][teamId]=50000&callback=jQuery20306931698515771785_1476237641759&_=1476237641760'
// };
var options = {
    host: 'sags3.publicationsports.com',
    port: 80,
    method: 'GET',
    schedule_path: '/serviceV2/service.php?lang=fr&batch[0][request]=OrganisationInformation&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=8&batch[0][subSeasonId]=1&batch[0][categoryId]=6796&batch[1][request]=TeamSchedule&batch[1][type]=league&batch[1][id]=27&batch[1][seasonId]=8&batch[1][subSeasonId]=1&batch[1][categoryId]=6796&batch[1][teamId]=50000',

    stats_path: '/serviceV2/service.php?lang=fr&batch[0][request]=OrganisationInformation&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=8&batch[0][subSeasonId]=1&batch[0][categoryId]=6796&batch[1][request]=Standing&batch[1][type]=league&batch[1][id]=27&batch[1][seasonId]=8&batch[1][subSeasonId]=1&batch[1][categoryId]=6796'
};

var fullUri = '';

var scheduleData = {};
var standingData = {};


module.exports = BaseController.extend({

    test: function() {
        console.log('Inside the test route');

    },
    getShedule: function (req, res) {
        console.log('Inside the getShedule route');
        fullUri = 'http://' + options.host + options.schedule_path;
        // Call the publication sports API
        request.get(fullUri, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var locals = JSON.parse(body);


                // Clean the mess and return a properly formated json object
                cleanedApiData = cleanJsonScheduleData(locals);
                scheduleData = extractFullSchedule(cleanedApiData);
                var data = {
                    scheduleData: scheduleData,
                    test: 'Patate'
                };


                //res.send(scheduleData);
                //console.log(app.get('views') + 'calendar.handlebars');
                //console.log(app.engine(handlebars).compile(app.get('views') + 'calendar.handlebars'));
                res.render('calendar', data, function (err, html) {
                    //console.log(html);
                    fs.writeFile('schedule.html', html, function (err) {
                        if (err) throw err;
                        console.log('It\'s saved! in same location.');
                        res.send("Export schedule complete!");
                    });
                });
            }
        });
    },

    getStats: function (req, res) {
        console.log('Inside the getStats route');
        fullUri = 'http://' + options.host + options.stats_path;
        request.get(fullUri, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var locals = JSON.parse(body);


                // Clean the mess and return a properly formated json object
                standingData = cleanJsonStatsData(locals);
                // scheduleData = extractFullSchedule(cleanedApiData);
                var data = {
                    standingData: standingData,
                    test: 'Patate'
                };


                //  res.send(data);
                //  return;
                //console.log(app.get('views') + 'calendar.handlebars');
                //console.log(app.engine(handlebars).compile(app.get('views') + 'calendar.handlebars'));
                res.render('stats', data, function (err, html) {
                    //console.log(html);
                    fs.writeFile('stats.html', html, function (err) {
                        if (err) throw err;
                        console.log('It\'s saved! in same location.');
                        res.send("Export schedule complete!");
                    });
                });
            }
        });

    }
});

function cleanJsonScheduleData(rawPSdata) {
        var cleaData = {
            eventsInfo: [],
            eventsTypes: [],
            locationsInfo: [],
            teamsInfo: []
        };

        var eventsInfo = rawPSdata.data[1].data.eventsInfo;
        var eventsTypes = rawPSdata.data[1].data.eventsTypes;
        var locationsInfo = rawPSdata.data[1].data.locationsInfo;
        var teamsInfo = rawPSdata.data[1].data.teamsInfo;

        // Get the eventsInfo
        _.forEach(eventsInfo, function (n) {
            cleaData.eventsInfo.push(n[0]);
        });

        // Get the eventsTypes
        _.forEach(eventsTypes, function (n, key) {
            n.eventTypeId = key;
            cleaData.eventsTypes.push(n);
        });

        // Get the locationsInfo
        _.forEach(locationsInfo, function (n, key) {
            cleaData.locationsInfo.push(n);
        });

        // Get the teamsInfo
        _.forEach(teamsInfo, function (n, key) {
            n.teamId = key;
            cleaData.teamsInfo.push(n);
        });

        console.log('Returning from cleanJsonData............');
        return cleaData;

    }
function cleanJsonStatsData(rawPSdata) {
        var cleaData = {
            standingData: []
        };

        cleaData.standingData = rawPSdata.data[1].data.standingData;

        console.log('Returning from cleanJsonData............');
        return cleaData.standingData;

    }

function extractFullSchedule(apiData) {
        _.forEach(apiData.eventsInfo, function (event) {
            event.eventTypeName = _.result(_.find(apiData.eventsTypes, 'eventTypeId', event.eventTypeId), 'name');
            event.locationName = _.result(_.find(apiData.locationsInfo, 'locationId', event.locationId), 'locationName');
            event.visitorTeamName = _.result(_.find(apiData.teamsInfo, 'teamId', event.eventVisitorTeamId), 'name');
            event.localTeamName = _.result(_.find(apiData.teamsInfo, 'teamId', event.eventLocalTeamId), 'name');
        });

        return apiData.eventsInfo;
    }