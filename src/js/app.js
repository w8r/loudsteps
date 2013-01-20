(function() {

    var event = require('bean');

    /***************************************************************************
     * Routing class
     * 
     * @class Router
     **************************************************************************/
    var Router = function(map) {
        this.map = map;
        this.geocoder = new google.maps.DirectionsService();
        this.renderer = new google.maps.DirectionsRenderer({
                    draggable : true
                });
        this.renderer.setMap(map);
        google.maps.event.addListener(this.renderer, 'directions_changed',
                this.updateRoute.bind(this));
        this.bindEvents();
    };

    Router.prototype = {

        travelMode : 'WALKING',

        origin : null,

        destination : null,

        route : null,

        /**
         * Adds listeners to map events to build the route
         */
        bindEvents : function() {
            google.maps.event.addListener(this.map, 'click', function(evt) {
                        if (!this.origin) {
                            this.origin = new google.maps.Marker({
                                        position : evt.latLng,
                                        map : this.map,
                                        draggable : true,
                                        type : 'start'
                                    });
                            return;
                        }
                        if (!this.destination) {
                            this.destination = new google.maps.Marker({
                                        position : evt.latLng,
                                        map : this.map,
                                        draggable : true,
                                        type : 'dest'
                                    });
                            this.createRoute(this.origin.getPosition(),
                                    this.destination.getPosition());
                        }
                    }.bind(this));
        },

        /**
         * Requests the route, both endpoints are specified
         * 
         * @param {google.maps.LatLng}
         *            start
         * @param {google.maps.LatLng}
         *            end
         */
        createRoute : function(start, end) {
            this.geocoder.route({
                        origin : start,
                        destination : end,
                        travelMode : google.maps.TravelMode[this.travelMode]
                    }, function(response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            this.clear();
                            this.renderer.setDirections(response);
                            this.updateRoute(response.routes[0]);
                        }
                    }.bind(this));
        },

        /**
         * Updates route data
         * 
         * @param {google.maps.DirectionsResult}
         *            [route]
         */
        updateRoute : function(route) {
            this.route = route || this.renderer.getDirections().routes[0];
            this.drawBounds(this.route.bounds);
        },

        /**
         * Draws and updates route bounds
         * 
         * @param {google.maps.LatLngBounds}
         */
        drawBounds : function(bounds) {
            var options = {
                bounds : bounds,
                strokeWeight : 0.5,
                fillOpacity : 0,
                strokeColor : '#009bd9',
                map : this.map
            };
            if (!this.routeBounds) {
                this.routeBounds = new google.maps.Rectangle(options);
            } else {
                this.routeBounds.setOptions(options);
            }
        },

        /**
         * Clears route.
         */
        clear : function() {
            if (this.origin) {
                this.origin.setMap(null);
                delete this.origin;
            }
            if (this.destination) {
                this.destination.setMap(null);
                delete this.destination;
            }
        }

    };

    /***************************************************************************
     * Foursquare client controller
     * 
     * @class Foursquare
     **************************************************************************/
    var Foursquare = function(router, map) {
        this.router = router;
        this.map = map;
        this.client =
                new FourSquareClient(FOURSQUARE_CLIENT_KEY,
                        FOURSQUARE_SECRET_KEY, window.location.href, true);
        this.retrieveCategories();
    };

    Foursquare.prototype = {

        /**
         * Retrieves categories cache
         */
        retrieveCategories : function() {
            $.ajax({
                        url : 'categories.json',
                        method : 'get',
                        type : 'json',
                        success : function(response) {
                            this.categoriesCache = response.response.categories;
                            console.log('categories_received')
                            event.fire(this, 'categories_received',
                                    this.categoriesCache);
                        }.bind(this)
                    });
        },

        /***********************************************************************
         * Requests the venues
         * 
         * @param {google.maps.LatLngBounds}
         *            bounds
         * @param {String[]}
         *            categories
         * @param {Funtion}
         *            callback
         */
        explore : function(bounds, categories, callback) {
            var sw = bounds.getSouthWest(),
                ne = bounds.getNorthEast();
            this.client.search({
                        intent : 'browse',
                        categoryId : categories || null,
                        ne : [sw.lat(), sw.lng()],
                        ne : [ne.lat(), ne.lng()]
                    });
        }
    };

    /***************************************************************************
     * Main app
     * 
     * @class App
     **************************************************************************/
    var App = this.App = function() {
        this.createMap();
        this.positionMapByUserLocation(this.initControllers.bind(this));
    };

    App.prototype = {

        /**
         * Default zoom to init
         * 
         * @type Number
         */
        defaultZoom : 14,

        /**
         * Inits controllers.
         */
        initControllers : function() {
            this.router = new Router(this.map);
            this.poiSource = new Foursquare(this.router, this.map);
            this.bindEvents();
        },

        /**
         * Binds controls together
         */
        bindEvents : function() {
            event.on(this.poiSource, 'categories_received', this.renderCategories
                            .bind(this));
            console.log('evt listener added');
            $('#explore-button').click(function() {
                if (this.router.route) {
                    this.poiSource.explore(this.router.route.bounds, null,
                            function(response) {
                                console.log(response);
                            });
                }
            }.bind(this));
        },

        renderCategories : function(categories) {
            console.log('render', arguments);
            $('#categories-filter').html(this.renderCategoriesRaw(categories));
        },

        /**
         * Renders categories filter in the sidebar
         */
        renderCategoriesRaw : function(categories) {
            var html = '<ul>';
            for (var i = 0, ii = categories.length; i < ii; i++) {
                var category = categories[i];
                html +=
                        '<li><label for="category-checkbox-'
                                + category.id
                                + '"><input type="checkbox" id=category-checkbox-'
                                + category.id + '"> ' + category.name
                                + '</label>';
                if (category.categories && category.categories.length !== 0) {
                    html += this.renderCategoriesRaw(category.categories);
                }
                html += '</li>'
            }
            return (html + '</ul>');
        },

        /**
         * Creates map, no initialization yet
         */
        createMap : function() {
            $(window).on('resize', this.updateMapSize.bind(this));
            this.updateMapSize();
            this.map = new google.maps.Map(document.getElementById('map'), {
                        mapTypeId : google.maps.MapTypeId.ROADMAP
                    });
        },

        /**
         * Updates map size on resize.
         */
        updateMapSize : function() {
            var navHeight = $('.navbar').height();
            $('.panel').css({
                        height : ($(document).height() - navHeight * 2),
                        top : navHeight
                    });
        },

        /**
         * Requests geolocation and adjusts position and zoom
         */
        positionMapByUserLocation : function(callback) {
            navigator.geolocation.getCurrentPosition(function(position) {
                        var coords = position.coords,
                            center =
                                    new google.maps.LatLng(coords.latitude,
                                            coords.longitude);

                        google.maps.event.addListenerOnce(this.map,
                                'bounds_changed', function() {
                                    var spot = new google.maps.Circle({
                                                center : center,
                                                radius : coords.accuracy * 4,
                                                map : this.map
                                            });
                                    this.map.fitBounds(spot.getBounds());
                                    spot.setMap(null);
                                    callback();
                                }.bind(this));
                        this.map.setOptions({
                                    center : center,
                                    zoom : this.defaultZoom
                                });
                    }.bind(this));
        }
    };

})();
