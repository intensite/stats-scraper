module.exports = function( ) {
    var express = require( "express" )
      , router = express.Router()
      , controller = require( '../controllers/stats' );

    console.log('Inside the stats route...........................................');

    // router.route( '/' )
    //     .get( controller.list )
    //     .post( controller.create );
        
    router.route( '/getStats' )
        .get( controller.getStats );
    router.route( '/getShedule' )
        .get( controller.getShedule );
    router.route( '/test' )
        .get( controller.test );

    return router;
}
