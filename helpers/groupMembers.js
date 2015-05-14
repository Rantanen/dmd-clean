
"use strict";

var ddata = require( 'ddata' );
var handlebars = require( 'handlebars' );

var groupings = [
    { 'function': 'Methods' },
    { 'member': 'Properties' },
    { 'event': 'Events' }
];

var groupingOrder = groupings.map( function(g) { return Object.keys(g)[0]; });
groupingOrder.unshift( 'constructor' );

module.exports.sortedChildren = function( options ) {
    var children = ddata._children.call( this, options );
    children.sort( function( a, b ) {
        var kind_a = a.kind;
        var kind_b = b.kind;
        var kind_index_a = groupingOrder.indexOf( kind_a );
        var kind_index_b = groupingOrder.indexOf( kind_b );
        if( kind_index_a !== kind_index_b )
            return kind_index_a - kind_index_b;

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        return a === b ? 0 : ( a > b ? 1 : -1 );
    });

    return dmd_children( this, children, options );
};

module.exports.groupMembers = function( options ) {

    var children = ddata._children.call( this, options );

    var kinds = {};
    for( var c in children ) {
        var kind = children[c].kind;
        if( kind === 'constructor' )
            continue;

        kinds[ kind ] = kinds[ kind ] || [];
        kinds[ kind ].push( children[c] );
    }

    var group, groups = [];
    for( var g in groupings ) {
        var grouping = groupings[g];
        var key = Object.keys( grouping )[0];
        var value = grouping[key];
        var items = kinds[ key ];
        if( !items || items.length === 0 )
            continue;

        group = { _title: value, level: 0, items: items };
        groups.push( group );

        delete kinds[ key ];
    }

    var others = [];
    for( var k in kinds ) {
        for( var ki in kinds[k] ) {
            others.push( kinds[k][ki] );
        }
    }

    if( others.length > 0 ) {
        groups.push({ _title: "Other", level: 0, items: others });
    }

    var output = [];
    for( var gr in groups ) {
        group = groups[gr];

        group.items.sort( function(a,b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a === b ? 0 : ( a > b ? 1 : -1 );
        });

        output.push({ _title: group._title, level: group.level });
        for( var gi in group.items ) {
            group.items[gi].level = 1;
            output.push( group.items[gi] );
        }
    }

    output = handlebars.helpers.each( output, options );
    return output;
};

function dmd_children( self, context, options ) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    var contextPath;
    if (options.data && options.ids) {
        /*global Utils:true */
        contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (options.data) {
        data = handlebars.createFrame(options.data);
    }

    for(var j = context.length; i<j; i++) {
        depthIncrement(options);
        if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));

            if (contextPath) {
                data.contextPath = contextPath + i;
            }
        }
        ret = ret + fn(context[i], { data: data });
        depthDecrement(options);
    }

    if(i === 0){
        ret = inverse(self);
    }

    return ret;
}

/**
 * @static
 * */
function depthIncrement(options){
    options.data.root.options._depth++;
}

/**
 * @static
 * */
function depthDecrement(options){
    options.data.root.options._depth--;
}
