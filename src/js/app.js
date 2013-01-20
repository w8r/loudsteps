(function() {

    var event = require('bean'),
        _ = require('underscore');

    /***************************************************************************
     * Routing class
     * 
     * @class Router
     **************************************************************************/
    var Router = function(map) {
        this.map = map;
        this.geocoder = new google.maps.DirectionsService();
        this.renderer = new google.maps.DirectionsRenderer({
                    draggable : true,
                    polylineOptions : {
                        strokeColor : '#11b6f7',
                        strokeWeight : 6
                    }
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
            event.fire(this, 'route_updated', this.route);
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
        clear : function(total) {
            if (this.origin) {
                this.origin.setMap(null);
                delete this.origin;
            }
            if (this.destination) {
                this.destination.setMap(null);
                delete this.destination;
            }
            event.fire(this, 'route_updated', this.route);
        }

    };

    /***************************************************************************
     * Foursquare client controller
     * 
     * @class Foursquare
     **************************************************************************/
    var Foursquare = function(router, map, clientKey, secretKey) {
        this.router = router;
        this.map = map;
        this.client =
                new FourSquareClient(clientKey, secretKey,
                        window.location.href, true);
        this.retrieveCategories();
    };

    Foursquare.prototype = {

        markers : [],

        circles : [],

        /**
         * Retrieves categories cache
         */
        retrieveCategories : function() {
            $.ajax({
                        url : /* 'categories.json', */'selected_categories.json',
                        method : 'get',
                        type : 'json',
                        success : function(response) {
                            this.categoriesCache = response.response.categories;
                            event.fire(this, 'categories_received',
                                    [this.categoriesCache]);
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
            this.client.venuesClient.search({
                        intent : 'browse',
                        categoryId : categories || null,
                        sw : [sw.lat(), sw.lng()],
                        ne : [ne.lat(), ne.lng()]
                    }, {
                        onSuccess : this.putPOIs.bind(this)
                    });
        },

        /**
         * Puts poi's on the map
         * 
         * @param {Array}
         *            data
         */
        putPOIs : function(data) {
            var POIs = data.response.venues, marker, icon, poi, size, circle, pos;
            this.clearPOIs();
            for (var i = 0, len = POIs.length; i < len; i++) {
                poi = POIs[i];
                icon = poi.categories[0].icon;
                size = parseInt(icon.sizes[0]);
                pos =
                        new google.maps.LatLng(poi.location.lat,
                                poi.location.lng);

                circle = new google.maps.Circle({
                            center : pos,
                            radius : 50,
                            strokeColor : '#11b6f7',
                            fillColor : '#009bd9',
                            fillOpacity : 0.2,
                            strokeWeight : 0.5,
                            map : this.map
                        });
                this.circles.push(circle);

                marker = new google.maps.Marker({
                            map : this.map,
                            icon : {
                                url : icon.prefix + size + icon.name,
                                size : new google.maps.Size(size, size),
                                anchor : new google.maps.Point(size / 2,
                                        (size / 2))
                            },
                            visible : true,
                            title : poi.name,
                            position : pos
                        });
                this.markers.push(marker);
            }
        },

        /**
         * Clears categories markers.
         */
        clearPOIs : function() {
            var marker;
            while (marker = this.markers.pop()) {
                marker.setMap(null);
                this.circles.pop().setMap(null);
            }
        }
    };

    /***************************************************************************
     * Echonest client wrapper
     * 
     * @class Echonest
     **************************************************************************/
    var Echonest = function(api_key) {
        this.client = new EchoNest(api_key);
    };

    Echonest.prototype = {
        getGenresList : function(callback) {
            this.client.list_genres(function(response) {
                        callback(response.data.genres);
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

        constructor : App,

        /**
         * Default zoom to init
         * 
         * @type Number
         */
        defaultZoom : 14,

        genres : [],

        /**
         * Inits controllers.
         */
        initControllers : function() {
            this.router = new Router(this.map);
            this.poiSource =
                    new Foursquare(this.router, this.map,
                            FOURSQUARE_CLIENT_KEY, FOURSQUARE_SECRET_KEY);
            this.dataSource = new Echonest(ECHONEST_API_KEY);
            this.dataSource.getGenresList(this.initGenres.bind(this));
            this.bindEvents();
        },

        initGenres : function(genres) {
            this.genres = genres;
            $('#categories-filter .tagManager').each(function(input) {
                input = $(input);
                var container = input.previous(),
                    trigger = input.next();

                trigger.click(function() {
                            var el = $(this);
                            if (el.hasClass('icon-tag')) {
                                el.find('.icon').removeClass('icon-tag')
                                        .addClass('icon-chevron-left');
                                input.removeClass('hide');
                            } else {
                                el.find('.icon').addClass('icon-tag')
                                        .removeClass('icon-chevron-left');
                                input.addClass('hide');
                            }
                        });
                input.click(function(evt) {
                            evt.stopPropagation();
                        }).tagsManager({
                            prefilled : (input.data('genres') || '').split(','),
                            preventSubmitOnEnter : true,
                            typeahead : true,
                            typeaheadAjaxSource : null,
                            typeaheadSource : this.getGenres.bind(this),
                            preventSubmitOnEnter : true,
                            delimeters : [44, 188, 13],
                            backspace : [8],
                            tagsContainer : container,
                            tagClass : 'label label-info genre-tag',
                            tagCloseIcon : '&times'
                        });
            }.bind(this));
        },

        /**
         * Binds controls together
         */
        bindEvents : function() {
            event.on(this.poiSource, 'categories_received',
                    this.renderCategories.bind(this));
            event.on(this.router, 'route_updated', function(route) {
                        var routeless = !route,
                            button = $('#explore-button'),
                            dis = 'disabled';
                        if (routeless) {
                            button.attr(dis, true).addClass(dis);
                        } else {
                            button.removeAttr(dis).removeClass(dis);
                        }
                    });
            $('#explore-button').click(function() {
                if (this.router.route) {
                    this.poiSource.explore(this.router.route.bounds, this
                                    .getCategoriesIds(), function(response) {
                                console.log(response);
                            });
                }
            }.bind(this));
        },

        /**
         * Filters categories IDs for 4sq API
         */
        getCategoriesIds : function() {
            var inputs = $('#categories-filter input'),
                res = [];
            for (var i = 0, len = inputs.length; i < len; i++) {
                var input = inputs[i];
                if (input.checked) {
                    res.push(input.id.replace('category-checkbox-', ''));
                }
            }
            return res;
        },

        /**
         * Autocompleter for the genre tagger
         */
        getGenres : function() {
            return _.map(this.genres, function(genre) {
                        return genre.name;
                    });
        },

        /**
         * Applies pre-stored preset
         * 
         * @param {Array}
         *            categories
         * @returns {Array} categories
         */
        applyPreset : function(categories) {
            return categories;
        },

        renderCategories : function(categories) {
            $('#categories-filter').html(this.renderCategoriesRaw(this
                    .applyPreset(categories)));
        },

        /**
         * Renders categories filter in the sidebar
         */
        renderCategoriesRaw : function(categories) {
            var html = '<ul class="unstyled">';
            for (var i = 0, ii = categories.length; i < ii; i++) {
                var category = categories[i];
                html +=
                        '<li><label class="checkbox" for="category-checkbox-'
                                + category.id
                                + '"><input type="checkbox" id="category-checkbox-'
                                + category.id
                                + '" checked="true"> '
                                + category.name
                                + '</label><div class="input-append">'
                                + '<div></div><input type="text" class="tagManager genres" '
                                + 'name="genres-' + category.id
                                + '" data-provide="typeahead" '
                                + 'data-genres="" autocomplete="off" />'
                                + '<span class="btn"><i class="icon icon-tag">'
                                + '</i></span></div>';

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
