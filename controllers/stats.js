var _ = require('lodash');
var fs = require('fs');
var Handlebars = require('handlebars');
var http = require('http');
var request = require('request');
var BaseController = require("./base");

var options = {
    host: 'sags3.publicationsports.com',
    port: 80,
    method: 'GET',


    schedule_path: '/serviceV2/service.php?lang=fr&batch[0][request]=OrganisationInformation&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=8&batch[0][subSeasonId]=1&batch[0][categoryId]=6796&batch[1][request]=TeamSchedule&batch[1][type]=league&batch[1][id]=27&batch[1][seasonId]=8&batch[1][subSeasonId]=1&batch[1][categoryId]=6796&batch[1][teamId]=50000',

    stats_path: '/serviceV2/service.php?lang=fr&batch[0][request]=OrganisationInformation&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=8&batch[0][subSeasonId]=1&batch[0][categoryId]=6796&batch[1][request]=Standing&batch[1][type]=league&batch[1][id]=27&batch[1][seasonId]=8&batch[1][subSeasonId]=1&batch[1][categoryId]=6796'
};

module.exports = BaseController.extend({

    test: function () {
        console.log('Inside the test route');

    },
    getShedule: function (req, res) {
        console.log('Inside the getShedule route');
        var scheduleData = {};
        var fullUri = 'http://' + options.host + options.schedule_path;

        // Call the publication sports API
        request.get(fullUri, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var locals = JSON.parse(body);


                // Clean the mess and return a properly formated json object
                cleanedApiData = cleanJsonScheduleData(locals);
                scheduleData = extractFullSchedule(cleanedApiData);
                var data = {
                    scheduleData: scheduleData
                };

                // res.send(cleanedApiData);
                // return;
                res.render('calendar', data, function (err, html) {
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
        var standingData = {};
        var fullUri = 'http://' + options.host + options.stats_path;
        request.get(fullUri, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var locals = JSON.parse(body);

                // Clean the mess and return a properly formated json object
                standingData = cleanJsonStatsData(locals);
                var data = {
                    standingData: standingData,
                    test: 'Patate'
                };

                // res.send(data);
                // return;
                res.render('stats', data, function (err, html) {
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

    return cleaData;
}

function cleanJsonStatsData(rawPSdata) {
    var cleaData = {
        standingData: []
    };

    cleaData.standingData = rawPSdata.data[1].data.standingData;

    // Filter the stupid use of the keyword null as a property
    _.forEach(cleaData.standingData, function (element) {
        element.tie = element["null"];
    });

    return cleaData.standingData;
}

function extractFullSchedule(apiData) {

    _.forEach(apiData.eventsInfo, function (event) {
        event.eventTypeName = _.result(_.find(apiData.eventsTypes, {'eventTypeId': event.eventTypeId}), 'name');
        event.locationName = _.result(_.find(apiData.locationsInfo, {'locationId': event.locationId}), 'locationName');
        event.visitorTeamName = _.result(_.find(apiData.teamsInfo, {'teamId': event.eventVisitorTeamId}), 'name');
        event.localTeamName = _.result(_.find(apiData.teamsInfo, {'teamId': event.eventLocalTeamId}), 'name');
    });
    // console.log('After treatment.................');
    // console.log(apiData);
    
    return apiData.eventsInfo;
}