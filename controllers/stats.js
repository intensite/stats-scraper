
var BaseController = require("./base")//, 
//     alarmFactory = require('../factories/alarm');


var options = {
    host: 'sslsags.publicationsports.com',
    port: 80,
    method: 'GET',
    schedule_path: '/serviceV2/service.php?lang=fr&batch[0][request]=TeamSchedule&batch[0][type]=league&batch[0][id]=27&batch[0][seasonId]=7&batch[0][subSeasonId]=1&batch[0][categoryId]=5881&batch[0][teamId]=38237',
    stats_path: 'https://sags3.publicationsports.com/serviceV2/service.php?lang=fr&batch%5B0%5D%5Brequest%5D=OrganisationInformation&batch%5B0%5D%5Btype%5D=league&batch%5B0%5D%5Bid%5D=27&batch%5B0%5D%5BseasonId%5D=8&batch%5B0%5D%5BsubSeasonId%5D=1&batch%5B0%5D%5BcategoryId%5D=6796&batch%5B1%5D%5Brequest%5D=TeamSchedule&batch%5B1%5D%5Btype%5D=league&batch%5B1%5D%5Bid%5D=27&batch%5B1%5D%5BseasonId%5D=8&batch%5B1%5D%5BsubSeasonId%5D=1&batch%5B1%5D%5BcategoryId%5D=6796&batch%5B1%5D%5BteamId%5D=50000&callback=jQuery20306931698515771785_1476237641759&_=1476237641760'
};
var fullUri = 'http://' + options.host + options.path;

var scheduleData = {};


module.exports = BaseController.extend({


    get_schedule: function () {
        // Call the publication sports API
        request.get(fullUri, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var locals = JSON.parse(body);


                // Clean the mess and return a properly formated json object
                cleanedApiData = cleanJsonData(locals);
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

    get_stats: function () {

    }
});

function cleanJsonData(rawPSdata) {
        var cleaData = {
            eventsInfo: [],
            eventsTypes: [],
            locationsInfo: [],
            teamsInfo: []
        };

        var eventsInfo = rawPSdata.data[0].data.eventsInfo;
        var eventsTypes = rawPSdata.data[0].data.eventsTypes;
        var locationsInfo = rawPSdata.data[0].data.locationsInfo;
        var teamsInfo = rawPSdata.data[0].data.teamsInfo;

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

function extractFullSchedule(apiData) {
        _.forEach(apiData.eventsInfo, function (event) {
            event.eventTypeName = _.result(_.find(apiData.eventsTypes, 'eventTypeId', event.eventTypeId), 'name');
            event.locationName = _.result(_.find(apiData.locationsInfo, 'locationId', event.locationId), 'locationName');
            event.visitorTeamName = _.result(_.find(apiData.teamsInfo, 'teamId', event.eventVisitorTeamId), 'name');
            event.localTeamName = _.result(_.find(apiData.teamsInfo, 'teamId', event.eventLocalTeamId), 'name');
        });

        return apiData.eventsInfo;
    }