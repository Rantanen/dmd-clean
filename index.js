
"use strict";

var path = require( 'path' );

module.exports = function() {
    var value = {
        partial: path.resolve( __dirname, 'partials/**/*.hbs' ),
        helper: path.resolve( __dirname, 'helpers/**/*.js' )
    };

    return value;
};
