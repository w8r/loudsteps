/* jslint browser: true *//* globals server_info getPlayer _ jQuery console FB *//**
                                                                                 * R
                                                                                 * The
                                                                                 * R
                                                                                 * namespace
                                                                                 * is
                                                                                 * the
                                                                                 * catchall
                                                                                 * for
                                                                                 * all
                                                                                 * Rdio
                                                                                 * application
                                                                                 * code.
                                                                                 */
(function(a) {
    var b = this,
        c = (new Date).getTime();
    typeof R == "undefined" && (R = {}), $.extend(R, {
        truncate : function(a, b) {
            return a ? a.length <= b ? a : a.substring(0, b) + "..." : ""
        },
        isDesktop : /com.rdio.desktop/.test(navigator.userAgent.toLowerCase()),
        isMacDesktop : /com.rdio.desktop.mac/.test(navigator.userAgent
                .toLowerCase()),
        isWinDesktop : /com.rdio.desktop.win/.test(navigator.userAgent
                .toLowerCase()),
        usesNewHeader : /com.rdio.desktop.new_header/.test(navigator.userAgent
                .toLowerCase()),
        doNothing : function() {
        },
        injectScript : function(a, b, c, d) {
            var e = document.getElementsByTagName("head")[0],
                f = document.createElement("script");
            return f.type = "text/javascript", f.src = a, f.async = !0, c
                    && (f.onload = f.onreadystatechange = function() {
                        if (f.readyState && f.readyState != "complete"
                                && f.readyState != "loaded")
                            return;
                        f.onload = f.onreadystatechange = null, c(a)
                    }), d && (f.onerror = d), b ? b.appendChild(f) : e
                    .appendChild(f), f
        },
        fbInit : function(b, c) {
            var d = "https://" + document.location.host + "/fb_channel.html", e, f;
            window.fbAsyncInit = function() {
                FB.init({
                            appId : a().fbid,
                            status : !0,
                            cookie : !0,
                            xfbml : !0,
                            music : !b,
                            channelUrl : d
                        }), c && typeof c == "function" && c()
            }, f =
                    "https://connect.facebook.net/" + a().fbLocale
                            + "/all/vb.js", this.injectScript(f,
                    $("#fb-root")[0])
        },
        enableLogging : function() {
            a().debug = !0, typeof getPlayer != "undefined" && getPlayer()
                    && getPlayer()._enableLogging()
        },
        templateViews : {},
        isStation : function(a) {
            if (!a)
                return !1;
            var b =
                    ["p", "t", "a", "al", "rl", "l", "r", "s", "ct", "mr", "g",
                            "ver", "vsr", "vr", "st", "ne", "cs"], c;
            return _.isString(a) && (c = a), a.type ? c = a.type : a.has
                    && a.has("type") && (c = a.get("type")), c ? _
                    .indexOf(b, c) === -1 : !1
        },
        changeLocale : function(a) {
            R.Api.request({
                        method : "changeLocale",
                        content : {
                            locale : a
                        },
                        successCallback : function() {
                            document.location.reload()
                        }
                    })
        },
        reload : typeof _ != "undefined" ? _.once(function() {
                    var a = new Date;
                    console.log("Reloading!"), c + 6e4 > a.getTime() ? _.delay(
                            function() {
                                window.location.reload()
                            }, 3e3) : window.location.reload()
                }) : window.location.reload,
        Components : {},
        Models : {},
        Mixins : {},
        isMaster : !1,
        serverInfo : new Backbone.Model(Env.serverInfo),
        VERSION : Env.VERSION
    }), String.prototype.trim || (String.prototype.trim = function() {
        return $.trim(this)
    })
})(function() {
            return R.serverInfo ? R.serverInfo.attributes : server_info
        }), function() {
    var a = "all";
    R.logger = {
        _originalLog : _.isUndefined(window.console)
                ? R.doNothing
                : console.log,
        _originalError : _.isUndefined(window.console)
                ? R.doNothing
                : console.error,
        logQueue : [],
        _log : function(a, b, c) {
            a[0] = "[" + Date() + "] " + a[0], this.logQueue.unshift(a
                    .join(" ")), this.logQueue.length >= 10
                    && this.logQueue.pop();
            if (!c)
                return;
            try {
                jQuery.browser.msie ? b(a[0]) : b.apply(console, a)
            } catch (d) {
            }
        },
        log : function() {
            this._log(_.toArray(arguments), this._originalLog, a === "all")
        },
        error : function() {
            this._log(_.toArray(arguments), this._originalError, a !== "none")
        },
        verbosity : function(b) {
            if (_.isUndefined(b))
                return a;
            b === "all" || b === "errors" || b === "none"
                    ? a = b
                    : this
                            ._originalError("Invalid argument passed to R.logger.verbosity()")
        },
        ensureConsole : function() {
            var a = _.bind(R.logger.log, R.logger),
                b = _.bind(R.logger.error, R.logger);
            _.isUndefined(window.console) && (window.console = {}), _.defaults(
                    console, {
                        log : a,
                        info : a,
                        warn : b,
                        error : b,
                        exception : b,
                        assert : function(a, b) {
                            a || this.error("Assertion failed: " + b)
                        },
                        dir : R.doNothing,
                        time : R.doNothing,
                        timeEnd : R.doNothing,
                        trace : R.doNothing
                    }), R.serverInfo.get("prod") && _.extend(window.console, {
                        log : a,
                        info : a,
                        warn : b,
                        error : b,
                        exception : b
                    })
        }
    }, R.logger.ensureConsole()
}(), function() {
    function d(a) {
        console.error("Could not parse ", a.filename + ":", a.message, a)
    }
    var a = this,
        b = 0,
        c = [];
    R.StyleManager = {
        loadComponentLess : function(b, c) {
            var e = {
                filename : b + ".less"
            };
            if (!a.less)
                throw new Error("Less.js is not loaded, cannot parse Less!");
            try {
                (new less.Parser(e)).parse(c, function(a, c) {
                            if (a) {
                                d(a);
                                return
                            }
                            R.StyleManager.loadComponentCss(b, c.toCSS())
                        })
            } catch (f) {
                d(f)
            }
        },
        beginLoadingCss : function() {
            b++
        },
        commitCss : function() {
            var a;
            b--;
            if (!b) {
                if (!c.length)
                    return;
                a = c.join("\n"), c = [];
                if (document.createStyleSheet)
                    return R.StyleManager._ieLoadCss(a);
                var d,
                    e = _.uniqueId("component_css"),
                    f = R.StyleManager._createStyleEl(e);
                return d = document.createTextNode(a), f.appendChild(d), e
            }
        },
        loadComponentCss : function(a, b) {
            b && c.push(b)
        },
        _createStyleEl : function(a) {
            var b = document.createElement("style");
            return b.type = "text/css", b.media = "screen", b.id = a, document
                    .getElementsByTagName("head")[0].appendChild(b), b
        },
        _ieLoadCss : function(a) {
            var b = "css_for_components",
                c = document.getElementById(b);
            return c || (c = R.StyleManager._createStyleEl(b)), c.styleSheet.cssText +=
                    a, b
        },
        reset : function() {
            b = 0, c = []
        }
    }
}(), function() {
    var a = Bujagali.View.prototype,
        b = /^(http[s]?:)?\/\//;
    R.Component = Bujagali.View.extend({
        dependencies : [],
        libraries : [],
        requiredFields : [],
        cache : !0,
        onFetchError : "NotFound",
        initialize : function(b) {
            b && b.extraClassName && $(this.el).addClass(b.extraClassName), this._eventHandlers =
                    [], this.listen(R.loader, "loaded:" + this._name,
                    this._componentChanged), a.initialize
                    .apply(this, arguments), this.model
                    && (this.listen(this.model, "remove", this.onModelRemoved), this
                            .onModelCreated())
        },
        _readyToRender : function(b, c) {
            var d = this;
            return a.render.call(d, {
                        data : d.model || new Backbone.Model,
                        deps : R.loader.model.get("components").get(d._name)
                    }, function() {
                        b && b()
                    }, c)
        },
        mixin : function(a, b) {
            var c = this;
            if (!a)
                throw new Error("Mixin not defined");
            _.each(a, function(a, b) {
                        if (!c[b])
                            c[b] = a;
                        else {
                            var d = c[b],
                                e = a;
                            c[b] = function() {
                                d.apply(this, arguments), e.apply(this,
                                        arguments)
                            }
                        }
                    }), a.className && $(this.el).addClass(a.className), a.onMixin
                    && a.onMixin.call(this, b || {})
        },
        listen : function(a, b, c) {
            this._eventHandlers.push([a, b, c]), a.bind(b, c, this)
        },
        stopListening : function(a, b, c) {
            var d = this;
            _.each(d._eventHandlers, function(e, f) {
                        a == e[0]
                                && (b && b == e[1] ? c && c == e[2] ? d
                                        ._removeEventHandler(e) : c
                                        || d._removeEventHandler(e) : b
                                        || d._removeEventHandler(e))
                    })
        },
        bubbleEvent : function(a, b) {
            var c = this;
            b.targetComponent = this;
            while (c && !b.isPropagationStopped())
                b.currentComponent = c, c.trigger.apply(c, arguments), c =
                        c.parent();
            return !b.isDefaultPrevented()
        },
        _removeEventHandler : function(a, b) {
            a[0].unbind(a[1], a[2], this), delete this._eventHandlers[b]
        },
        _componentChanged : function() {
            var a = $.Event();
            a.component = this, this.bubbleEvent("componentChanged", a)
                    && this.destroy()
        },
        ensureModel : function(a) {
            var b = this;
            a = a || R.doNothing;
            if (b.model || !b.modelClass && !b.modelFactory) {
                b._verifyModelType(), b.model && b._addModelFields() ? b
                        ._fetchModel(a) : a();
                return
            }
            var c = b.modelFactory,
                d = b.modelClass;
            c ? b.model = c.call(b) : d && _.isFunction(d) && (b.model = new d), b
                    ._verifyModelType(), b.listen(b.model, "remove",
                    b.onModelRemoved);
            var e = !_.isUndefined(b.model.shouldFetch),
                f = R.Utils.value.call(b.model, b.model.shouldFetch);
            e && f || !e && b.model.method ? (b._addModelFields(), b
                    ._fetchModel(function() {
                                b.onModelCreated(), a()
                            })) : (b.onModelCreated(), a())
        },
        _addModelFields : function() {
            var a;
            if (this.requiredFields.length > 0) {
                a =
                        _.difference(this.requiredFields, this.model
                                        .getAllFields());
                if (a.length > 0)
                    return this.model.addFieldRefs(a), !0
            }
            return !1
        },
        _fetchModel : function(a) {
            var b = this;
            b.pendingFetch = b.model.fetch({
                success : function(c, d) {
                    b.pendingFetch = null, a()
                },
                error : function(a, c) {
                    b.pendingFetch = null, b.trigger("fetchError", a, c), console
                            .error("Request failed: " + c.statusText)
                },
                silent : !0
            })
        },
        isType : function(a, b) {
            return a instanceof b
        },
        _verifyModelType : function() {
            var a = this,
                b = a.modelClass,
                c = a.model;
            if (b && c) {
                if (_.isFunction(b) && !a.isType(c, b))
                    throw new TypeError("Model is not correct type");
                if (_.isArray(b)) {
                    var d = _.any(b, function(b) {
                                return a.isType(c, b)
                            });
                    if (!d)
                        throw new TypeError("Model is not correct type")
                }
            }
        },
        render : function(a, b) {
            return this._willBeDestroyed ? a ? a() : null : (this.ensureModel
                    ? this.ensureModel(_.bind(this._readyToRender, this, a, b))
                    : this._readyToRender(a, b), this)
        },
        renderNewChild : function(a, b, c, d) {
            if (!a)
                throw new TypeError("Cannot render a null child");
            var e = this;
            return c = c || R.doNothing, e.addChild(a), a.render(function() {
                        var f = d && d.where ? d.where : "append",
                            g = e.$el;
                        b && b !== e.$el && (g = e.$(b)), g[f](a.el), e
                                .trigger("childRender", a), c()
                    }), a
        },
        remove : function() {
            a.remove.apply(this, arguments), this.isInserted()
                    && this.onDetached()
        },
        destroy : function() {
            var b = this;
            this._willBeDestroyed
                    || (this._willBeDestroyed = !0, a.destroy.apply(b,
                            arguments), _.defer(function() {
                                if (b._destroyed)
                                    return;
                                b._destroyed = !0, _.each(b._eventHandlers,
                                        function(a) {
                                            a[0].unbind(a[1], a[2], b)
                                        }), b._eventHandlers = null, b
                                        .onDestroyed(), b.unbind(), $(b.el)
                                        .unbind(), b.options
                                        && (b.options = null), b.model
                                        && (b.model = null), b.pendingFetch
                                        && (b.pendingFetch.abort(), b.pendingFetch =
                                                null), b._destroyComplete = !0
                            }))
        },
        isDestroyed : function() {
            return this._destroyed
        },
        isDestroyComplete : function() {
            return this._destroyComplete
        },
        invalidate : function() {
            var a = $.Event();
            this.invalidated = !0, this.bubbleEvent("invalidate", a)
        },
        findChild : function(a) {
            return _.find(this.children, a)
        },
        findChildWithModel : function(a) {
            return this.findChild(function(b) {
                        return b.model === a
                    })
        },
        findAllChildren : function(a) {
            var b = _.clone(this.children),
                c = [], d;
            while (!_.isEmpty(b))
                d = b.shift(), _.isObject(d) && a(d) && c.push(d), _
                        .isArray(d.children)
                        && (b = b.concat(d.children));
            return c
        },
        invokeChildren : function(a, b) {
            var c = _.rest(arguments, 2);
            _.isString(a) && (a = R.Component.getObject(a));
            var d = _.each(this.children, function(d) {
                        d instanceof a && d[b].apply(d, c)
                    })
        },
        onInserted : R.doNothing,
        onDetached : R.doNothing,
        onModelRemoved : R.doNothing,
        onModelCreated : R.doNothing,
        onDestroyed : R.doNothing
    }, {
        create : function(a, c, d) {
            var e = c.dependencies,
                f = R.Utils.value(c.libraries),
                g = a.split("."),
                h = _.last(g),
                i =
                        ["client/Components/", g.join("/"), "/", h, ".bg.html"]
                                .join(""),
                j = R.loader.model.get("components").get(a),
                k = j ? j[i] : !1,
                l = g.join("_");
            j || console.warn("could not find version for " + a), f
                    && R.serverInfo.get("prod") && (f = _.map(f, function(a) {
                                return b.test(a) ? a : "/media" + a
                            })), c = _.extend({
                        template : k ? i : null,
                        _name : a,
                        superClass : R.Component
                    }, c);
            var m = _.after(2, function() {
                        R.loader.loaded(a)
                    });
            R.loader.loadExternalScripts(f, function() {
                        m()
                    }), R.loader.load(e, function() {
                        var a = c.superClass;
                        _.isString(a)
                                && (c.superClass = R.Component.getObject(a), a =
                                        c.superClass);
                        var b = a;
                        while (b != R.Component)
                            l = b.prototype.className + " " + l, b =
                                    b.prototype.superClass;
                        c.className = c.className ? l + " " + c.className : l;
                        var e = R.Component.getObject(_.initial(g), !0),
                            f = a.extend(c, d);
                        e[h] && _.extend(f, e[h]), e[h] = f, e[h].version = j, m()
                    })
        },
        getObject : function(a, b) {
            var c, d,
                e = R.Components;
            _.isString(a) && (a = a.split("."));
            for (c = 0; c < a.length; c++) {
                d = a[c], b && !e[d] && (e[d] = {}), e = e[d];
                if (!e)
                    return null
            }
            return e
        },
        callSuper : function c(a, b) {
            var d;
            return arguments.length >= 3
                    ? d = _.toArray(arguments).slice(2)
                    : d = (c.caller || arguments.callee.caller).arguments, this.prototype.superClass.prototype[b]
                    .apply(a, d)
        }
    })
}(), function() {
    var a = function(a) {
        this.options = a || {}, this._readyState = R.Services.STATE_NOT_READY, this
                .initialize(), this.trigger("initialized")
    };
    a.extend = Backbone.View.extend, _.extend(a.prototype, Backbone.Events, {
        isGlobal : !1,
        initialize : function() {
            this.onInitialized()
        },
        onInitialized : R.doNothing,
        isReady : function() {
            return this._readyState == R.Services.STATE_READY
        },
        onStarted : function(a) {
            a()
        },
        onStopping : R.doNothing,
        onStopped : R.doNothing,
        onAppCreated : R.doNothing,
        isUsable : function() {
            return !0
        },
        getCaps : function() {
            return undefined
        },
        _setReadyState : function(a) {
            if (this._readyState == a)
                return;
            switch (a) {
                case R.Services.STATE_READY :
                    var b = this,
                        c = function() {
                            b._readyState = a, b.isReady()
                                    && (console.log("[Services] " + b._name
                                            + " is ready"), b.trigger("ready"), R.Services
                                            .trigger(b._name + ":ready"))
                        };
                    this.onStarted(c);
                    break;
                case R.Services.STATE_STOPPED :
                    try {
                        this.onStopped()
                    } catch (d) {
                        R.Utils.logException("Error stopping service "
                                        + this._name, d)
                    }
                    this._readyState = a;
                    break;
                case R.Services.STATE_STOPPING :
                    this.onStopping(), this._readyState = a;
                    break;
                default :
                    console.error("Unable to handle new ready state: ", a)
            }
        }
    }), R.Services = function() {
    }, _.extend(R.Services, Backbone.Events, {
        _serviceKlasses : {},
        _activeServices : {},
        register : function(b, c, d) {
            var e = a.extend(c);
            d = d || {}, _.defaults(d, {
                        priority : this._serviceKlasses[b]
                                ? this._serviceKlasses[b].length + 1
                                : 1,
                        id : Math.random()
                    }), e.prototype._name = b, e.prototype.__options = d, this._serviceKlasses[b]
                    && this._serviceKlasses[b].length
                    ? (console
                            .assert(
                                    e.prototype.isGlobal == this._serviceKlasses[b][0].prototype.isGlobal,
                                    "[Services] all implementations of " + b
                                            + " must agree on isGlobal"), this._serviceKlasses[b]
                            .push(e))
                    : this._serviceKlasses[b] = [e]
        },
        unregister : function(a) {
            this.stop(a), delete this._serviceKlasses[a]
        },
        start : function(a, b) {
            b = b || {};
            if (a) {
                if (this._activeServices[a])
                    console.log("Service named " + a + " already exists");
                else {
                    if (!this._serviceKlasses[a]) {
                        console.log("No service named ", a);
                        return
                    }
                    this._createService(a, b[a])
                }
                this._activeServices[a].isUsable()
                        && this._activeServices[a]
                                ._setReadyState(this.STATE_READY)
            } else {
                var c = [],
                    d = this;
                _.each(this._serviceKlasses, function(a, e) {
                            e in d._activeServices
                                    || (d._createService(e, b[e]), c.push(e))
                        }), _.each(c, function(a) {
                            d._activeServices[a].isUsable()
                                    && d._activeServices[a]
                                            ._setReadyState(d.STATE_READY)
                        })
            }
        },
        stop : function(a) {
            var b = this,
                c = a ? [a] : _.keys(this._serviceKlasses),
                d = [];
            _.each(c, function(a) {
                        b._activeServices[a]
                                && b._activeServices[a].isReady()
                                && (b._activeServices[a]
                                        ._setReadyState(b.STATE_STOPPING), d
                                        .push(a))
                    }), _.each(d, function(a) {
                        b._activeServices[a]._setReadyState(b.STATE_STOPPED)
                    }), _.each(c, function(a) {
                        b._deleteReferences(a)
                    })
        },
        appCreated : function(a) {
            var b = this;
            _.each(this._serviceKlasses, function(c, d) {
                        b._activeServices[d] && b._activeServices[d].isUsable()
                                && b._activeServices[d].onAppCreated(a)
                    })
        },
        ready : function(a, b) {
            if (this._activeServices[a] && this._activeServices[a].isReady())
                b();
            else {
                var c = a + ":ready";
                this.bind(c, function() {
                            this.unbind(c, arguments.callee), b()
                        })
            }
        },
        getCaps : function() {
            function b(a, c) {
                _.each(c, function(c, d) {
                            if (d in a)
                                if (_.isObject(c) && _.isObject(a[d]))
                                    b(a[d], c);
                                else
                                    throw new Error("[Services] getCaps collision on "
                                            + d
                                            + " combining "
                                            + c
                                            + " and "
                                            + a[d]);
                            else
                                a[d] = c
                        })
            }
            var a = this,
                c = {};
            return _.each(this._serviceKlasses, function(d, e) {
                        if (a._activeServices[e]
                                && a._activeServices[e].isUsable()) {
                            var f = a._activeServices[e].getCaps();
                            f && b(c, f)
                        }
                    }), c
        },
        _createService : function(a, b) {
            var c = _.sortBy(this._serviceKlasses[a], function(a) {
                        return a.prototype.__options.priority
                    }),
                d = null;
            for (var e = 0; e < c.length; e++) {
                d = new c[e](b);
                if (d.isUsable())
                    break
            }
            if (d === null) {
                console
                        .error("Unable to find a usable implementation for service: "
                                + a);
                return
            }
            var f = this;
            d.bind("remove", function() {
                console.log("[Services] A service implementation of type " + a
                        + " failed and asked to be removed, doing so now"), f._serviceKlasses[a] =
                        _.reject(f._serviceKlasses[a], function(a) {
                                    return a.prototype.__options.id == d.__options.id
                                }), f.stop(a), f.start(a)
            }), this._activeServices[a] = d;
            if (d.isGlobal) {
                var g = R.Utils.lowerCaseInitial(a);
                console.assert(!(g in R),
                        "[Services] global slot should be empty for " + g), R[g] =
                        d
            } else
                console.assert(!(a in this),
                        "[Services] local slot should be empty for " + a), this[a] =
                        d
        },
        _deleteReferences : function(a) {
            this._activeServices[a]
                    && (this._activeServices[a].isGlobal ? delete R[R.Utils
                            .lowerCaseInitial(a)] : delete this[a], delete this._activeServices[a])
        }
    }, {
        STATE_NOT_READY : 0,
        STATE_READY : 1,
        STATE_STOPPED : 2,
        STATE_STOPPING : 3
    }), $(window).bind("beforeunload", function(a) {
                R.Services.stop()
            })
}(), function() {
    function b(a) {
        return parseInt(a.getResponseHeader("X-Client-Version"), 10)
    }
    var a = {},
        c = {},
        d = R.serverInfo.get("media_address") + "client/Components/",
        e = R.serverInfo.get("theme");
    R.Services.register("Loader", {
        isGlobal : !0,
        onStarted : function(b) {
            _.bindAll(this, "onVersionChanged", "refreshModels",
                    "_successLoading", "_errorLoading", "_checkClientVersion",
                    "_requestReload");
            var c = R.Model.extend({
                        method : "getComponentVersions",
                        content : function() {
                            return {
                                app : R.serverInfo.get("app")
                            }
                        },
                        overrides : {
                            components : Backbone.Model,
                            app : Backbone.Model,
                            models : Backbone.Model
                        }
                    });
            a = {}, this._currentlyLoading = a, this.model =
                    new c(Env.Versions), this.model.get("components").bind(
                    "change", this.onVersionChanged), this.model.get("app")
                    .bind("change", this._requestReload), this.model
                    .get("models").bind("change", this.refreshModels), $(document)
                    .ajaxSuccess(this._checkClientVersion), b()
        },
        onStopped : function() {
            this.model.get("components")
                    .unbind("change", this.onVersionChanged), this.model
                    .get("app").unbind("change", this._requestReload), this.model
                    .get("models").unbind("change", this.refreshModels), a =
                    null
        },
        load : function(b, c) {
            var d = this;
            c = c || R.doNothing;
            if (!b || !b.length) {
                c();
                return
            }
            b = R.Utils.array(b), R.StyleManager.beginLoadingCss();
            var e = _.after(b.length, function() {
                        R.StyleManager.commitCss(), c()
                    });
            _.each(b, function(b) {
                var c = a[b],
                    f = R.Component.getObject(b),
                    g = d.model.get("components").get(b), h,
                    i = g && f && f.version && f.version.self != g.self;
                if (_.isFunction(f) && !i)
                    return e();
                if (!g)
                    throw R.StyleManager.commitCss(), new Error("No version information found for "
                            + b);
                c ? c.push(e) : (a[b] = [e], d._loadSource(b, g))
            })
        },
        loadExternalScripts : function(b, d) {
            var e = this;
            d = d || R.doNothing;
            if (!b || !b.length) {
                d();
                return
            }
            var f = _.after(b.length, function() {
                        d()
                    }),
                g = function(b) {
                    var c = a[b];
                    _.each(c, function(a) {
                                a()
                            }), delete a[b], e._successLoading(b)
                };
            _.each(b, function(b) {
                        var d = a[b];
                        d ? d.push(f) : (a[b] = [f], c[b] = 1, R.injectScript(
                                b, null, g, e._errorLoading))
                    })
        },
        _requestReload : function() {
            var a = $.Event();
            this.trigger("reload", a), a.isDefaultPrevented() || R.reload()
        },
        _loadSource : function(a, b) {
            var f = this,
                g = d + a;
            e && (g += "." + e);
            var h = g + "." + b.self + ".js";
            c[h] = 1, R.injectScript(h, null, f._successLoading,
                    f._errorLoading)
        },
        _successLoading : function(a) {
            delete c[a]
        },
        _errorLoading : function(a) {
            var b = this,
                d = $(a.target),
                e = d.attr("src"),
                f = c[e];
            f <= 3 ? _.defer(function() {
                R.injectScript(e, null, b._successLoading, b._errorLoading), c[e]++
            }, 100)
                    : R.reload()
        },
        loaded : function(b) {
            this.trigger("loaded:" + b);
            var c = a[b];
            _.each(c, function(a) {
                        a()
                    }), delete a[b]
        },
        refreshModels : function(a) {
            console.log("updating models"), this._requestReload()
        },
        _checkClientVersion : function(a, c, d) {
            var e = b(c);
            if (e && R.VERSION.version && e > R.VERSION.version) {
                console.log("Updating to client version", e);
                var f = this.model.fetch({
                    success : function(a, c) {
                        b(f) == e
                                ? (console.log("Successfully updated to", e), R.VERSION.version =
                                        e)
                                : console.log("Tried to update to", e,
                                        "but hit old server")
                    }
                })
            }
        },
        onVersionChanged : function(a, b) {
            var c = [],
                d = this;
            _.each(a.changedAttributes(), function(b, d) {
                        if (!b)
                            return;
                        R.Component.getObject(d)
                                && (console.log("Refreshing", d, b.self, a
                                                .previous(d).self), c.push(d))
                    }), this.load(c)
        }
    }, Backbone.Events)
}(), function(a) {
    function b() {
        this.url = "/api/1/"
    }
    var c = 20121006,
        d = 0,
        e = function(b) {
            return a.ajax(b)
        };
    b.prototype.setJsonReviver = function(a) {
        this._reviver = a
    }, b.prototype.getNumOutstandingRequests = function() {
        return d
    }, b.prototype._formatExtras = function(a) {
        var b = this;
        a = a || [], a.unshift("*.WEB");
        var c = _.any(a, _.isObject);
        return c && (a = _.map(a, function(a) {
                    return _.isString(a) && (a = {
                        field : a
                    }), !a.exclude && a.field.charAt(0) !== "*"
                            && (a.extras = b._formatExtras(a.extras)), a
                })), a._hasObjects = c, a
    }, b.prototype.request = function(b) {
        var f = this,
            g = arguments;
        b.content = b.content || {};
        var h = this._formatExtras(_.clone(b.content.extras));
        b.content.extras = h._hasObjects ? JSON.stringify(h) : h;
        if (!b.method) {
            R.logger.log('API ERROR: missing option "method"');
            return
        }
        b.content.method = b.method, b.template
                && (b.content.bgTemplate = b.template), b.success
                && (b.successCallback = b.success, delete b.success);
        var i = this._reviver ? "text" : "json",
            j = {
                type : "POST",
                url : this.url + b.method,
                data : b.content,
                dataType : i,
                success : function(a) {
                    f._reviver && (a = JSON.parse(a, f._reviver)), b.successCallback
                            && (b.template
                                    ? R.BG.render(b.template, a.result,
                                            b.successCallback, b.content)
                                    : a.status == "ok"
                                            ? b.successCallback(a)
                                            : b.error
                                                    && (console
                                                            .error(
                                                                    "Error in API call:",
                                                                    b, a), b
                                                            .error(a)))
                },
                cache : b.cache || !1
            };
        j.data || (j.data = {}), j.data._authorization_key =
                R.currentUser.get("authorizationKey"), j.data.v =
                R.serverInfo ? c : 0, _.extend(j, b), b.shieldElement
                && (j.beforeSend = function() {
                    a(b.shieldElement).loading()
                }, j.complete = function() {
                    a(b.shieldElement).loading({
                                hide : !0
                            })
                });
        var k = j.complete;
        return d++, j.complete = function() {
            d--, d === 0 && R.isPhantom
                    && window.alert("zeroRequestsOutstanding"), k
                    && k.apply(this, arguments)
        }, e(j)
    }, R.ApiRequestQueue = function() {
        this._queue = [], this._lock = !1
    }, _.extend(R.ApiRequestQueue.prototype, {
        push : function(a) {
            this._queue.push(a), this.isLocked()
                    || (this.lock(), this._processQueue())
        },
        _processQueue : function() {
            if (!this.isEmpty()) {
                var a = this._queue.shift(),
                    b = a.success ? a.success : R.doNothing,
                    c = a.error ? a.error : R.doNothing,
                    d = this;
                a.success = function() {
                    d.isEmpty() && (b(arguments[0]), d.unlock()), d
                            ._processQueue()
                }, a.error = function() {
                    c(), d.isEmpty()
                            || (console
                                    .error("Error encountered while processing queued commands. Remaining commands will not be processed."), d._queue =
                                    []), d.unlock()
                }, R.Api.request(a)
            }
        },
        lock : function() {
            this._lock = !0
        },
        unlock : function() {
            this._lock = !1
        },
        isLocked : function() {
            return this._lock
        },
        isEmpty : function() {
            return this._queue.length === 0
        }
    }), R.Api = new b
}(jQuery), R.Date = function() {
    function c(a, c) {
        return c == null && (c = b[0]), a < 10 ? c + a : a
    }
    function l(a) {
        var b = a.match(h);
        return parseInt("" + b[1] + parseInt(b[2], 10) * g[b[3]], 10)
    }
    function m(a) {
        return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0
    }
    function n(a, b) {
        return [31, m(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][b]
    }
    var a = {
        shortDays : [t("Sun"), t("Mon"), t("Tue"), t("Wed"), t("Thu"),
                t("Fri"), t("Sat")],
        longDays : [t("Sunday"), t("Monday"), t("Tuesday"), t("Wednesday"),
                t("Thursday"), t("Friday"), t("Saturday")],
        shortMonths : [t("Jan"), t("Feb"), t("Mar"), t("Apr"), t("May"),
                t("Jun"), t("Jul"), t("Aug"), t("Sep"), t("Oct"), t("Nov"),
                t("Dec")],
        longMonths : [t("January"), t("February"), t("March"), t("April"),
                t("May"), t("June"), t("July"), t("August"), t("September"),
                t("October"), t("November"), t("December")]
    },
        b = {
            "-" : "",
            _ : " ",
            0 : "0"
        },
        d = /[A-Z]{3}/g,
        e = {
            a : function(b) {
                return a.shortDays[b.getDay()]
            },
            A : function(b) {
                return a.longDays[b.getDay()]
            },
            b : function(b) {
                return a.shortMonths[b.getMonth()]
            },
            B : function(b) {
                return a.longMonths[b.getMonth()]
            },
            c : function(a) {
                return a.toString()
            },
            d : function(a, b) {
                return c(a.getDate(), b)
            },
            e : function(a, d) {
                return d == null && (d = b._), c(a.getDate(), d)
            },
            H : function(a, b) {
                return c(a.getHours(), b)
            },
            I : function(a) {
                return a.getHours() % 12 === 0 ? 12 : a.getHours() % 12
            },
            m : function(a, b) {
                return c(a.getMonth() + 1, b)
            },
            M : function(a, b) {
                return c(a.getMinutes(), b)
            },
            p : function(a) {
                var b = a.getHours();
                return b >= 12 ? "PM" : "AM"
            },
            S : function(a, b) {
                return c(a.getSeconds(), b)
            },
            x : function(a) {
                return R.Date.strftime(a, Locale.shortDate || "%m/%d/%y")
            },
            X : function(a) {
                return Locale.timeFormat ? R.Date
                        .strftime(a, Locale.timeFormat) : a
                        .toLocaleTimeString()
            },
            y : function(a) {
                return a.getFullYear().toString().slice(2)
            },
            Y : function(a) {
                return a.getFullYear()
            },
            Z : function(a) {
                var b = a.toString().match(d);
                return b && b.length ? b.pop() : ""
            },
            "%" : function() {
                return "%"
            }
        },
        f = /%([\-_0]?[A-z%])/g,
        g = {
            ms : 1,
            s : 1e3,
            m : 6e4,
            h : 36e5,
            d : 864e5,
            w : 6048e5,
            mo : 2592e6,
            y : 31536e6
        },
        h = /^(-?)([0-9]+)\s*(.*)$/,
        i = {
            minutes : 0,
            hours : 1,
            days : 2,
            weeks : 3,
            months : 4,
            years : 5
        },
        j = {
            years : function(a) {
                return t(["in [num] year", "in [num] years"], {
                            num : Math.round(a / l("-1y"))
                        })
            },
            months : function(a) {
                return t(["in [num] month", "in [num] months"], {
                            num : Math.round(a / l("-1mo"))
                        })
            },
            weeks : function(a) {
                return t(["in [num] week", "in [num] weeks"], {
                            num : Math.round(a / l("-1w"))
                        })
            },
            days : function(a) {
                return t(["in [num] day", "in [num] days"], {
                            num : Math.ceil(a / l("-1d"))
                        })
            },
            hours : function(a) {
                return t(["in one hour", "in [num] hours"], {
                            num : Math.round(a / l("-1h"))
                        })
            },
            minutes : function(a) {
                return t(["in a minute", "in [num] minutes"], {
                            num : Math.ceil(a / l("-1m"))
                        })
            }
        },
        k = {
            years : function(a) {
                return t(["[num] year ago", "[num] years ago"], {
                            num : Math.round(a / l("1y"))
                        })
            },
            months : function(a) {
                return t(["[num] month ago", "[num] months ago"], {
                            num : Math.round(a / l("1mo"))
                        })
            },
            weeks : function(a) {
                return t(["[num] week ago", "[num] weeks ago"], {
                            num : Math.round(a / l("1w"))
                        })
            },
            days : function(a) {
                return t(["[num] day ago", "[num] days ago"], {
                            num : Math.round(a / l("1d"))
                        })
            },
            hours : function(a) {
                return t(["[num] hour ago", "[num] hours ago"], {
                            num : Math.round(a / l("1h"))
                        })
            },
            minutes : function(a) {
                return t(["[num] minute ago", "[num] minutes ago"], {
                            num : Math.round(a / l("1m"))
                        })
            }
        };
    return {
        strftime : function(a, c) {
            if (!a)
                return "";
            var d = c.match(f);
            if (!d)
                return c;
            var g = d.length, h, i, j;
            for (var k = 0; k < g; k++)
                i = d[k], j = i.charAt(1), h = b[j], typeof h != "undefined"
                        && (j = i.charAt(2)), c = c.replace(i, e[j](a, h));
            return c
        },
        addMonths : function(a, b) {
            var c = a.getDate();
            a.setDate(1), a.setMonth(a.getMonth() + b * 1);
            var d = n(a.getFullYear(), a.getMonth());
            return a.setDate(Math.min(c, d)), a
        },
        formatCreditCardDate : function(a) {
            return _.isString(a) && (a = Bujagali.Utils.date(a, !0)), this
                    .strftime(a, "%m/%Y")
        },
        formatShortDate : function(a, b) {
            return _.isString(a) && (a = Bujagali.Utils.date(a, !b)), this
                    .strftime(a, Locale.shortDate)
        },
        formatLongDate : function(a, b) {
            return _.isString(a) && (a = Bujagali.Utils.date(a, !b)), this
                    .strftime(a, Locale.longDate)
        },
        relativeTime : function(a, b) {
            var c = (new Date).getTime(),
                d = c - a, e;
            try {
                var f;
                if (d < 0) {
                    if (d < l("-1y"))
                        f = "years";
                    else if (d < l("-6w"))
                        f = "months";
                    else if (d < l("-2w"))
                        f = "weeks";
                    else if (d < l("-1d"))
                        f = "days";
                    else if (d < l("-1h"))
                        f = "hours";
                    else if (d < l("-1m"))
                        f = "minutes";
                    else
                        return t("in a moment");
                    return b && i[f] > i[b] && (f = b), j[f](d)
                }
                return d < l("1m") ? t("a moment ago") : (d < l("1h") ? f =
                        "minutes" : d < l("1d") ? f = "hours" : d < l("1w")
                        ? f = "days"
                        : d < l("8w") ? f = "weeks" : d < l("1y") ? f =
                                "months" : f = "years", b && i[f] > i[b]
                        && (f = b), k[f](d))
            } catch (g) {
                throw console.log("Could not translate relative times: ", t, g), g
            }
        },
        duration : l
    }
}(), Bujagali.mixin(R.Date), function() {
    var a =
            ["abbr", "article", "aside", "audio", "canvas", "datalist",
                    "details", "figcaption", "figure", "footer", "header",
                    "hgroup", "mark", "meter", "nav", "output", "progress",
                    "section", "subline", "summary", "time", "video"],
        b =
                ["Album", "Artist", "Track", "Contributor", "Movie", "Series",
                        "Genre", "Distributor"],
        c = {
            a : "Album",
            al : "Album",
            rl : "Artist",
            r : "Artist",
            t : "Track",
            p : "Playlist",
            l : "Label",
            s : "Person",
            ct : "Contributor",
            mr : "Movie",
            vr : "Series",
            vsr : "Season",
            ver : "Episode",
            g : "Genre",
            ne : "Distributor",
            st : "Distributor",
            cs : "Set"
        };
    R.Utils = {
        ensureHtml5Elements : function() {
            $.browser.msie && parseInt($.browser.version, 10) < 9
                    && _.each(a, function(a) {
                                document.createElement(a)
                            })
        },
        supportsCanvas : function() {
            var a = document.createElement("canvas");
            return !!a.getContext && !!a.getContext("2d")
        },
        stopEvent : function(a) {
            a.preventDefault(), a.stopPropagation()
        },
        convertToModel : function(a) {
            if (!a)
                return null;
            if (a instanceof R.Model)
                return a;
            a instanceof Backbone.Model && (a = a.attributes);
            if (R.isStation(a))
                return new R.Models.Station(a);
            switch (a.type) {
                case "a" :
                case "al" :
                    return new R.Models.Album(a);
                case "p" :
                    return new R.Models.Playlist(a);
                case "l" :
                    return new R.Models.Label(a);
                case "s" :
                    return new R.Models.User(a);
                case "r" :
                case "rl" :
                    return new R.Models.Artist(a);
                case "t" :
                    return new R.Models.Track(a);
                case "mr" :
                    return new R.Models.Movie(a);
                case "ct" :
                    return new R.Models.Contributor(a);
                case "ver" :
                    return new R.Models.Episode(a);
                case "vsr" :
                    return new R.Models.Season(a);
                case "vr" :
                    return new R.Models.Series(a);
                case "g" :
                    return new R.Models.Genre(a);
                case "ne" :
                    return new R.Models.Network(a);
                case "st" :
                    return new R.Models.Studio(a);
                case "cs" :
                    return new R.Models.Set(a);
                default :
                    return console.warn("Unknown type " + a.type
                            + " in convertToModels"), new R.Model(a)
            }
        },
        convertToModels : function(a) {
            return _.map(a, function(a) {
                        return R.Utils.convertToModel(a)
                    })
        },
        getComponentClassForModel : function(a) {
            var b = a.get("type");
            return b in c ? c[b] : null
        },
        getComponentForModel : function(a, b) {
            if (!a)
                return null;
            var c,
                d = this.getComponentClassForModel(a);
            d ? c = R.Components[d] : R.isStation(a)
                    ? c = R.Components.Station
                    : b && (c = b);
            if (a.get("type") && !c)
                console.error("Component not loaded. Type was: "
                        + a.get("type"));
            else
                return c;
            return null
        },
        factory : function(a) {
            return a = a || this, function(b, c) {
                return new a(b, c)
            }
        },
        reportErrors : function(a, b) {
            return function() {
                try {
                    a.apply(this, arguments)
                } catch (c) {
                    var d =
                            "Exception occurred in "
                                    + (b || a.name || "anonymous function");
                    R.Utils.logException(d, c), R.Services.ErrorReporter
                            .reportError(d, "", "", c.stack)
                }
            }
        },
        logException : function(a, b) {
            b || (b = {
                message : "No Exception provided",
                stack : ""
            }), a += ": " + b.message, console.group
                    ? console.group(a)
                    : console.log(a), console.exception
                    ? console.exception(b)
                    : b.stack ? console.error(b.stack) : console.error(a), console.groupEnd
                    && console.groupEnd()
        },
        value : function(a) {
            return _.isFunction(a) ? a.apply(this, _.tail(arguments)) : a
        },
        array : function(a) {
            return _.isArray(a) ? a : [a]
        },
        eachKey : function(a, b, c) {
            if (!a)
                return;
            for (var d in a)
                _.has(a, d) && b.call(c, a[d], d, a)
        },
        transitionEndEvent : _.memoize(function() {
                    var a,
                        b = document.createElement("fakeelement"),
                        c = {
                            transition : "transitionEnd",
                            OTransition : "oTransitionEnd",
                            MSTransition : "msTransitionEnd",
                            MozTransition : "transitionend",
                            WebkitTransition : "webkitTransitionEnd"
                        };
                    for (a in c)
                        if (b.style[a] !== undefined)
                            return c[a]
                }),
        getUserEnvironment : _.memoize(function(a) {
            var b = {
                init : function() {
                    this.browser =
                            this.searchString(this.dataBrowser)
                                    || "Unknown Browser", this.version =
                            this.searchVersion(a.userAgent)
                                    || this.searchVersion(a.appVersion) || 999, this.OS =
                            this.searchString(this.dataOS) || "Unknown OS", this.isMobile =
                            this.OS.search(/^(iOS|Android|Windows Phone)$/) != -1, this.isIpadPlayer =
                            a.userAgent.search(/vdioipadplayer/) != -1, this.isIpad =
                            a.userAgent.search(/iPad/) != -1
                                    || this.isIpadPlayer, this.isTv =
                            this.OS === "Google TV"
                },
                searchString : function(a) {
                    for (var b = 0; b < a.length; b++) {
                        var c = a[b].string,
                            d = a[b].prop;
                        this.versionSearchString =
                                a[b].versionSearch || a[b].identity;
                        if (c) {
                            if (c.indexOf(a[b].subString) != -1)
                                return a[b].identity
                        } else if (d)
                            return a[b].identity
                    }
                },
                searchVersion : function(a) {
                    var b = a.indexOf(this.versionSearchString);
                    if (b == -1)
                        return;
                    return parseFloat(a.substring(b
                            + this.versionSearchString.length + 1))
                },
                dataBrowser : [{
                            string : a.userAgent,
                            subString : "PhantomJS",
                            versionSearch : "PhantomJS/",
                            identity : "Phantom"
                        }, {
                            string : a.userAgent,
                            subString : "facebook",
                            identity : "Facebook"
                        }, {
                            string : a.userAgent,
                            subString : "Chrome",
                            identity : "Chrome"
                        }, {
                            string : a.userAgent,
                            subString : "IEMobile",
                            versionSearch : "IEMobile",
                            identity : "IE Mobile"
                        }, {
                            string : a.userAgent,
                            subString : "Firefox",
                            identity : "Firefox"
                        }, {
                            string : a.userAgent,
                            subString : "Mobile",
                            versionSearch : "Version",
                            identity : "Mobile WebKit"
                        }, {
                            string : a.userAgent,
                            subString : "OmniWeb",
                            versionSearch : "OmniWeb/",
                            identity : "OmniWeb"
                        }, {
                            string : a.appVersion,
                            subString : "Google Web Preview",
                            versionSearch : "Mozilla",
                            identity : "Safari"
                        }, {
                            string : a.vendor,
                            subString : "Apple",
                            versionSearch : "Version",
                            identity : "Safari"
                        }, {
                            prop : window.opera,
                            versionSearch : "Version",
                            identity : "Opera"
                        }, {
                            string : a.vendor,
                            subString : "iCab",
                            identity : "iCab"
                        }, {
                            string : a.vendor,
                            subString : "KDE",
                            identity : "Konqueror"
                        }, {
                            string : a.vendor,
                            subString : "Camino",
                            identity : "Camino"
                        }, {
                            string : a.userAgent,
                            subString : "Netscape",
                            identity : "Netscape"
                        }, {
                            string : a.userAgent,
                            subString : "MSIE",
                            versionSearch : "MSIE",
                            identity : "Internet Explorer"
                        }, {
                            string : a.userAgent,
                            subString : "Gecko",
                            versionSearch : "rv",
                            identity : "Mozilla"
                        }, {
                            string : a.userAgent,
                            subString : "Mozilla",
                            versionSearch : "Mozilla",
                            identity : "Netscape"
                        }],
                dataOS : [{
                            string : a.userAgent,
                            subString : "iPhone",
                            identity : "iOS"
                        }, {
                            string : a.userAgent,
                            subString : "iPad",
                            identity : "iOS"
                        }, {
                            string : a.userAgent,
                            subString : "iPod",
                            identity : "iOS"
                        }, {
                            string : a.userAgent,
                            subString : "GoogleTV",
                            identity : "Google TV"
                        }, {
                            string : a.userAgent,
                            subString : "Android",
                            identity : "Android"
                        }, {
                            string : a.userAgent,
                            subString : "Windows Phone",
                            identity : "Windows Phone"
                        }, {
                            string : a.platform,
                            subString : "Win",
                            identity : "Windows"
                        }, {
                            string : a.userAgent,
                            subString : "CrOS",
                            identity : "Chrome OS"
                        }, {
                            string : a.platform,
                            subString : "Linux",
                            identity : "Linux"
                        }, {
                            string : a.platform,
                            subString : "Mac",
                            identity : "Mac"
                        }]
            };
            return b.init(), {
                browser : b.browser,
                browserVersion : b.version,
                operatingSystem : b.OS,
                isMobile : b.isMobile,
                isTv : b.isTv,
                isIpadPlayer : b.isIpadPlayer,
                isIpad : b.isIpad
            }
        }, function(a) {
            return a.userAgent + "::" + a.appVersion + "::" + a.vendor + "::"
                    + a.platform
        }),
        modelReviver : function(a, b) {
            return b && b.type === "list" && a !== "result"
                    ? new (R.Models.ModelFieldCollection.factory())(b, {
                                parentProperty : a
                            })
                    : b
        },
        shareDialog : function(a) {
            a = a || {};
            if (!a.model)
                throw new Error("Model required when calling shareDialog");
            var b;
            a.parent && (b = a.parent, delete a.parent), R.loader.load([
                            "ShareDialog",
                            this.getComponentClassForModel(a.model)],
                    function() {
                        var c = new R.Components.ShareDialog(a);
                        b && b.addChild(c), c.open()
                    })
        },
        messageDialog : function(a) {
            var b = R.Utils.value(a.message);
            if (!b)
                throw new Error("Valid message required when calling messageDialog");
            var c = R.Utils.value(a.title);
            if (!c)
                throw new Error("Valid title required when calling messageDialog");
            var d = a.parent || R.app;
            R.loader.load(["Dialog.MessageDialog"], function() {
                        var e = new R.Components.Dialog.MessageDialog({
                                    model : new Backbone.Model({
                                                message : b
                                            }),
                                    title : c,
                                    buttons : new Backbone.Collection(a.buttons),
                                    closeButton : a.closeButton,
                                    closeOnNavigate : a.closeOnNavigate,
                                    extraClassName : a.extraClassName
                                });
                        d.addChild(e), e.open()
                    })
        },
        createAndOpenSecureDialog : function(a) {
            var b = R.Utils.isSecure();
            a = a || {};
            var c;
            if (!a || !a.componentName)
                throw new Error("createAndOpenSecureDialog requires a componentName option.");
            var d = a.componentName;
            if (b)
                delete a.popupHeight, delete a.popupWidth, R.loader.load([d],
                        function() {
                            c =
                                    new (R.Component.getObject(d))(a.componentOptions), c
                                    .open(), a.callback
                                    && _.isFunction(a.callback)
                                    && a.callback(c)
                        });
            else {
                var e = this.fullUrl(R.serverInfo.get("urls").secureDialog, !0),
                    f = _.extend({
                                componentName : a.componentName
                            }, a.componentOptions),
                    g = _.reduce(f, function(a, b, c) {
                        return typeof b == "string"
                                && (b = '"' + b.replace(/"/g, '\\"') + '"'), a
                                .push(encodeURIComponent(c) + "="
                                        + encodeURIComponent(b)), a
                    }, []).join("&");
                g && (e += "?" + g);
                var h = a.popupHeight || 630,
                    i = a.popupWidth || 650,
                    j = window.screenY || window.screenTop,
                    k = window.screenX || window.screenLeft,
                    l = Math.floor(j + document.body.clientHeight / 2 - h / 2),
                    m = Math.floor(k + document.body.clientWidth / 2 - i / 2),
                    n =
                            "height=" + h + ",width=" + i + ",top=" + l
                                    + ",left=" + m
                                    + "dialog=yes,titlebar=no,close=no";
                c = window.open(e, "secure_dialog", n), c.focus(), a.callback
                        && _.isFunction(a.callback) && a.callback(c)
            }
        },
        notifyDialogClosed : function(a, b, c) {
            c || (c = 200);
            var d = function() {
                a.closed ? b() : setTimeout(d, c)
            };
            setTimeout(d, c)
        },
        getWindowLocation : function() {
            return window.location
        },
        isSecure : function() {
            var a = R.serverInfo.get("simulateDevHttps"),
                b = R.Utils.getWindowLocation(),
                c = b.host === R.serverInfo.get("secureHost"),
                d = b.protocol === "https:";
            return a && c || d ? !0 : !1
        },
        redirectToSignup : function() {
            window.location.href = "/signup/"
        },
        subNameForSubType : function(a) {
            switch (a) {
                case 1 :
                    return "web";
                case 2 :
                    return "unlimited";
                case 3 :
                    return "family"
            }
            return null
        },
        renderChildAtIndex : function(a, b, c, d) {
            if (a.model instanceof Backbone.Collection
                    || a.model instanceof R.Models.SparseCollection)
                a.addChild(b), b.render(function() {
                    var e = 0;
                    a.model.length
                            && (e = R.Utils.value.call(a.model, a.model.length));
                    var f = c > 0 ? a.model.at(c - 1) : null,
                        g = f ? a.findChildWithModel(f) : null,
                        h = c + 1 < e ? a.model.at(c + 1) : null,
                        i = h ? a.findChildWithModel(h) : null;
                    if (i && i.isRendered())
                        i.$el.before(b.$el);
                    else if (g && g.isRendered())
                        g.$el.after(b.$el);
                    else if (d)
                        $(d).append(b.$el);
                    else
                        throw new Error("A $defaultInsertionEl wasn't specified while adding a child to an empty model view.")
                });
            else
                throw new TypeError("Component model must be a collection to render child at index")
        },
        isValidEmail : function(a) {
            return a.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)
        },
        parseUrl : function(a) {
            var b = document.createElement("a");
            b.href = a, b.href = b.href;
            var c =
                    _.pick(b, "href", "protocol", "host", "port", "pathname",
                            "search", "hash");
            return c.pathname && c.pathname.indexOf("/") !== 0
                    && (c.pathname = "/" + c.pathname), c
        },
        fullUrl : function(a, b) {
            var c = /^https?:\/\//.test(a),
                d = a.indexOf("/") !== 0;
            !c
                    && d
                    && (console
                            .warn("R.Utils.fullUrl is not designed for relative URLs."), a =
                            "/" + a);
            var e = R.Utils.parseUrl(a),
                f = e.href;
            return b
                    && (R.serverInfo.get("prod") ? f =
                            f.replace(e.protocol, "https:") : R.serverInfo
                            .get("simulateDevHttps")
                            && (f =
                                    f.replace(e.host, R.serverInfo
                                                    .get("secureHost")))), f
        },
        getHashUrlMatches : function(a, b) {
            b = b.slice();
            var c = {},
                d = -1,
                e = -1, f, g, h, i;
            for (f = 0; f < a.length; f++) {
                h = a[f];
                for (g = 0; g < b.length; g++) {
                    i = b[g];
                    if (i === h) {
                        c[i] = a[f + 1], b.splice(g, 1);
                        break
                    }
                }
            }
            return c
        },
        camelToSnake : function(a) {
            return a.replace(/^([A-Z])/, function(a, b) {
                        return b.toLowerCase()
                    }).replace(/([A-Z])/g, function(a, b) {
                        return "_" + b.toLowerCase()
                    })
        },
        snakeToCamel : function(a) {
            return a.replace(/_(\w)/g, function(a, b) {
                        return b.toUpperCase()
                    })
        },
        lowerCaseInitial : function(a) {
            return a.replace(/^([A-Z])/, function(a, b) {
                        return b.toLowerCase()
                    })
        },
        bool : function(a) {
            return !!a
        },
        ensureBodyClasses : function(a) {
            var b = $("body");
            R.serverInfo.get("isOi") && b.addClass("oi_body"), R.isDesktop
                    && b.addClass("desktop"), R.isMacDesktop ? b
                    .addClass("mac_desktop") : R.isWinDesktop
                    && b.addClass("win_desktop"), R.usesNewHeader
                    && b.addClass("new_desktop_header"), R.currentUser
                    .isAnonymous()
                    && b.addClass("anonymous"), R.isMobile
                    && b.addClass("mobile");
            var c = R.Utils.getUserEnvironment(a || window.navigator);
            c.browser === "Phantom" && b.addClass("robot")
        },
        scrollbarSize : _.memoize(function() {
            var a,
                b =
                        $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
            $("body").append(b);
            var c = $("div", b).innerWidth();
            b.css("overflow-y", "scroll");
            var d = $("div", b).innerWidth();
            return $(b).remove(), a = c - d, a
        }),
        getHelpUrl : function(a) {
            var b = R.serverInfo.get("rdioHelpBaseUrl");
            return a ? b += a : R.currentUser.get("isAnonymous")
                    ? b
                    : R.serverInfo.get("rdioHelpUrl")
        },
        linkSortControls : function(a, b, c) {
            a.listen(b, "found", function() {
                        a.$el.show(), c.$el.hide()
                    }), a.listen(b, "notFound", function() {
                        a.$el.hide(), c.$el.show()
                    })
        },
        nameForType : function(a) {
            switch (a) {
                case "a" :
                    return t("Album");
                case "r" :
                    return t("Artist");
                case "p" :
                    return t("Playlist");
                case "t" :
                    return t("Song");
                case "s" :
                    return t("Profile")
            }
        },
        setCursor : function(a, b) {
            var c = $(a);
            if (!c.length)
                throw new Error("Must provide an element to setCursor on");
            a = c[0];
            if (!_.isUndefined(a.selectionStart))
                a.selectionStart = a.selectionEnd = b;
            else if (a.createTextRange) {
                var d = a.createTextRange();
                d.move("character", b), d.select()
            }
            return c
        },
        parseTimeString : function(a) {
            var b, c, d, e, f;
            if (/:/.test(a)) {
                f = a.split(":");
                if (f.length === 3)
                    c = parseInt(f[0], 10), d = parseInt(f[1], 10), e =
                            parseInt(f[2], 10);
                else if (f.length === 2)
                    c = 0, d = parseInt(f[0], 10), e = parseInt(f[1], 10);
                else
                    return null;
                if (_.isNaN(c) || _.isNaN(d) || _.isNaN(e))
                    return null;
                if (d >= 60 || e >= 60)
                    return null;
                b = 3600 * c + 60 * d + e
            } else {
                b = parseInt(a, 10);
                if (_.isNaN(b))
                    return null
            }
            return b
        },
        toTimeString : function(a) {
            var b = function(a) {
                return a < 10 ? "0" + a : "" + a
            }, c, d, e;
            return c = Math.floor(a / 3600), a -= c * 3600, d =
                    Math.floor(a / 60), a -= d * 60, b(c) + ":" + b(d) + ":"
                    + b(a)
        },
        chunk : function(a, b) {
            return _.values(_.groupBy(a, function(a, c) {
                        return Math.floor(c / b)
                    }))
        },
        isExtraExclusion : function(a) {
            var b = !1,
                c = a;
            return _.isObject(a) && (b = a.exclude, c = a.field), b
                    || c.charAt(0) === "-"
        },
        initCanvas : function(a) {
            return !R.Utils.supportsCanvas()
                    && !_.isUndefined(window.G_vmlCanvasManager)
                    && (a = window.G_vmlCanvasManager.initElement(a)), a
        }
    }, R.Utils.ensureHtml5Elements()
}(), function(a) {
    function c(a, c) {
        return c + " " + a + b.pluralize(c)
    }
    var b,
        d = {
            t : "song",
            a : "album",
            p : "playlist",
            r : "artist",
            s : "user",
            al : "album",
            l : "label"
        };
    Bujagali.mixin({
        imageTag : function(b) {
            b = _.extend({
                        w : 35,
                        h : 35
                    }, b);
            var c = b.m,
                d = "&w=" + b.w,
                e = "&h=" + b.h,
                f = b.rc ? "&rc=" + b.rc : "",
                g = b.ov ? "&ov=" + b.ov : "",
                h = b.className ? ' class="' + b.className + '"' : "",
                i = b.alt ? ' alt="' + b.alt + '"' : "",
                j = b.id ? ' id="' + b.id + '"' : "";
            return !c && typeof onerror != "undefined" ? (onerror(
                    "undefined image in " + (this.name || arguments.caller),
                    "", ""), "") : ['<img src="', a().is_address, "?m=", c, d,
                    e, g, f, '"', h, i, j, ' width="', b.w, '" height="', b.h,
                    '" />'].join("")
        },
        image : function(a) {
            return a = _.extend({
                        w : 35,
                        h : 35
                    }, a), ['<img src="', a.u, '"', ' width="', a.w,
                    '" height="', a.h, '" />'].join("")
        },
        dateDisplay : function(a) {
            return a instanceof Date && (a = Bujagali.Utils.toISOString(a)), '<span class="relative_date" title="'
                    + a + '">' + a + "</span>"
        },
        dateRange : function(a, b) {
            if (!a || !b)
                return "";
            a = a.valueOf() / 1e3, b = b.valueOf() / 1e3;
            var c = b - a,
                d = c % 60,
                e = Math.floor(c / 60) % 60,
                f = Math.floor(c / 3600) % 24,
                g = Math.floor(c / 86400),
                h = Math.floor(c / 2592e3),
                i = Math.floor(c / 31536e3);
            if (i)
                return I18n.translate(["[num] year", "[num] years"], {
                            num : i
                        });
            if (h)
                return I18n.translate(["[num] month", "[num] months"], {
                            num : h
                        });
            if (g)
                return I18n.translate(["[num] day", "[num] days"], {
                            num : g
                        });
            if (f)
                return I18n.translate(["[num] hour", "[num] hours"], {
                            num : f
                        });
            if (e)
                return I18n.translate(["[num] minute", "[num] minutes"], {
                            num : e
                        });
            if (d)
                return I18n.translate(["[num] second", "[num] seconds"], {
                            num : d
                        })
        },
        shortName : function(a, c) {
            a.attributes && (a = a.attributes);
            var d = a.firstName || a.lastName || a.email || "";
            return d = d.trim(), c ? d : b.escape(d)
        },
        userForm : function(a, b) {
            var c;
            return R.currentUser ? c =
                    a.isSelf && _.isBoolean(a.isSelf)
                            || a.key == R.currentUser.get("key") || a.get
                            && a.get("key") == R.currentUser.get("key") : c =
                    a.isSelf || a.id == clientManager.current_user.id, c && !b
                    ? "y"
                    : a.gender ? a.gender.toLowerCase() : a.get("gender")
                            .toLowerCase()
        },
        possessivePronoun : function(a) {
            return a.gender == "m" || a.gender == "M" ? "his" : "her"
        },
        possessiveName : function(a) {
            return a.match("s$") === null ? a += "'s" : a += "'", b.escape(a)
        },
        possessiveUserName : function(a) {
            return a.isSelf || a.id === clientManager.current_user.id
                    ? "Your"
                    : b.possessiveName(b.shortName(a, !0))
        },
        resizedImage : function(b, c, d, e, f) {
            var g = a().is_address + "?m=" + encodeURIComponent(b);
            return c && (g += "&w=" + c), d && (g += "&h=" + d), e
                    && (g += "&rc=" + e), f && (g += "&ov=" + f), g
        },
        prettyType : function(a) {
            if (a)
                return d[a] || "station"
        },
        pluralize : function(a, b) {
            return a > 1 || a === 0 ? b || "s" : ""
        },
        zeroPad : function(a) {
            return a < 10 ? "0" + a : a
        },
        _secondsToTime : function(a) {
            return {
                seconds : a % 60,
                minutes : Math.floor(a / 60) % 60,
                hours : Math.floor(a / 3600)
            }
        },
        formatSeconds : function(a) {
            var b = this._secondsToTime(a);
            return (b.hours >= 1 ? b.hours + ":" : "")
                    + (b.hours >= 1
                            ? this.zeroPad(b.minutes) + ":"
                            : b.minutes >= 1 ? b.minutes + ":" : "0:")
                    + this.zeroPad(b.seconds)
        },
        formatSecondsWithAbbr : function(a) {
            var b = this._secondsToTime(a);
            return b.hours == 1 ? b.minutes == 1 ? t(
                    "[ hours ] hr [ minutes ] min", b) : t(
                    "[ hours ] hr [ minutes ] mins", b) : b.hours > 1
                    ? b.minutes == 1
                            ? t("[ hours ] hrs [ minutes ] min", b)
                            : t("[ hours ] hrs [ minutes ] mins", b)
                    : b.minutes == 1 ? t("[ minutes ] min", b) : t(
                            "[ minutes ] mins", b)
        },
        formatPlayCount : function(a) {
            var b = !1;
            return a >= 1e6 && (a = Number((a / 1e6).toFixed(1)), b = !0), I18n
                    .number(a)
                    + (b ? "M" : "")
        },
        getGenderForm : function(a, b) {
            var c = "m",
                d = R.Utils.value.call(a, a.length);
            if (d > 1) {
                var e = _.compact(_.uniq(a.map(b)));
                e.length > 1 ? c = "v" : e[0] && (c = "v" + e[0])
            } else
                c = b(a.last());
            return c
        },
        url : function(a, b) {
            return arguments.length == 1 && (b = ""), a == "management-subscriptions"
                    ? "/management/subscriptions/"
                    : b === "" ? a.url : a.type == "s" && b == "collection"
                            ? a.url + "collection/"
                            : ""
        }
    }), b = Bujagali.Utils
}(function() {
            return R.serverInfo ? R.serverInfo.attributes : server_info
        }), function() {
    R.CollectionUtils = {
        model : R.Models.ObjectModel,
        addField : function(a) {
            var b = this.reject(function(b) {
                        return b.has(a) || !b.addField
                    }),
                c = _.map(b, function(b) {
                            return b.addField(a)
                        });
            return $.when(c)
        },
        addFields : function(a) {
            var b = this.reject(function(b) {
                        return b.addFields ? _.all(a, function(a) {
                                    return b.has(a)
                                }) : !0
                    }),
                c = _.map(b, function(b) {
                            return b.addFields(a)
                        });
            return $.when(c)
        }
    }
}(), function() {
    function b(a) {
        return a ? _.isArray(a) ? a : a.models ? a.models : a.items : []
    }
    var a = function(a, b, c) {
        return function(d) {
            b.loading = !1, a ? a(b, d, c) : b.trigger("error", b, d, c)
        }
    };
    R.Models.SparseCollection = function(a, b) {
        this.options = b || {}, _.defaults(this.options, {
                    fetch : !0,
                    limit : null
                }), this.limit(this.options.limit), this.options.model
                && (this.model = this.options.model), this.reset(a, {
                    silent : !0
                }), this._pendingFetches = [], this.initialize.apply(this,
                arguments)
    }, _.extend(R.Models.SparseCollection, {
                extend : Backbone.Collection.extend,
                factory : function(a) {
                    return a = a || this, function(c, d) {
                        var e = c ? c.total : null,
                            f = b(c);
                        return d = _.extend({
                                    limit : e
                                }, d), new a(f, d)
                    }
                }
            }), _.extend(R.Models.SparseCollection.prototype,
            R.CollectionUtils, Backbone.Events, {
                length : function() {
                    return this.models ? this.models.length : 0
                },
                initialize : function() {
                    _.bindAll(this, "length")
                },
                at : function(a) {
                    return this.get({
                                start : a,
                                count : 1
                            })[0]
                },
                get : function(a) {
                    function f(a) {
                        d ? c = a : b = a, d = !0
                    }
                    if (!this.options.fetch)
                        return [];
                    a.start < 0 && (a.count += a.start, a.start = 0);
                    if (a.count < 1)
                        return [];
                    if (this.appendOnly) {
                        if (this.hasFetchedToEnd())
                            return [];
                        if (a.start && a.count)
                            return this.models
                                    .slice(a.start, a.start + a.count)
                    } else if (!_.isNull(this._limit)) {
                        if (a.start >= this._limit)
                            return [];
                        a.start + a.count > this._limit
                                && (a.count = this._limit - a.start)
                    }
                    var b = a.start,
                        c = a.start + a.count - 1,
                        d = !1,
                        e = [];
                    this._startManipulating();
                    if (!this.appendOnly)
                        for (var g = a.start; g < a.start + a.count; g++) {
                            var h = this.models[g];
                            h
                                    ? h._sparseAborted
                                            && (h._sparseAborted = !1, f(g))
                                    : (this.model ? h = new this.model : h =
                                            new R.Model, this.add(h, {
                                                at : g,
                                                replace : !0
                                            }), f(g)), e.push(h)
                        }
                    else
                        b = this.length(), d = !0;
                    this._stopManipulating();
                    if (d) {
                        this._pendingFetches =
                                _.filter(this._pendingFetches, function(b) {
                                    if (!b)
                                        return !1;
                                    var c = b._sparseRange;
                                    if (!c)
                                        return !0;
                                    if (c.start >= a.start + a.count
                                            || c.start + c.count <= a.start) {
                                        console
                                                .log(
                                                        "[SparseCollection] aborting request for ",
                                                        c.start, c.count);
                                        for (var d = c.start; d < c.start
                                                + c.count; d++)
                                            this.models[d]._sparseAborted = !0;
                                        return b.abort(), !1
                                    }
                                    return !0
                                }, this);
                        if (this.appendOnly)
                            this.fetch({
                                        config : a.config,
                                        at : b,
                                        success : a.success
                                    });
                        else {
                            var i = {
                                start : b,
                                count : c - b + 1,
                                chunk : a.chunk,
                                at : b
                            };
                            i.range = {
                                start : i.start,
                                count : i.count
                            }, this._chunkFetch(i, a.success)
                        }
                    }
                    return e
                },
                _chunkFetch : function(a, b, c) {
                    var d = a.count;
                    a.count = d > a.chunk ? a.chunk : d;
                    var e = this,
                        f = this.fetch({
                                    config : a,
                                    at : a.at,
                                    success : function() {
                                        if ("chunk" in a && d > a.chunk) {
                                            var b = _.extend({}, a, {
                                                        start : a.start
                                                                + a.chunk,
                                                        count : d - a.chunk
                                                    });
                                            b.at = b.start, e._chunkFetch(b, c)
                                        }
                                        c && c.apply(this, arguments)
                                    }
                                });
                    f && (f._sparseRange = a.range)
                },
                hasFetchedToEnd : R.doNothing,
                fetch : function(b) {
                    this.trigger("load"), this.loading = !0, b = b || {};
                    var c = this,
                        d = b.success, e;
                    return b.success = function(a, f, g) {
                        c._pendingFetches = _.without(c._pendingFetches, e);
                        var h = c.set(c.parse(a), b);
                        c.trigger("loaded", a, h), c.loading = !1, d
                                && d(c, a, h)
                    }, b.error = a(b.error, this, b), e =
                            Backbone.sync.call(this, "read", this, b), this._pendingFetches
                            .push(e), e
                },
                parse : function(a) {
                    return a && _.isNumber(a.total) && this.limit(a.total), b(a)
                },
                set : function(a, b) {
                    var c, d, e,
                        f = [];
                    b = _.extend({
                                at : 0
                            }, b), a = R.Utils.array(a), this
                            ._startManipulating();
                    for (c = 0; c < a.length; c++)
                        d = this.models[b.at + c], d
                                ? (e = this.prepModel(a[c]), e.constructor == d.constructor
                                        ? d.set(a[c])
                                        : (this.remove(d, {
                                                    at : b.at + c
                                                }), this.add(e, {
                                                    at : b.at + c
                                                })))
                                : (e = this.prepModel(a[c]), this.add(e, _
                                                .extend({}, b, {
                                                            at : b.at + c,
                                                            replace : !0
                                                        }))), f.push(e);
                    if (b.config && b.config.count && a.length < b.config.count) {
                        console
                                .log("[SparseCollection] got a partial result, EOF");
                        var g = b.at + a.length;
                        for (c = g; c < b.at + b.config.count; c++)
                            this.models[g]
                                    && _.isEmpty(this.models[g].attributes)
                                    && this.remove(this.models[g], {
                                                at : g
                                            });
                        this.limit(b.at + a.length), this.models.splice(b.at
                                        + a.length, this.models.length)
                    }
                    return this._stopManipulating(), f
                },
                reset : function(a, c) {
                    return c = _.extend({
                                at : 0,
                                silent : !1
                            }, c), a = b(a), _.each(this._pendingFetches,
                            function(a) {
                                a && a.abort()
                            }), this._pendingFetches = [], this.models = [], a
                            && this.add(a, {
                                        at : c.at,
                                        silent : !0
                                    }), this.options.fetch
                            || (this._limit = this.models.length), c.silent
                            || this.trigger("reset"), !0
                },
                limit : function(a, b) {
                    return !_.isUndefined(a)
                            && a !== this._limit
                            && (this._limit = a, b = b || {}, b.silent
                                    || this.trigger("limit", a)), this._limit
                },
                getModelClass : function() {
                    return this.model
                },
                prepModel : function(a) {
                    var b = this.getModelClass();
                    return b ? new b(a) : R.Utils.convertToModel(a)
                },
                content : function(a) {
                    return a
                },
                _collectionChanged : function(a, b, c) {
                    var d = this._manipulating;
                    d || this._startManipulating(), a == "add"
                            ? this._addsToFire.push([b, c])
                            : a == "remove" && this._removesToFire.push([b, c]), d
                            || this._stopManipulating()
                },
                _startManipulating : function() {
                    this._manipulating = !0, this._addsToFire = [], this._removesToFire =
                            []
                },
                _stopManipulating : function() {
                    var a = this;
                    this._manipulating = !1, _.each(a._addsToFire, function(b) {
                                var c = b[0],
                                    d = b[1];
                                c.trigger("add", c, a, d)
                            }), _.each(a._removesToFire, function(b) {
                                var c = b[0],
                                    d = b[1];
                                c.trigger("remove", c, a, d)
                            }), this._addsToFire = null, this._removesToFire =
                            null
                },
                add : function(a, b) {
                    b = _.extend({
                                at : this.length()
                            }, b), a = R.Utils.array(a);
                    var c = b.at,
                        d = this;
                    _.each(a, function(a) {
                                a instanceof R.Model || (a = d.prepModel(a)), d
                                        .length() < c
                                        ? d.models[c] = a
                                        : d.models.splice(c, b.replace ? 1 : 0,
                                                a), a.collection = d, a.bind(
                                        "all", d._onModelEvent, d), b.silent
                                        || (b.index = c, d._collectionChanged(
                                                "add", a, b)), c++
                            });
                    var e = this.limit();
                    e != null && this.length() > e
                            && this.limit(e + a.length, {
                                        silent : !0
                                    })
                },
                remove : function(a, b) {
                    b = b || {};
                    var c = this;
                    a = R.Utils.array(a);
                    var d = b.at || _.indexOf(this.models, a[0]);
                    this.limit() == this.length()
                            && this.limit(this.limit() - a.length, {
                                        silent : !0
                                    }), _.each(a, function(a) {
                                a.collection = null, c.models.splice(d, 1), b.silent
                                        || (b.index = d, c._collectionChanged(
                                                "remove", a, b)), a.unbind(
                                        "all", c._onModelEvent, c)
                            })
                },
                _onModelEvent : function(a, b, c, d) {
                    if (a != "add" && a != "remove" || c == this)
                        a == "destroy" && this.remove(b, d), this.trigger
                                .apply(this, arguments);
                    else
                        return
                },
                pluck : function(a) {
                    return this.map(function(b) {
                                return b.get(a)
                            })
                }
            });
    var c =
            ["forEach", "each", "map", "reduce", "reduceRight", "find",
                    "detect", "filter", "select", "reject", "every", "all",
                    "some", "any", "include", "contains", "invoke", "max",
                    "min", "sortBy", "sortedIndex", "toArray", "size", "first",
                    "rest", "last", "without", "indexOf", "lastIndexOf",
                    "isEmpty", "groupBy"];
    _.each(c, function(a) {
                R.Models.SparseCollection.prototype[a] = function() {
                    return _[a].apply(_, [this.models].concat(_
                                    .toArray(arguments)))
                }
            }), R.Models.SimpleCollection = Backbone.Collection.extend({
        parse : function(a) {
            return b(a)
        },
        fetch : function() {
            return this.deferred =
                    Backbone.Collection.prototype.fetch.apply(this, arguments), this.deferred
        },
        findByKey : function(a) {
            return this.find(function(b) {
                        return b.get("key") === a
                    })
        }
    }, {
        factory : function(a) {
            return a = a || this, function(c, d) {
                var e = b(c);
                return new a(e, d)
            }
        }
    }), R.Models.FilterableCollection = R.Models.SparseCollection.extend({
                initialize : function() {
                    R.Models.SparseCollection.prototype.initialize.apply(this,
                            arguments), this._sort = this.options.sort, this._query =
                            this.options.filter
                },
                content : function(a) {
                    return _.extend({
                                sort : this._sort || this.defaultSort,
                                query : this._query
                            }, a)
                },
                setFilter : function(a) {
                    if (a === this._query)
                        return;
                    this._query = a, this.reset()
                },
                getFilter : function() {
                    return this._query
                },
                setSort : function(a) {
                    if (a === this._sort)
                        return;
                    this._sort = a
                },
                getSort : function() {
                    return this._sort
                }
            }), R.Models.MusicCollection =
            R.Models.FilterableCollection.extend({
                        defaultSort : "playCount",
                        sortOptions : [{
                                    value : "",
                                    label : t("Most Popular")
                                }, {
                                    value : "name",
                                    label : t("Name")
                                }, {
                                    value : "releaseDate",
                                    label : t("Release Date")
                                }]
                    })
}(), function() {
    var a = Backbone.Model.prototype;
    R.Model = Backbone.Model.extend({
        overrides : {},
        initialize : function(b, c) {
            var d = this;
            this.options = c || {}, this._extras =
                    R.Utils.value(this.extras) || [], this.options.extras
                    && (this._extras = this._extras.concat(this.options.extras)), this.overrides =
                    _.extend({}, this.overrides), _.each(d.overrides, function(
                    a, b) {
                if (_.isString(a))
                    d.overrides[b] = {
                        get : d[a]
                    };
                else if (_.isFunction(a)) {
                    var c = "__" + b;
                    function e() {
                        var e, f;
                        return d[c]
                                || (f = {
                                    parentModel : d,
                                    parentProperty : b
                                }, a.factory ? e =
                                        a.factory()(d.attributes[b], f) : e =
                                        new a(d.attributes[b], f), d[c] = e, delete d.attributes[b]), d[c]
                    }
                    function f(a) {
                        var b = d[c];
                        if (b)
                            if (a && a.models)
                                if (b.constructor == a.constructor)
                                    b.reset(a.models);
                                else if (b instanceof b.constructor)
                                    b.reset(a.models);
                                else
                                    throw console.error("Tried to reset ", b,
                                            " with ", a), new Error("Collection constructors do not match.");
                            else
                                b.reset ? b.reset(a) : b.set
                                        && (a ? b.set(a) : b.clear())
                    }
                    d.overrides[b] = {
                        get : e,
                        set : f
                    }
                }
            }), a.initialize.apply(this, arguments)
        },
        isNew : function() {
            return !this.has("key")
        },
        get : function(b) {
            var c = this.overrides[b];
            return c
                    ? c.get.call(this, b)
                    : (this.attributes[b] instanceof R.Models.ModelFieldCollection
                            && this.attributes[b].parentModel(this), a.get
                            .call(this, b))
        },
        set : function(b, c, d) {
            var e = this,
                f = b;
            _.isString(f) ? (f = {}, f[b] = c) : d = c;
            for (b in f)
                if (_.has(f, b)) {
                    var g = f[b],
                        h = e.overrides[b];
                    h && h.set
                            ? h.set.call(e, g)
                            : e.attributes
                                    && e.attributes[b] instanceof R.Models.ModelFieldCollection
                                    && !_.isNull(g)
                                    && (e.attributes[b].reset(g.models), e.attributes[b]
                                            .limit(g.limit()), delete f[b])
                }
            return a.set.call(this, f, d)
        },
        unset : function(b, c) {
            var d = "__" + b;
            return this[d] && (this[d] = null), a.unset.apply(this, arguments)
        },
        clear : function() {
            var b = this;
            return _.each(this.overrides, function(a, c) {
                        var d = "__" + c;
                        b[d] && (b[d] = null)
                    }), a.clear.apply(this, arguments)
        }
    }, {
        factory : R.Utils.factory
    }), Backbone.sync = function(a, b, c) {
        if (!b.method)
            return;
        var d = c.config || {}, e;
        b.content
                && (_.isFunction(b.content) ? e = b.content.call(b, d) : e =
                        b.content[a].call(b, d)), e = _.isUndefined(e) ? {} : e;
        var f = b.method;
        _.isObject(f) && !_.isFunction(f) && (f = b.method[a]), _.isFunction(f)
                && (f = f.call(b));
        var g = _.extend({
                    method : f,
                    content : e
                }, c);
        return g.success = function(a) {
            return a.result === !0 ? c.success() : c.success(a.result)
        }, g.error = function(a) {
            if (c.error)
                return c.error(a)
        }, R.Api.request(g)
    }, R.Models.ModelFieldCollection = R.Models.SparseCollection.extend({
        method : "get",
        content : function(a) {
            var b = {
                field : this._parentProperty,
                start : a.start,
                count : a.count,
                sort : a.sort || this.sort
            };
            return this.extras && (b.extras = this.extras), {
                keys : this._parentModel.get("key"),
                extras : [{
                            field : "*",
                            exclude : !0
                        }, b]
            }
        },
        parse : function(a) {
            var b = a[this._parentModel.get("key")][this._parentProperty];
            return this.limit(b.limit()), b.models
        },
        initialize : function(a, b) {
            R.Models.SparseCollection.prototype.initialize.apply(this,
                    arguments), this._parentProperty = b.parentProperty, this._parentModel =
                    b.parentModel
        },
        parentModel : function(a) {
            return arguments.length && (this._parentModel = a), this._parentModel
        },
        toJSON : function() {
            return {
                type : "list",
                items : this.models,
                total : this.limit()
            }
        },
        setSort : function(a) {
            this.sort = a, this.reset()
        }
    }), R.Models.CompositeModel = Backbone.Model.extend({
                initialize : function(a, b) {
                    this._innerModelNames = b.innerModelNames
                },
                shouldFetch : !0,
                fetch : function(a) {
                    var b = this,
                        c = _.isFunction(a.success) ? a.success : R.doNothing,
                        d = _.isFunction(a.error) ? a.error : R.doNothing,
                        e = _.after(_.size(this._innerModelNames), function() {
                                    c(b)
                                });
                    _.each(this._innerModelNames, function(a) {
                                b.get(a).fetch({
                                            success : e,
                                            error : d
                                        })
                            })
                },
                getInnerModels : function() {
                    var a = this._innerModelNames;
                    return _.filter(this.attributes, function(b, c) {
                                return _.include(a, c)
                            })
                }
            })
}(), function() {
    R.Models.ObjectModel = R.Model.extend({
        initialize : function(a, b) {
            R.Model.prototype.initialize.apply(this, arguments), _.bindAll(
                    this, "onFieldsChanged", "addFieldRefs", "_referenceField"), this
                    ._initExtras(b), this.trackedFields = {}, this._isClaimed =
                    !1, this.parse
                    && this.parse !== R.Models.ObjectModel.prototype.parse
                    && (this._originalParse = this.parse)
        },
        _initExtras : function(a) {
            var b = this;
            this._extras = R.Utils.value(this.extras) || [], this._extraRefs =
                    {}, a && a.extras
                    && (this._extras = this._extras.concat(a.extras)), _.each(
                    this._extras, function(a) {
                        _.isString(a) && (b._extraRefs[a] = 1)
                    })
        },
        fetch : function(a) {
            return this.get("key")
                    ? this._updateMethods(this._getMethods)
                    : this._updateMethods(this._urlMethods), R.Model.prototype.fetch
                    .call(this, a)
        },
        shouldFetch : !0,
        fetchPartialTracks : function(a) {
            if (!this.hasPartialTracks())
                return;
            var b = this,
                c = a.count || 10,
                d = this.getPartialTrackKeys().slice(0, c);
            R.Api.request({
                method : "get",
                content : {
                    keys : d
                },
                error : function(a) {
                    console.error("Failed to get tracks:", a.status)
                },
                success : function(c) {
                    var e = [];
                    _.each(d, function(d, f) {
                                var g = c.result[d];
                                a.processLoadedTrack
                                        && (g =
                                                a
                                                        .processLoadedTrack(
                                                                g,
                                                                R.Utils
                                                                        .value(b
                                                                                .get("tracks").length)
                                                                        + f, b)), e
                                        .push(g)
                            }), b.get("tracks").add(e), a.success
                            && a.success(e)
                }
            })
        },
        hasPartialTracks : function() {
            return this.getPartialTrackKeys().length > 0
        },
        getPartialTrackKeys : function() {
            var a = [];
            return this.get("trackKeys")
                    && (a =
                            this.get("trackKeys").slice(R.Utils.value(this
                                    .get("tracks").length))), a
        },
        _getMethods : {
            method : {
                read : "get"
            },
            content : {
                read : function(a) {
                    return _.extend({
                                keys : [this.get("key")],
                                extras : this._extras
                            }, a)
                }
            },
            parse : function(a, b) {
                if (a)
                    return a[this.get("key")]
            }
        },
        _urlRegExp : /^([^?]+).*/,
        _urlMethods : {
            method : {
                read : "getObjectFromUrl"
            },
            content : {
                read : function() {
                    var a =
                            decodeURIComponent(this.get("url")
                                    || Backbone.history.getFragment());
                    return a = a.match(this._urlRegExp)[1], this._extras.length
                            || (this._extras = ["tracks"]), {
                        url : a,
                        extras : this._extras
                    }
                }
            },
            parse : function(a, b) {
                return this._updateMethods(this._getMethods), a
            }
        },
        _updateMethods : function(a) {
            this.method && !_.isString(this.method) ? this.method =
                    _.extend({}, this.method, a.method) : this.method =
                    a.method, this.content && !_.isString(this.content)
                    ? this.content = _.extend({}, this.content, a.content)
                    : this.content = a.content, this._originalParse
                    ? this.parse = _.compose(this._originalParse, a.parse)
                    : this.parse = a.parse
        },
        addField : function(a) {
            return this._referenceField(a), this._extraRefs[a] > 1
                    ? (new $.Deferred).resolve()
                    : R.Models.manager.getField(this, a)
        },
        addFieldRefs : function(a) {
            var b = this;
            if (!this._isClaimed)
                return this._isClaimed = !0, _.each(a, this._referenceField), this;
            _.each(a, function(a) {
                        R.Utils.isExtraExclusion(a) || b._referenceField(a)
                    }), _.each(this._extraRefs, function(c, d) {
                        R.Utils.isExtraExclusion(d) && !_.include(a, d)
                                && delete b._extraRefs[d]
                    })
        },
        getAllFields : function() {
            return _.union(_.keys(this.attributes), _.keys(this._extraRefs))
        },
        _referenceField : function(a) {
            this._extraRefs[a]
                    ? this._extraRefs[a]++
                    : (this._extraRefs[a] = 1, this._extras.push(a))
        },
        _dereferenceField : function(a) {
            this._extraRefs[a]
                    && (this._extraRefs[a]--, this._extraRefs[a] === 0
                            && (delete this._extraRefs[a], this._extras =
                                    _.without(this._extras, a)))
        },
        addFields : function(a) {
            var b = this,
                c = _.map(a, function(a) {
                            return b.addField(a)
                        });
            return $.when(c)
        },
        removeField : function(a) {
            this._dereferenceField(a)
        },
        removeFields : function(a) {
            _.each(a, this.removeField)
        },
        trackField : function(a) {
            a = R.Utils.array(a), this.addFields(a), _
                    .isEmpty(this.trackedFields)
                    && R.pubSub.subscribe(this.get("key") + "/fields",
                            this.onFieldsChanged);
            var b = this;
            _.each(a, function(a) {
                        b.trackedFields[a]
                                ? b.trackedFields[a]++
                                : b.trackedFields[a] = 1
                    })
        },
        untrackField : function(a) {
            a = R.Utils.array(a);
            var b = this;
            _.each(a, function(a) {
                        b.trackedFields[a]
                                && (b.trackedFields[a]--, b.trackedFields[a] === 0
                                        && delete b.trackedFields[a])
                    }), _.isEmpty(this.trackedFields)
                    && R.pubSub.unsubscribe(this.get("key") + "/fields",
                            this.onFieldsChanged)
        },
        trackCount : function() {
            return this.get("trackKeys") ? this.get("trackKeys").length : this
                    .get("length") ? this.get("length") : this.get("tracks")
                    ? R.Utils.value.call(this.get("tracks"),
                            this.get("tracks").length)
                    : 0
        },
        onFieldsChanged : function(a, b) {
            var c = this,
                d = _.keys(c.trackedFields);
            _.each(b.fields, function(a, b) {
                        if (_.include(d, b)) {
                            if (c.fieldConverter && c.fieldConverter[b]) {
                                c[c.fieldConverter[b]](b, a);
                                return
                            }
                            var e = {};
                            e[b] = a, c.set(e)
                        }
                    })
        },
        destroy : function() {
            return _.isEmpty(this.trackedFields)
                    || R.pubSub.unsubscribe(this.get("key") + "/fields",
                            this.onFieldsChanged), R.Model.prototype.destroy
                    .apply(this, arguments)
        },
        purchase : function(a, b) {
            R.Api.request({
                        method : "purchaseItem",
                        content : {
                            paymentId : a,
                            item : this.get("key")
                        },
                        success : function(a) {
                            R.Payment.purchaseSuccess(a, b)
                        },
                        error : function(a) {
                            R.Payment.purchaseError(a, b)
                        }
                    })
        }
    });
    var a = function() {
        this.initialize()
    };
    _.extend(a.prototype, {
        initialize : function() {
            this.models = {}, this.fields = {}
        },
        getField : function(a, b) {
            var c = a.get("key");
            this.models[c] ? this.models[c].push(a) : this.models[c] = [a], this.fields[b]
                    ? _.indexOf(this.fields[b], c) == -1
                            && this.fields[b].push(c)
                    : this.fields[b] = [c];
            var d = $.Deferred();
            return this.fetch({
                        success : function() {
                            d.resolve.apply(this, arguments)
                        },
                        error : function() {
                            d.reject.apply(this, arguments)
                        }
                    }), d
        },
        _maxGetKeys : 50,
        _maxSimultaneousRequests : 5,
        _getExtras : function(a) {
            var b = {},
                c = this,
                d = function(a, c) {
                    _.has(b, c) ? b[c].push(a) : b[c] = [a]
                };
            return _.each(a, function(a) {
                        _.each(c.fields, function(b, c) {
                                    _.contains(b, a) && d(a, c)
                                })
                    }), b = _.map(b, function(a, b) {
                        return {
                            field : b,
                            keys : a
                        }
                    }), b
        },
        fetch : _.debounce(function(a) {
            var b = this,
                c = _.keys(this.models),
                d = R.Utils.chunk(c, this._maxGetKeys),
                e = _.map(d, function(c) {
                            var d = _.extend({}, a),
                                e = b._getExtras(c),
                                f = {
                                    keys : c,
                                    extras : e
                                },
                                g = _.reduce(c, function(a, c) {
                                            return a = a.concat(b.models[c]), a
                                        }, []);
                            return f.extras.unshift({
                                        field : "*",
                                        exclude : !0
                                    }), f.extras = f.extras, d.success =
                                    function(a) {
                                        _.each(g, function(b) {
                                                    b
                                                            .set(a.result[b
                                                                    .get("key")])
                                                })
                                    }, _.extend(d, {
                                        method : "get",
                                        content : f
                                    }), d
                        });
            this._doRequests(e, a.success, a.error), this.initialize()
        }, 250),
        _doRequests : function(a, b, c) {
            var d = [],
                e = this,
                f = function() {
                    var g;
                    a.length === 0
                            ? b()
                            : d.length < e._maxSimultaneousRequests
                                    && (g = R.Api.request(a.shift()), g.done(
                                            function() {
                                                d = _.without(d, g), f()
                                            }), g.fail(c), d.push(g), f())
                };
            f()
        }
    }), R.Models.manager = new a
}(), function() {
    function c(a, b, c, d) {
        a
                && !R.ApiProxy.NO_MAP_ERRORS
                && !/o/.test(b)
                && console.error("[ApiProxy] expecting " + c._target() + "."
                        + d + " to exist")
    }
    function d(a) {
        return _.isObject(a) && "models" in a && "_onModelEvent" in a
    }
    function e(a) {
        var b = this;
        console.assert("name" in a, "config.name is required"), console.assert(
                "parent" in a, "config.parent is required"), this.name = a.name, this.parent =
                a.parent, this.map = a.map || "", this.module = null, _
                .isString(this.map)
                ? (this.canWrite = /w/.test(this.map), this.needsAuth =
                        /a/.test(this.map), this.fake = /f/.test(this.map))
                : this.canWrite = this.needsAuth = this.fake = !1;
        if (!this.fake) {
            var d = this.parent.original.get(this.name);
            this.setValue(d), c(_.isUndefined(d), this.map, this.parent,
                    this.name)
        }
    }
    function f(a) {
        this.initialize(a)
    }
    var a = {
        currentUser : "m",
        player : {
            PLAYSTATE_PAUSED : "c",
            PLAYSTATE_PLAYING : "c",
            PLAYSTATE_STOPPED : "c",
            PLAYSTATE_BUFFERING : "c",
            PLAYSTATE_OFFLINE : "c",
            REPEAT_NONE : "c",
            REPEAT_ONE : "c",
            REPEAT_ALL : "c",
            _model : {
                playingSource : "m",
                playingTrack : "m",
                playState : "r",
                position : "r",
                queue : "m",
                repeat : "r",
                shuffle : "r",
                sourcePosition : "r",
                volume : "r"
            },
            next : "",
            pause : "",
            play : "",
            playingSource : "",
            playingTrack : "",
            playState : "",
            position : "",
            previous : "",
            repeat : "",
            shuffle : "",
            sourcePosition : "",
            togglePause : "",
            volume : "",
            queue : {
                add : "",
                addPlayingSource : "",
                clear : "",
                move : "",
                play : "",
                remove : ""
            }
        },
        logger : {
            verbosity : ""
        }
    },
        b = {
            a : {
                artist : "r",
                artistKey : "r",
                artistUrl : "r",
                canSample : "r",
                canStream : "r",
                canTether : "r",
                displayDate : "r",
                duration : "r",
                embedUrl : "r",
                icon : "r",
                icon400 : "r",
                iframeUrl : "r",
                isClean : "r",
                isExplicit : "r",
                key : "r",
                length : "r",
                name : "r",
                price : "r",
                releaseDate : "r",
                shortUrl : "r",
                trackKeys : "r",
                tracks : "m",
                type : "r",
                url : "r"
            },
            al : {
                albumKey : "r",
                artist : "r",
                artistKey : "r",
                artistUrl : "r",
                canSample : "r",
                canStream : "r",
                canTether : "r",
                displayDate : "r",
                duration : "r",
                embedUrl : "r",
                icon : "r",
                icon400 : "r",
                iframeUrl : "r",
                isClean : "r",
                isExplicit : "r",
                itemTrackKeys : "r",
                key : "r",
                length : "r",
                name : "r",
                price : "r",
                rawArtistKey : "r",
                releaseDate : "r",
                shortUrl : "r",
                trackKeys : "r",
                tracks : "m",
                type : "r",
                url : "r",
                userKey : "r",
                userName : "r"
            },
            p : {
                description : "ro",
                duration : "ro",
                embedUrl : "r",
                icon : "r",
                icon400 : "r",
                iframeUrl : "r",
                key : "r",
                lastUpdated : "r",
                length : "r",
                name : "r",
                owner : "r",
                shortUrl : "r",
                tracks : "m",
                type : "r",
                url : "r"
            },
            s : {
                baseIcon : "rao",
                canStreamHere : "r",
                firstName : "rao",
                freeRemaining : "rao",
                gender : "rao",
                icon : "rao",
                isAnonymous : "r",
                unreadNotificationsCount : "rao",
                isFree : "rao",
                isFreeExpired : "rao",
                isTrial : "rao",
                key : "ra",
                lastName : "rao",
                libraryVersion : "rao",
                stations : "rao",
                subscriptionType : "rao",
                type : "ra",
                url : "rao",
                vanityName : "rao"
            },
            t : {
                album : "r",
                albumArtist : "ro",
                albumArtistKey : "ro",
                albumKey : "r",
                albumUrl : "r",
                artist : "r",
                artistKey : "r",
                artistUrl : "r",
                canDownload : "r",
                canDownloadAlbumOnly : "r",
                canSample : "r",
                canStream : "r",
                canTether : "r",
                duration : "r",
                embedUrl : "r",
                icon : "r",
                iframeUrl : "r",
                isClean : "r",
                isExplicit : "r",
                key : "r",
                name : "r",
                price : "r",
                shortUrl : "r",
                trackNum : "r",
                type : "r",
                url : "r"
            },
            tp : {
                key : "r",
                type : "r"
            },
            rr : {
                key : "r",
                type : "r"
            },
            sr : {
                key : "r",
                type : "r"
            }
        };
    e.prototype = {
        destroy : function() {
            this.module && (this.module.destroy(), this.module = null), this.parent =
                    null
        },
        packagedValue : function() {
            return this.module ? {
                __module : this.module.toJSON()
            } : this._value
        },
        rawValue : function() {
            return this._value
        },
        setValue : function(a) {
            if (a === this._value)
                return;
            this.module && (this.module.destroy(), this.module = null), this._value =
                    a;
            if (a instanceof Backbone.Model || d(a))
                this.module = f.create({
                            original : a,
                            name : this.name,
                            map : this.map,
                            proxy : this.parent.proxy,
                            parent : this.parent
                        })
        },
        getModule : function(a) {
            return this.module ? this.module.getModule(a) : null
        }
    }, f.prototype = {
        initialize : function(a) {
            var c = this;
            console.assert("original" in a, "config.original is required"), console
                    .assert("name" in a, "config.name is required"), console
                    .assert("proxy" in a, "config.proxy is required"), _
                    .defaults(this, a, {
                                parent : null,
                                map : null
                            }), this.children = {}, this.attributes = {}, this.constants =
                    {}, this.commands = [], this.commandOverrides = {}, this.isModel =
                    this.original instanceof Backbone.Model;
            var d = this.map;
            if (this.isModel) {
                this.original.on("change", this._changeHandler, this);
                if (d === "m") {
                    var e = this.original.get("type");
                    e && e in b ? d = b[e] : console
                            .error("[ApiProxy] unknown model type for "
                                    + this._target() + ": " + e)
                }
            }
            _.isObject(d) && R.Utils.eachKey(d, function(a, b) {
                        c._add({
                                    original : c.original[b],
                                    name : b,
                                    map : a
                                })
                    })
        },
        destroy : function() {
            R.Utils.eachKey(this.children, function(a, b) {
                        a.destroy()
                    }), R.Utils.eachKey(this.attributes, function(a, b) {
                        a.destroy()
                    }), this.isModel
                    && this.original.off("change", this._changeHandler, this), this.parent =
                    null
        },
        fakeSet : function(a, b) {
            var c = this, d;
            _.isObject(a) ? d = a : (d = {}, d[a] = b);
            var e = {};
            R.Utils.eachKey(d, function(a, b) {
                var d = c.attributes[b];
                d
                        ? d.fake
                                ? a !== d.rawValue()
                                        && (d.setValue(a), e[b] =
                                                d.packagedValue())
                                : console
                                        .error(
                                                "[ApiProxy] trying to fakeSet non-fake attribute",
                                                b, a)
                        : console
                                .error(
                                        "[ApiProxy] trying to fakeSet non-existent attribute",
                                        b, a)
            }), this._sendChanges(e)
        },
        getModule : function(a) {
            return a.length ? a[0] in this.children ? this.children[a[0]]
                    .getModule(_.rest(a)) : a[0] in this.attributes
                    ? this.attributes[a[0]].getModule(_.rest(a))
                    : null : this
        },
        commandFromClient : function(a, b) {
            if (_.indexOf(this.commands, a) == -1)
                return;
            this.commandOverrides[a] ? this.commandOverrides[a].apply(
                    this.original, b) : this.original[a]
                    .apply(this.original, b)
        },
        changeFromClient : function(a) {
            var b = this,
                c = {};
            R.Utils.eachKey(a, function(a, d) {
                        var e = b.attributes[d];
                        e && e.canWrite
                                && (e.setValue(a), e.fake || (c[d] = a))
                    }), _.isEmpty(c) || this.original.set(c)
        },
        toJSON : function() {
            var a = this,
                b = {
                    children : {},
                    constants : this.constants,
                    commands : this.commands
                };
            return _.isEmpty(this.attributes)
                    || (b.attributes = {}, R.Utils.eachKey(this.attributes,
                            function(c, d) {
                                if (a.proxy.authenticated || !c.needsAuth)
                                    b.attributes[d] = c.packagedValue()
                            })), R.Utils.eachKey(this.children, function(a, c) {
                        b.children[c] = a.toJSON()
                    }), b
        },
        becameAuthenticated : function() {
            var a = this;
            if (!_.isEmpty(this.attributes)) {
                var b = {};
                R.Utils.eachKey(this.attributes, function(a, c) {
                            a.needsAuth && (b[c] = a.packagedValue())
                        }), this._sendChanges(b)
            }
            R.Utils.eachKey(this.children, function(a, b) {
                        a.becameAuthenticated()
                    })
        },
        _add : function(a) {
            console.assert("name" in a, "config.name is required");
            if (_.isString(a.map) && /c/.test(a.map)) {
                var b = this.constants[a.name] = this.original[a.name];
                c(_.isUndefined(b), a.map, this, a.name)
            } else
                _.isString(a.map) && /(f|r)/.test(a.map) || this.isModel
                        ? this.attributes[a.name] = new e({
                                    name : a.name,
                                    parent : this,
                                    map : a.map
                                })
                        : _.isObject(a.original) && !_.isEmpty(a.original)
                                ? this.children[a.name] = f.create({
                                            original : a.original,
                                            name : a.name,
                                            map : a.map,
                                            proxy : this.proxy,
                                            parent : this
                                        })
                                : _.isFunction(a.original) ? this.commands
                                        .push(a.name) : !/o/.test(a.map)
                                        && !R.ApiProxy.TESTING
                                        && c(!0, "", this, a.name)
        },
        _changeHandler : function() {
            var a = this,
                b = {};
            R.Utils.eachKey(this.original.changedAttributes(), function(c, d) {
                var e = a.attributes[d];
                if (e) {
                    d === "type"
                            && c !== e.rawValue()
                            && console
                                    .error("[ApiProxy] models changing type is not supported ("
                                            + e.rawValue() + " to " + c + ")"), e
                            .setValue(c);
                    if (a.proxy.authenticated || !e.needsAuth)
                        b[d] = e.packagedValue()
                }
            }), this._sendChanges(b)
        },
        _sendChanges : function(a) {
            if (_.isEmpty(a))
                return;
            this.proxy.sendMessage({
                        type : "change",
                        body : a,
                        target : this._target()
                    })
        },
        _target : function() {
            return this.parent
                    ? this.parent._target() + "." + this.name
                    : this.name
        }
    }, f.extend = function(a) {
        var b = function() {
            this.initialize.apply(this, arguments)
        };
        return b.prototype = _.extend({
                    _super : function(a) {
                        return f.prototype[a].apply(this, _.rest(arguments))
                    }
                }, f.prototype, a), b
    }, window.CollectionApiProxyModule = f.extend({
        initialize : function(a) {
            var b = this;
            this._super("initialize", _.extend({}, a, {
                                map : null
                            })), this.modelMap = a.map, this.models = [], this.original
                    .on("add", this._handleAdd, this), this.original.on(
                    "remove", this._handleRemove, this), this.original.on(
                    "reset", this._handleReset, this), this.original.each(
                    function(a, c) {
                        var d = R.Models.ListItem.unwrap(a);
                        b.models.push(f.create({
                                    original : d,
                                    name : "" + c,
                                    map : b.modelMap,
                                    proxy : b.proxy,
                                    parent : b
                                }))
                    })
        },
        destroy : function() {
            this.original.off("add", this._handleAdd, this), _.each(
                    this.models, function(a, b) {
                        a.destroy()
                    }), this._super("destroy")
        },
        getModule : function(a) {
            if (!a.length)
                return this;
            var b = parseInt(a[0], 10);
            return "" + b === a[0] && b >= 0 && b < this.models.length
                    ? this.models[b].getModule(_.rest(a))
                    : null
        },
        toJSON : function() {
            var a = this._super("toJSON");
            return a.models = [], _.each(this.models, function(b, c) {
                        a.models.push(b.toJSON())
                    }), a
        },
        _handleAdd : function(a, b, c) {
            var d = f.create({
                        original : R.Models.ListItem.unwrap(a),
                        name : "temp",
                        map : this.modelMap,
                        proxy : this.proxy,
                        parent : this
                    });
            this.models.splice(c.index, 0, d), _.each(this.models, function(a,
                            b) {
                        a.name = "" + b
                    }), this.proxy.sendMessage({
                        type : "add",
                        body : {
                            module : d.toJSON(),
                            index : c.index
                        },
                        target : this._target()
                    })
        },
        _handleRemove : function(a, b, c) {
            var d = this.models[c.index];
            this.models.splice(c.index, 1), _.each(this.models, function(a, b) {
                        a.name = "" + b
                    }), d.destroy(), this.proxy.sendMessage({
                        type : "remove",
                        body : {
                            module : d.toJSON(),
                            index : c.index
                        },
                        target : this._target()
                    })
        },
        _handleReset : function(a, b) {
            _.each(this.models, function(a, b) {
                        a.destroy()
                    }), this.models = [], this.proxy.sendMessage({
                        type : "reset",
                        target : this._target()
                    })
        }
    }), f.create = function(a) {
        return d(a.original) ? new CollectionApiProxyModule(a) : new f(a)
    }, R.ApiProxy = function(a) {
        var b = this;
        console.assert("easyXDM" in window, "[ApiProxy] requires easyXDM"), a =
                a || {}, this.root = null, this.authenticated = !1, this.socket =
                null, this._requests = {}, this._permissions = [], this._socketDeferred =
                $.Deferred();
        var c = $.Deferred(),
            d = $.Deferred();
        $.when(c, this._socketDeferred, d).done(_.bind(this.ready, this)), R.Services
                .ready("Player", _.bind(c.resolve, c)), this.on(
                "authenticated", d.resolve, d), a.noSocket
                ? this.ready()
                : this.socket = new easyXDM.Socket({
                            remote : a.remote,
                            container : a.container,
                            onMessage : function(a, c) {
                                var d = JSON.parse(a);
                                b._handleMessage(d)
                            },
                            onReady : function() {
                                b._socketDeferred.resolve()
                            }
                        })
    }, R.ApiProxy.prototype = _.extend({
        ready : function() {
            this.root = f.create({
                        original : R,
                        name : "R",
                        proxy : this,
                        map : a
                    }), console.log("[ApiProxy] ready"), this.sendMessage({
                        type : "ready",
                        config : this.toJSON()
                    })
        },
        destroy : function() {
            this.socket && (this.socket.destroy(), this.socket = null), this.root
                    && (this.root.destroy(), this.root = null)
        },
        sendMessage : function(a) {
            if (!a.type)
                throw new Error("[ApiProxy] messages need types");
            if (this.socket) {
                var b = JSON.stringify(a);
                this.socket.postMessage(b)
            }
        },
        command : function(a) {
            var b = a.target.split(".");
            b.shift();
            var c = this.root.getModule(b);
            c ? c.commandFromClient(a.command, a.args) : console
                    .error("[ApiProxy] command " + a.command
                            + ": unable to locate " + a.target)
        },
        change : function(a) {
            var b = a.target.split(".");
            b.shift();
            var c = this.root.getModule(b);
            c ? c.changeFromClient(a.change) : console
                    .error("[ApiProxy] change " + _.keys(a.change).join(", ")
                            + ": unable to locate " + a.target)
        },
        request : function(a) {
            function b(b) {
                a.error && a.error(b)
            }
            console.assert("method" in a, "config.method is required"), console
                    .assert("access_token" in a,
                            "config.access_token is required");
            var c = a.content ? _.clone(a.content) : {};
            return _.extend(c, {
                        method : a.method,
                        access_token : a.access_token
                    }), $.ajax({
                        url : "/api/1/" + a.method,
                        type : "POST",
                        data : c,
                        dataType : "json",
                        success : function(c) {
                            c && c.status == "ok"
                                    ? a.success && a.success(c)
                                    : b(_.defaults(c || {}, {
                                                status : "error",
                                                message : "unknown error"
                                            }))
                        },
                        error : function(a) {
                            b({
                                        status : a.statusText == "abort"
                                                ? "abort"
                                                : "error",
                                        message : a.statusText
                                                || "unknown error",
                                        code : a.status
                                    })
                        }
                    })
        },
        permissions : function() {
            return this._permissions
        },
        _handleMessage : function(a) {
            var b = this, c;
            if (!a.type) {
                console.error("[ApiProxy] message sent without type", a);
                return
            }
            switch (a.type) {
                case "command" :
                    this.command(a);
                    break;
                case "change" :
                    this.change(a);
                    break;
                case "request" :
                    function d(c) {
                        delete b._requests[a.callback], b.sendMessage({
                                    type : "callback",
                                    callback : a.callback,
                                    response : c
                                })
                    }
                    c = this.request({
                                method : a.method,
                                access_token : a.access_token,
                                content : a.content,
                                success : d,
                                error : d
                            }), this._requests[a.callback] = {
                        xhr : c
                    };
                    break;
                case "abortRequest" :
                    a.id in this._requests && this._requests[a.id].xhr
                            && this._requests[a.id].xhr.abort();
                    break;
                case "newAccessToken" :
                    this._receiveAccessToken(a.accessToken);
                    break;
                case "authenticationDenied" :
                    this._setAuthenticated(!1);
                    break;
                default :
                    console
                            .error("[ApiProxy] Unknown message from api-impl",
                                    a)
            }
        },
        _setAuthenticated : function(a, b) {
            var c = a && !this.authenticated;
            this.authenticated = a, c && this.root
                    && this.root.becameAuthenticated(), this._permissions =
                    b || [], this.sendMessage({
                        type : "authenticated",
                        authenticated : a,
                        permissions : this._permissions
                    }), this.trigger("authenticated", this.authenticated)
        },
        _receiveAccessToken : function(a) {
            var b = this;
            this.request({
                        method : "getOAuthScopes",
                        access_token : a,
                        success : function(a) {
                            b._setAuthenticated(!0, a.result)
                        },
                        error : function(a) {
                            b._setAuthenticated(!1)
                        }
                    })
        },
        toJSON : function() {
            return this.root.toJSON()
        }
    }, Backbone.Events)
}(), function() {
    function a(b) {
        var c = [];
        return _.each(b, function(b, d) {
                    _.isString(b) || _.isFunction(b) ? c.push([d, b]) : c =
                            c.concat(_.map(a(b), function(a) {
                                                return [d + a[0], a[1]]
                                            }))
                }), c
    }
    R.Router = Backbone.Router.extend({
        loginRequired : ["settings/", "activity/"],
        buildRouteMap : function(a) {
            var b = this;
            _.each(a, function(a) {
                        var c = a[0];
                        _.isRegExp(c)
                                || (c = new RegExp("^" + c + "(?:\\?.+)?$"));
                        var d = a[1],
                            e =
                                    _.isFunction(d) ? d : R.Utils.reportErrors(
                                            function() {
                                                b.trigger("contentChanged", d,
                                                        arguments)
                                            }),
                            f = function() {
                                var c = $.Event();
                                b.trigger("beforeroute", c);
                                if (c.isDefaultPrevented())
                                    return;
                                var d = b.window.location.pathname;
                                if (!b._shouldRedirectToSignin(a[0]))
                                    return e.apply(this, arguments);
                                var f = "/signin/";
                                d && (f += "?next=" + d), b.window.location.href =
                                        f
                            };
                        _.isFunction(d) ? b.route.call(b, c, c, f) : b.route
                                .call(b, c, d, f)
                    })
        },
        initialize : function() {
            _.bindAll(this, "onAnchorClicked"), this.window = window;
            var b =
                    R.Utils.getUserEnvironment(navigator).operatingSystem == "Mac";
            this.openWindowModifier = b ? "metaKey" : "ctrlKey", $("body").on(
                    "click", "a", this.onAnchorClicked);
            var c = a(R.Router.routeMap);
            this.buildRouteMap(c);
            var d = this;
            Backbone.history.handlers.push({
                        route : /^(.+)$/,
                        callback : function() {
                            var a = Backbone.history.getFragment();
                            a[a.length - 1] !== "/" ? d.navigate(a + "/", {
                                        trigger : !0,
                                        replace : !0
                                    }) : d.routeNotFound()
                        }
                    })
        },
        stop : function() {
            this.unbind(), $("body").off("click", "a", this.onAnchorClicked)
        },
        _shouldRedirectToSignin : function(a) {
            return R.currentUser.isAnonymous() ? _.any(this.loginRequired,
                    function(b) {
                        return a.indexOf(b) === 0
                    }) : !1
        },
        navigate : function(a, b) {
            a.charAt(0) === "/" && (a = a.slice(1)), Backbone.Router.prototype.navigate
                    .call(this, a, b)
        },
        routeNotFound : function(a) {
            var b = this,
                c = a || "NotFound",
                d = _.toArray(arguments).slice(1);
            R.Utils.reportErrors(function() {
                        b.trigger("contentChanged", c, d)
                    })()
        },
        redirectExternal : function(a) {
            R.router.window.location.href = a || R.router.window.location.href
        },
        onAnchorClicked : function(a) {
            var b = $(a.currentTarget);
            if (!b.length || b.prop("nodeName") !== "A") {
                console.error("[Router] Clicked anchor detection failed", b), R.Utils
                        .stopEvent(a);
                return
            }
            var c = this.openWindowModifier;
            if (!R.isDesktop && c && a[c])
                return;
            var d = b.prop("hostname"),
                e = window.location.hostname !== d && d !== "",
                f = e || b.attr("target") === "_blank",
                g = !e && /^#.+$/.test(b.attr("href"));
            if (!f && !g) {
                R.router.navigate(b.prop("pathname"), !0), R.Utils.stopEvent(a);
                return
            }
            if (g) {
                this.trigger("hashLinkClicked", b.prop("hash")), R.Utils
                        .stopEvent(a);
                return
            }
            if (f) {
                b.attr("target", "_blank");
                return
            }
        }
    }, {
        routeMap : {},
        redirect : function(a) {
            return function() {
                R.router.navigate(a, {
                            replace : !0,
                            trigger : !0
                        })
            }
        },
        redirectExternal : function(a) {
            R.router.redirectExternal(a)
        }
    })
}(), function() {
    _.extend(R.Router, {
        routeAdmin : function() {
            var a = R.Models.SimpleCollection.extend({
                        method : "adminPages"
                    }),
                b = new a, c;
            return function() {
                if (c) {
                    R.router.routeNotFound();
                    return
                }
                c = b.fetch(), c.done(function() {
                            var a = [];
                            b.each(function(b) {
                                        var c = b.get("url").substr(1),
                                            d = b.get("component");
                                        R.loader.model.get("components").get(d)
                                                && a.push([c, d])
                                    }), R.router.buildRouteMap(a), Backbone.history
                                    .loadUrl(R.router.window.location.pathname
                                            .substr(1))
                        }), c.fail(function() {
                            R.router.routeNotFound()
                        })
            }
        },
        routeIfPaymentResolved : function(a) {
            return function() {
                R.currentUser.mustResolvePayment() ? R.router.navigate(
                        "settings/payment/resolve/", !0) : R.router.trigger(
                        "contentChanged", a)
            }
        },
        routeProtected : function(a, b, c) {
            return function() {
                var d = arguments,
                    e = new R.Models.User({
                                url : "people/" + d[0] + "/"
                            });
                e.addFieldRefs(R.Models.User.profileFields), e.fetch({
                            success : function() {
                                c(e.canView() ? a : b, d, e)
                            },
                            error : function(a, b) {
                                b && b.code === 404 ? R.router
                                        .routeNotFound("NotFound") : R.router
                                        .routeNotFound("NotFound.Error")
                            }
                        })
            }
        },
        routeProtectedProfile : function(a, b) {
            return R.Router.routeProtected(a, b, function(a, b, c) {
                        R.router.trigger("contentChanged", a, b, {
                                    model : c
                                })
                    })
        }
    }), _.extend(R.Router.routeMap, {
                "admin2/.*" : R.Router.routeAdmin(),
                "admin/.*" : R.Router.redirectExternal,
                "activity/" : "RecentActivity.Page",
                "signout/" : function() {
                    R.storage.clear(), R.router.window.location.href =
                            "/logout/"
                },
                "settings/" : {
                    "" : "Settings.YourInfo",
                    "payment/resolve/" : "Settings.ResolvePayment"
                }
            })
}(), function() {
    R.Init = {
        setupGlobals : function() {
            R.currentUser
                    || (R.currentUser =
                            new R.Models.CurrentUser(Env.currentUser)), Bujagali
                    .setBaseUrl(R.serverInfo.get("media_address")), R.Api
                    .setJsonReviver(R.Utils.modelReviver), this
                    .setupBrowserFlags(), R.Utils.ensureBodyClasses(), window.HTMLElement
                    || (window.HTMLElement = window.Element), R.router =
                    new R.Router, R.Services.start()
        },
        setupBrowserFlags : function() {
            var a = R.Utils.getUserEnvironment(navigator);
            if (a.browser === "Phantom" || a.browser === "Facebook")
                R.isPhantom = !0;
            R.isMobile = a.isMobile, R.isIpadPlayer = a.isIpadPlayer, R.isIpad =
                    a.isIpad, R.isMobileBrowser = R.isMobile && !R.isIpadPlayer, R.isTv =
                    a.isTv, R.isIE = a.browser === "Internet Explorer", R.isIE8 =
                    R.isIE && a.browserVersion < 9
        },
        ensureDecentBrowser : function() {
            var a = R.Utils.getUserEnvironment(navigator);
            return a.browser == "Internet Explorer" && a.browserVersion < 8
                    || a.browser == "Safari" && a.browserVersion < 4
                    || a.browser == "Firefox" && a.browserVersion < 3.6
                    ? (R.Services.start("Loader"), R.Services.ready("Loader",
                            function() {
                                R.loader.load(["UnsupportedBrowser"],
                                        function() {
                                            var a =
                                                    new R.Components.UnsupportedBrowser;
                                            a.render(function() {
                                                        $("body").append(a.el)
                                                    })
                                        })
                            }), !1)
                    : !0
        },
        startApp : function(a) {
            var b = R.perf.createTimer("appLoad." + a);
            R.Services.ready("Loader", function() {
                R.loader.load([a], function() {
                    R.app = new (R.Component.getObject(a)), R.Services
                            .appCreated(R.app), R.app.render(function() {
                        var a = window.history && window.history.pushState;
                        window.location.hash[1] == "/"
                                && (window.location.hash =
                                        "#" + window.location.hash.substr(2)), R.currentUser
                                .isAnonymous()
                                && !a && window.location.pathname !== "/" ? $
                                .cookie("sta", !0, {
                                            path : "/"
                                        }) : $.cookie("sta", null, {
                                    path : "/"
                                }), !a
                                && window.location.pathname !== "/"
                                && $.cookie("sta", R.serverInfo.get("env_app"),
                                        {
                                            path : "/"
                                        }), Backbone.history.start({
                                    pushState : !0
                                })
                                || R.router
                                        .routeNotFound(Backbone.history.fragment), b
                                .stop(), console.timeEnd("initialize the app"), $("body")
                                .append(R.app.el)
                    })
                })
            })
        },
        installHeaderTags : function(a, b) {
            _.each(b, function(b) {
                        var c = $("<" + a + "/>");
                        c.attr(b), $("head").append(c)
                    })
        },
        rdioFaviconLinkTags : function() {
            var a = [{
                        rel : "icon shortcut",
                        href : R.serverInfo.get("favicon"),
                        type : "image/x-icon",
                        sizes : "16x16 24x24 32x32 48x48 64x64 128x128 256x256"
                    }],
                b = R.serverInfo.get("media_address") + "images/2/app_icons/";
            return R.serverInfo.get("isOi") ? a = a.concat([{
                        rel : "icon",
                        href : b + "oi_rdio_48.png",
                        sizes : "48x48"
                    }, {
                        rel : "icon",
                        href : b + "oi_rdio_64.png",
                        sizes : "64x64"
                    }, {
                        rel : "icon",
                        href : b + "oi_rdio_128.png",
                        sizes : "128x128"
                    }, {
                        rel : "icon",
                        href : b + "oi_rdio_256.png",
                        sizes : "256x256"
                    }]) : a = a.concat([{
                        rel : "icon",
                        href : b + "rdio_48.png",
                        sizes : "48x48"
                    }, {
                        rel : "icon",
                        href : b + "rdio_64.png",
                        sizes : "64x64"
                    }, {
                        rel : "icon",
                        href : b + "rdio_128.png",
                        sizes : "128x128"
                    }, {
                        rel : "icon",
                        href : b + "rdio_256.png",
                        sizes : "256x256"
                    }]), a
        }
    }, R.burnItDown = function() {
        R.app.destroy(), R.app = null, _.defer(function() {
                    R.Services.stop(), R.currentUser = null, R.serverInfo =
                            null
                })
    }
}(), function() {
    R.Mixins.sortable = {
        className : "sortable",
        onMixin : function() {
            var a = this;
            _.defaults(this.options, {
                        scrollableEl : null,
                        minSortable : -1,
                        maxSortable : 999999,
                        sortableContainer : null
                    }), this.options.sortableContainer
                    || (this.options.sortableContainer = this.el), this._separator =
                    $('<div class="sortable_separator"></div>'), this.listen(
                    R.dragManager, "dragstart", function(b) {
                        var c = a.model.indexOf(b.model);
                        c > -1 && c >= a.options.minSortable
                                && c <= a.options.maxSortable
                                && a._startReorderMode(b)
                    }), this.listen(R.dragManager, "dragend",
                    this._disableReorderMode), _.bindAll(this, "_onScroll",
                    "_disableReorderMode", "_onDrag")
        },
        _getSortableContainer : function() {
            return _.isString(this.options.sortableContainer)
                    ? this.$(this.options.sortableContainer)
                    : $(this.options.sortableContainer)
        },
        _getDragListenerNamespace : function() {
            return "sortable_" + this.cid
        },
        onInserted : function() {
            var a = this;
            this._setScrollListener(), this._oldCSSPosition =
                    $(this.el).css("position"), $(this.el).css({
                        position : "relative"
                    }), R.dragManager.setupDropTarget(this.el, {
                        onDrop : function(b) {
                            a._onDrop(b)
                        },
                        ignoreEnterLeave : !0
                    }), R.dragManager.setupDragListener(document.body, {
                        onOver : function(b) {
                            a._onDrag(b)
                        },
                        namespace : a._getDragListenerNamespace()
                    })
        },
        _setScrollListener : function() {
            var a;
            this._$scrollableEl
                    && this._$scrollableEl.unbind("scroll", this._onScroll), this.options.scrollableEl
                    ? this._$scrollableEl = $(this.options.scrollableEl)
                    : (a = R.app.getContainer(), a.$el ? this._$scrollableEl =
                            a.$el : this._$scrollableEl = a);
            if (!this._$scrollableEl || this._$scrollableEl.length !== 1)
                throw new Error("sortable: invalid scrollableEl "
                        + this._$scrollableEl);
            this._$scrollableEl.bind("scroll", this._onScroll)
        },
        onDetached : function() {
            this._disableReorderMode(), this._$scrollableEl.unbind("scroll",
                    this._onScroll), R.dragManager.cleanupDropTarget(this.el), R.dragManager
                    .cleanupDragListener(document.body, this
                                    ._getDragListenerNamespace()), $(this.el)
                    .css({
                                position : this._oldCSSPosition
                            })
        },
        setScrollableEl : function(a) {
            this.options.scrollableEl = a, this._setScrollListener()
        },
        onDestroyed : function() {
            this._items = null, this._itemMids = null, this.options.sortableContainer =
                    null
        },
        _startReorderMode : function(a) {
            var b = this,
                c = {}, d;
            if (this._reorderMode)
                return;
            if (!$(this.el).children().length)
                return;
            this._reorderMode = !0, this._oldIndex =
                    this.model.indexOf(a.model), this._draggedComponent = a, this._length =
                    this.model.length, this._separator
                    .width($(this.el).width()), this._updateBoundingBox(), this._componentHeight =
                    $(a.el).outerHeight(), this._separator.appendTo(this.el)
                    .hide(), this._items = [], _.each(b.children, function(a) {
                        a.model && (c[a.model.cid] = a)
                    }), this.model.each(function(a) {
                if (c[a.cid])
                    b._items.push(c[a.cid].el);
                else
                    throw new Error("Mismatch between sortable models and elements.")
            }), this._itemMids = [], this._updateItemMids()
        },
        _disableReorderMode : function() {
            this._reorderMode
                    && (this._draggedComponent = null, this._reorderMode = !1, this._separator
                            .remove(), this._targetOffset = -1)
        },
        _updateItemMids : function() {
            var a = this,
                b = this._getSortableContainer().children();
            _.each(this._items, function(c, d) {
                        a._itemMids[d] =
                                $(b[d]).offset().top
                                        + Math.floor($(b[d]).outerHeight() / 2)
                    })
        },
        _onDrag : function(a) {
            if (!this._reorderMode)
                return;
            var b = {
                x : a.originalEvent.clientX,
                y : a.originalEvent.clientY
            }, c, d;
            if (!this._pointIsInBox(b, this._boundingBox))
                this._separator.hide(), this._targetOffset = -1;
            else {
                for (c = 0; c < this._itemMids.length; c++)
                    if (this._itemMids[c] > b.y)
                        break;
                if (c === this._targetOffset)
                    return;
                c >= this.options.minSortable
                        && c <= this.options.maxSortable + 1
                        && (this._separator.show(), this._targetOffset = c, c > Math
                                .min(this._items.length - 1,
                                        this.options.maxSortable)
                                ? this.options.maxSortable <= this._items.length
                                        ? d =
                                                $(this._items[this.options.maxSortable])
                                                        .offset().top
                                                        + $(this._items[this.options.maxSortable])
                                                                .outerHeight()
                                                        - this._boundingBox.top
                                        : d =
                                                this._boundingBox.bottom
                                                        - this._boundingBox.top
                                : d =
                                        $(this._items[c]).offset().top
                                                - this._boundingBox.top, this._separator
                                .css({
                                            top : d,
                                            left : 0
                                        }))
            }
        },
        _onDrop : function() {
            var a = this, b;
            if (this._draggedComponent && this._targetOffset > -1) {
                b = this._targetOffset;
                if (b < this._oldIndex || b > this._oldIndex + 1)
                    b > this._oldIndex + 1 && (b -= 1), _.defer(function() {
                                a.model.trigger("move", a._oldIndex, b)
                            })
            }
            this._disableReorderMode()
        },
        _onScroll : function() {
            this._reorderMode
                    && (this._updateBoundingBox(), this._updateItemMids())
        },
        _pointIsInBox : function(a, b) {
            return a.x >= b.left && a.x <= b.right && a.y >= b.top
                    && a.y <= b.bottom
        },
        _updateBoundingBox : function() {
            var a = $(this.el),
                b = a.offset();
            this._boundingBox = {
                top : b.top,
                left : b.left,
                bottom : b.top + a.outerHeight(),
                right : b.left + a.outerWidth()
            }
        }
    }
}(), function() {
    R.Mixins.socialheat = {
        onMixin : function(a) {
            _.bindAll(this, "openSocialHeat"), _.extend(this.options, _
                            .defaults(a, {
                                        socialheatDialogTitle : t("Listeners"),
                                        socialheatDialogTooltipType : "UserInfo",
                                        socialheatLeftAligned : !1,
                                        socialheatTooltipType : "listened"
                                    }))
        },
        _ensureHovers : function() {
            var a = this.model.get("networkConsumers");
            a && a.limit() && this.$(".social_heat").hoverIntent({
                        over : this.openSocialHeat,
                        out : R.doNothing
                    })
        },
        onInserted : function() {
            this._ensureHovers()
        },
        onDetached : function() {
            this.socialHeatPopup
                    && (this.socialHeatPopup.close(), this.socialHeatPopup.$el
                            .off("mouseleave"))
        },
        openSocialHeat : function() {
            var a = this,
                b = this.$(".metadata .truncated_line, .metadata .more");
            !this.socialHeatPopup && !R.currentUser.isAnonymous() ? R.loader
                    .load(["PeopleRow"], function() {
                        a.socialHeatPopup =
                                a.addChild(new R.Components.PeopleRow({
                                    model : a.model.get("networkConsumers"),
                                    title : a.options.socialheatDialogTitle,
                                    leftAligned : a.options.socialheatLeftAligned,
                                    tooltipType : a.options.socialheatTooltipType,
                                    dialogTooltipType : a.options.socialheatDialogTooltipType
                                })), a.listen(a.socialHeatPopup, "open",
                                function() {
                                    b.hide()
                                }), a.listen(a.socialHeatPopup, "close",
                                function() {
                                    b.show()
                                }), a.socialHeatPopup.render(function() {
                                    a.$(".metadata")
                                            .before(a.socialHeatPopup.el)
                                }), a.socialHeatPopup.open()
                    })
                    : this.socialHeatPopup.open()
        }
    }
}(), function() {
    R.Mixins.draggable = {
        className : "draggable",
        onMixin : function() {
            this.dragProxy && R.loader.load([this.dragProxy]), this._proxy =
                    null, _.bindAll(this, "_createDragProxy", "onDragStart",
                    "onDragStop")
        },
        onRendered : function() {
            var a = R.app.getAppEl();
            this.$el.draggable({
                        appendTo : a,
                        containment : a,
                        cursorAt : {
                            left : 20,
                            top : -10
                        },
                        helper : this._createDragProxy,
                        start : this.onDragStart,
                        stop : this.onDragStop
                    })
        },
        _createDragProxy : function() {
            var a = $("<div/>").append('<span class="icon"/>');
            a.append('<span class="drag_icon"/>').css({
                        height : 1,
                        width : 1
                    });
            if (this.dragProxy) {
                var b = this.getDragImageEl ? this.getDragImageEl() : null,
                    c = R.Component.getObject(this.dragProxy),
                    d = new c({
                                model : this.dragProxyModel
                                        ? this.dragProxyModel
                                        : this.model,
                                imageEl : b
                            });
                d && (this._proxy = d, this._proxy.render(function() {
                            d.$el.css("opacity", "0.95"), a.append(d.$el)
                        }))
            } else {
                var e = this.$el.clone();
                e.width(this.$el.width()).css("opacity", "0.95"), a.append(e)
            }
            return a
        },
        onDragStart : function(a) {
            R.dragManager.dragStart(this)
        },
        onDragStop : function(a) {
            R.dragManager.dragEnd(this)
        }
    }
}(), function() {
    R.Mixins.formErrors = {
        className : "form_errors",
        onMixin : function() {
            this.activeErrors = []
        },
        displayFieldErrors : function(a) {
            var b = this;
            this.clearFieldErrors(), _.each(a, function(a, c) {
                        var d, e, f;
                        if (c === "__all__")
                            return;
                        d = b.$("[name=" + c + "]");
                        if (!d.length)
                            return;
                        var g = d.parent(".TextInput");
                        g.length && (d = g), f = _.map(a, function(a) {
                                    return a.replace(/^(.*?)\s*\.?\s*$/, "$1")
                                }).join(". "), d.addClass("error"), e =
                                $("<div class='error_text'>" + f + "</div>"), e
                                .insertAfter(d), b.activeErrors.push(e)
                    })
        },
        clearFieldErrors : function() {
            this.$("input.error").removeClass("error"), this._removeErrors()
        },
        onDestroyed : function() {
            this._removeErrors(), this.activeErrors = null
        },
        _removeErrors : function() {
            while (this.activeErrors.length > 0)
                this.activeErrors.pop().remove()
        }
    }
}(), function() {
    R.Mixins.deeplink = {
        onMixin : function(a) {
            _.bindAll(this, "scrollToDeeplink", "_handleRouteChange"), this.options.deeplink =
                    _.extend(this.options.deeplink || {}, a), _.defaults(
                    this.options.deeplink, {
                        autoload : !0
                    }), this.deeplink = {
                current : "",
                started : !1,
                baseUrl : this._getDeeplinkBase()
            }
        },
        onInserted : function() {
            this.options.deeplink.autoload && this.deeplinkInit()
        },
        onDetached : function() {
            this.invalidate(), this._unregisterRouteListener()
        },
        onDestroyed : function() {
            this._unregisterRouteListener()
        },
        deeplinkInit : function() {
            if (this.deeplink.started)
                return;
            this.deeplink.started = !0, this.listen(R.router,
                    "hashLinkClicked", this.scrollToDeeplink), this
                    .scrollToDeeplink(this._getDeeplinkIdFromUrl(), !1)
        },
        scrollToDeeplink : function(a, b) {
            a = _.isUndefined(a) ? this.deeplink.current : a, a =
                    a.replace(/^[#\/\s]*(.*?)[\/\s+]*$/, "$1"), b =
                    _.isUndefined(b) ? !0 : !!b;
            if (a === "" && this.deeplink.current === "")
                return;
            if (a !== "" && a === this.deeplink.current) {
                this._scrollToPosition(a);
                return
            }
            this.url =
                    a ? this.deeplink.baseUrl + a + "/" : this.deeplink.baseUrl, this.deeplink.current =
                    a, b && R.router.navigate(this.url), this
                    ._scrollToPosition(a), this._registerRouteListener()
        },
        _scrollToPosition : function(a) {
            var b = 0;
            if (a) {
                this.options.deeplink.domIdFilter
                        && (a = this.options.deeplink.domIdFilter(a));
                var c = $("#" + a + ",a[name=" + a + "]");
                b = c.length ? c.offset().top - 20 : 0
            }
            $(R.router.window).scrollTop(b);
            var d = this;
            setTimeout(function() {
                        d.isInserted() && R.router
                                && $(R.router.window).scrollTop(b)
                    }, 0)
        },
        _getDeeplinkIdFromUrl : function() {
            var a = Backbone.history.getFragment();
            return a.indexOf(this.deeplink.baseUrl) !== 0 ? "" : a.replace(
                    this.deeplink.baseUrl, "")
        },
        _getDeeplinkBase : function() {
            var a = Backbone.history.getFragment().replace(/\/$/, ""),
                b = !!_.last(this.options.urlMatches);
            return b && (a = _.initial(a.split("/")).join("/")), a == ""
                    ? a
                    : a + "/"
        },
        _registerRouteListener : function() {
            this._unregisterRouteListener(), this.listen(R.router,
                    "beforeroute", this._handleRouteChange)
        },
        _unregisterRouteListener : function() {
            this
                    .stopListening(R.router, "beforeroute",
                            this._handleRouteChange)
        },
        _handleRouteChange : function(a) {
            this._unregisterRouteListener();
            if (Backbone.history.getFragment().indexOf(this.deeplink.baseUrl) !== 0)
                return;
            R.Utils.stopEvent(a), this.scrollToDeeplink(this
                            ._getDeeplinkIdFromUrl(), !1)
        }
    }
}(), function() {
    var a = Backbone.Model.extend({
                getItem : function(a) {
                    return this.get(a)
                },
                setItem : function(a, b) {
                    this.set(a, b)
                },
                removeItem : function(a) {
                    this.unset(a)
                }
            });
    R.Services.register("Storage", {
                isGlobal : !0,
                onInitialized : function() {
                    this.localStorage = window.localStorage, this._whitelistedKeys =
                            {}
                },
                isUsable : function() {
                    return !R.currentUser.isAnonymous() && this.localStorage
                },
                preserveIfNoSpace : function(a) {
                    this._whitelistedKeys[a] = !0
                },
                _handleQuotaExceeded : function(b, c) {
                    var d = new a;
                    d.setItem(b, JSON.stringify(c));
                    for (b in this.localStorage) {
                        if (!this._whitelistedKeys[b])
                            continue;
                        c = this.localStorage.getItem(b), d.setItem(b, c)
                    }
                    this.localStorage.clear(), this.localStorage = d
                },
                getItem : function(a) {
                    return JSON.parse(this.localStorage.getItem(a) || "null",
                            R.Utils.modelReviver)
                },
                setItem : function(a, b) {
                    if (_.isUndefined(b)) {
                        this.removeItem(a);
                        return
                    }
                    try {
                        this.localStorage.setItem(a, JSON.stringify(b))
                    } catch (c) {
                        c.name === "QUOTA_EXCEEDED_ERR"
                                && this._handleQuotaExceeded(a, b)
                    }
                },
                removeItem : function(a) {
                    this.localStorage.removeItem(a)
                },
                clear : function() {
                    try {
                        this.localStorage.clear()
                    } catch (a) {
                    }
                }
            }), R.Services.register("Storage", {
                isGlobal : !0,
                needsFallback : !0,
                preserveIfNoSpace : R.doNothing,
                onStarted : function(a) {
                    R.Services.ready("FallbackWrapper", function() {
                                a()
                            })
                },
                getItem : function(a) {
                    return JSON.parse(R.Services.FallbackWrapper.getItem(a)
                            || "null")
                },
                setItem : function(a, b) {
                    R.Services.FallbackWrapper.setItem(a, JSON.stringify(b))
                },
                removeItem : function(a) {
                    R.Services.FallbackWrapper.removeItem(a)
                },
                clear : function() {
                    R.Services.FallbackWrapper.clear()
                },
                isUsable : function() {
                    return !R.currentUser.isAnonymous()
                }
            }), R.Services.register("Storage", {
                isGlobal : !0,
                isDummy : !0,
                preserveIfNoSpace : R.doNothing,
                getItem : function(a) {
                    return null
                },
                setItem : function(a, b) {
                },
                removeItem : function(a) {
                },
                clear : function() {
                }
            })
}(), function() {
    function c(a) {
        return _.indexOf(b, a.tagName.toUpperCase()) >= 0
    }
    function d(a) {
        return a.ctrlKey || a.metaKey || a.altKey
    }
    var a = {
        8 : "backspace",
        9 : "tab",
        13 : "enter",
        27 : "esc",
        32 : "space",
        33 : "pageup",
        34 : "pagedown",
        37 : "left",
        38 : "up",
        39 : "right",
        40 : "down",
        65 : "a",
        66 : "b",
        67 : "c",
        68 : "d",
        69 : "e",
        70 : "f",
        71 : "g",
        72 : "h",
        73 : "i",
        74 : "j",
        75 : "k",
        76 : "l",
        77 : "m",
        78 : "n",
        79 : "o",
        80 : "p",
        81 : "q",
        82 : "r",
        83 : "s",
        84 : "t",
        85 : "u",
        86 : "v",
        87 : "w",
        88 : "x",
        89 : "y",
        90 : "z",
        188 : ",",
        191 : "slash",
        219 : "leftBracket",
        221 : "rightBracket",
        179 : "playPause",
        178 : "stop",
        177 : "skipBack",
        176 : "skipForward",
        227 : "rewind",
        228 : "fastForward"
    },
        b = ["INPUT", "TEXTAREA", "OBJECT", "SELECT", "OPTION", "OPTGROUP"];
    R.Services.register("ShortcutManager", {
                isGlobal : !0,
                onInitialized : function() {
                    _.bindAll(this, "onKeydown", "onKeyup", "unbindKeys"), $(document)
                            .keydown(this.onKeydown), $(document)
                            .keyup(this.onKeyup)
                },
                lookupKey : function(b) {
                    return a[b]
                },
                onKeydown : function(a) {
                    var b = this.lookupKey(a.which);
                    R.serverInfo.get("prod") && b === "esc"
                            && a.preventDefault();
                    if (!b || c(a.target) || d(a))
                        return;
                    if (R.isWinDesktop && [176, 177, 179].indexOf(a.which) > -1)
                        return;
                    this.trigger("pressed:" + b, a), a.isDefaultPrevented()
                            && (this.lastPreventedCode = a.which)
                },
                onKeyup : function(a) {
                    this.lastPreventedCode == a.which
                            && (this.lastPreventedCode = null, a
                                    .preventDefault())
                },
                unbindKeys : function() {
                    $(document).unbind("keydown", this.onKeydown), $(document)
                            .unbind("keyup", this.onKeyup)
                },
                isUsable : function() {
                    return !R.currentUser.isAnonymous()
                }
            })
}(), function() {
    R.Services.register("WebSocketFactory", {
                _failureCount : 0,
                _workingSockets : !1,
                isUsable : function() {
                    return R.currentUser.isAnonymous() ? !1 : window.WebSocket
                            || window.MozWebSocket
                },
                onInitialized : function() {
                    _.bindAll(this, "_onOpened", "_onClosed", "cleanup")
                },
                _onOpened : function() {
                    this._workingSockets = !0, this._failureCount = 0
                },
                _onClosed : function() {
                    !this._workingSockets && this._failureCount++ >= 4
                            && this.trigger("remove")
                },
                cleanup : function(a) {
                    a.removeEventListener("open", this._onOpened), a
                            .removeEventListener("close", this._onClosed)
                },
                create : function(a) {
                    var b = null;
                    window.MozWebSocket ? b = window.MozWebSocket : b =
                            window.WebSocket, console
                            .log(
                                    "[WebSocketFactory] Natively trying to connect to: ",
                                    a);
                    var c = new b("ws://" + a);
                    return c.addEventListener("open", this._onOpened), c
                            .addEventListener("close", this._onClosed), c
                }
            }), R.Services.register("WebSocketFactory", {
                needsFallback : !0,
                onStarted : function(a) {
                    R.Services.FallbackWrapper.needsFallback(), R.Services
                            .ready("FallbackWrapper", function() {
                                        a()
                                    })
                },
                cleanup : R.doNothing,
                create : function(a) {
                    return R.Services.FallbackWrapper.createWebSocket(a)
                },
                isUsable : function() {
                    return !R.currentUser.isAnonymous()
                }
            }), R.Services.register("WebSocketFactory", {
                isDummy : !0,
                cleanup : R.doNothing,
                create : function(a) {
                    return {
                        addEventListener : R.doNothing,
                        send : R.doNothing,
                        close : R.doNothing
                    }
                }
            })
}(), function() {
    var a = "fallback", b;
    R.Services.register("FallbackWrapper", {
        onInitialized : function() {
        },
        onStarted : function(a) {
            this.readyCallback = a, this.needsStorage = R.storage.needsFallback, this.needsWebSockets =
                    R.Services.WebSocketFactory.needsFallback, this.needsAudio =
                    R.Services.AudioFactory
                            && R.Services.AudioFactory.needsFallback, (this.needsStorage
                    || this.needsWebSockets || this.needsAudio)
                    && this.embedSWF()
        },
        getItem : function(a) {
            if (this.isReady())
                return this._getSWF()._storage_getItem(a)
        },
        setItem : function(a, b) {
            this.isReady() && this._getSWF()._storage_setItem(a, b)
        },
        removeItem : function(a) {
            this.isReady() && this._getSWF()._storage_removeItem(a)
        },
        clear : function() {
            this.isReady() && this._getSWF()._storage_clear()
        },
        createWebSocket : function(a) {
            var b = this,
                c = {
                    callbacks : {},
                    addEventListener : function(a, b) {
                        this.callbacks[a] = b
                    },
                    removeEventListener : function(a) {
                        delete this.callbacks[a]
                    },
                    send : function(a) {
                        b._getSWF()._websocket_send(a)
                    },
                    close : function() {
                        b._getSWF()._websocket_close()
                    }
                };
            return R.Services.ready("FallbackWrapper", function() {
                        _.defer(function() {
                                    b._getSWF()._websocket_connect(a)
                                })
                    }), this._fakeSocket = c, c
        },
        createAudio : function(a) {
            return new b(this._getSWF, a)
        },
        needsFallback : function() {
            if (this.isReady() || this._embedding)
                return;
            this.embedSWF()
        },
        embedSWF : function() {
            if (this._embedding)
                return;
            console.log("[SWFFallback] Embedding fallback swf"), this._embedding =
                    !0;
            var b = R.serverInfo.get("fallbackSWFUrl"),
                d =
                        R.serverInfo.get("media_address")
                                + "flash/2/expressInstall.swf",
                e = $("body");
            $.browser.mozilla && (e = $("html")), e.prepend('<div id="' + a
                    + '" />');
            if (R.Services.TESTING)
                return;
            var f = this;
            this._websocket_internal = {
                onMessage : function(a) {
                    if (f._fakeSocket && f._fakeSocket.callbacks.message) {
                        var b = {
                            data : a
                        };
                        f._fakeSocket.callbacks.message(b)
                    }
                },
                onOpen : function() {
                    f._fakeSocket && f._fakeSocket.callbacks.open
                            && f._fakeSocket.callbacks.open()
                },
                onClose : function() {
                    f._fakeSocket && f._fakeSocket.callbacks.close
                            && f._fakeSocket.callbacks.close()
                },
                onError : function() {
                    f._fakeSocket && f._fakeSocket.callbacks.error
                            && f._fakeSocket.callbacks.error()
                }
            }, this._audio_internal = {
                onReady : function(a) {
                    c[a] && c[a].trigger("ready")
                },
                onFailure : function(a) {
                    c[a]
                            && (c[a].trigger("profiling:error"), c[a]
                                    .trigger("error"))
                },
                onEnd : function(a) {
                    c[a] && c[a].trigger("end")
                },
                onLoadStart : function(a) {
                    c[a] && c[a].trigger("profiling:loadstart")
                },
                onLoadedData : function(a) {
                    c[a] && c[a].trigger("profiling:loadeddata")
                }
            };
            var g = R.isDesktop ? -1 : 0;
            _.defer(function() {
                window != window.top
                        && console
                                .log("NOTE: The following error is an unavoidable yet harmless result of loading the Rdio audio playback Flash component inside the Rdio API iframe."), swfobject
                        .embedSWF(b, a, "1", "1", "9", d, {
                            baseUrl : R.Utils.fullUrl("/"),
                            scope : R.serverInfo.get("prod") ? "prod" : "dev",
                            authorizationKey : R.currentUser
                                    .get("authorizationKey"),
                            readyFunction : "R.Services.FallbackWrapper.ready",
                            needsStorage : f.needsStorage ? "true" : "false",
                            needsPubSub : f.needsWebSockets ? "true" : "false",
                            needsAudio : f.needsAudio ? "true" : "false",
                            jsWebSockets : "R.Services.FallbackWrapper._websocket_internal",
                            jsAudio : "R.Services.FallbackWrapper._audio_internal"
                        }, {
                            wmode : "transparent",
                            quality : "high"
                        }, {
                            style : "visibility: visible; position: absolute; top: 0px; left: "
                                    + g + "px;"
                        })
            }), this._setupTimer = setTimeout(function() {
                        f.isReady() || f.trigger("flashInitializationError")
                    }, 1e4)
        },
        ready : function() {
            clearTimeout(this._setupTimer), delete this._setupTimer, this
                    .readyCallback()
        },
        _getSWF : function() {
            return $.browser.msie ? window[a] : document[a]
        }
    });
    var c = {};
    b = function(a, b) {
        this._getSWF = a;
        var d = this;
        R.Services.ready("FallbackWrapper", function() {
                    _.defer(function() {
                                d.id = d._getSWF()._audio_create(b), c[d.id] =
                                        d
                            })
                })
    }, _.extend(b.prototype, Backbone.Events, {
                type : "flash",
                play : function(a) {
                    a === undefined && (a = -1), this._getSWF()._audio_play(
                            this.id, a)
                },
                pause : function() {
                    this._getSWF()._audio_pause(this.id)
                },
                position : function() {
                    return this._getSWF()._audio_position(this.id)
                },
                seek : function(a) {
                    this._getSWF()._audio_seek(this.id, a)
                },
                volume : function(a) {
                    this._getSWF()._audio_volume(this.id, a)
                },
                destroy : function() {
                    this._getSWF()._audio_destroy(this.id), delete c[this.id], this
                            .trigger("destroy")
                }
            })
}(), function() {
    R.Services.register("PubSub", {
        isGlobal : !0,
        onInitialized : function() {
            _.bindAll(this, "_onOpened", "_onClosed", "_onMessage",
                    "_onSocketMessage", "_onError", "_onOnlineStatusChanged"), this._reconnectIntervals =
                    [10, 100, 500, 3e3, 3e3, 3e3, 5e3, 1e4, 3e4, 6e4, 48e4,
                            96e4, 96e4, 192e4], this._reconnectIndex = 0, this._serverIndex =
                    -1, this._serverList = [], this._connected = !1, this._reconnectTimer =
                    null, this.subscriptions = {}
        },
        onStarted : function(a) {
            if (R.Services.TESTING && !R.Services.PUBSUB_TESTING)
                return;
            this.readyCallback = a;
            var b = this;
            R.Services.ready("WebSocketFactory", function() {
                        b._connect()
                    }), R.Services.ready("OfflineMonitor", function() {
                        R.offlineMonitor.bind("change",
                                b._onOnlineStatusChanged)
                    })
        },
        _onOnlineStatusChanged : function(a) {
            a
                    ? this._connected == 0
                            && (this._reconnectTimer
                                    && (clearTimeout(this._reconnectTimer), this._reconnectTimer =
                                            null), this._connect())
                    : this._connected == 1 && this._close()
        },
        _close : function() {
            console
                    .log("[WEBSOCKETS] socket is being closed, which is expected"), this._connected =
                    !1, R.Services.WebSocketFactory.cleanup(this._socket), this._socket
                    .removeEventListener("open", this._onOpened), this._socket
                    .removeEventListener("close", this._onClosed), this._socket
                    .removeEventListener("message", this._onSocketMessage), this._socket
                    .removeEventListener("error", this._onError), this._socket
                    .close(), this._socket = null
        },
        subscribe : function(a, b, c) {
            this.subscriptions[a]
                    ? this.subscriptions[a]++
                    : (this.subscriptions[a] = 1, this._connected
                            && this._sendSubscribe(a)), b && this.bind(a, b, c)
        },
        unsubscribe : function(a, b, c) {
            this.subscriptions[a]
                    && (this.subscriptions[a]--, this.subscriptions[a] === 0
                            && (delete this.subscriptions[a], this._connected
                                    && this._sendUnsubscribe(a))), b
                    && this.unbind(a, b, c)
        },
        publish : function(a, b) {
            try {
                var c = "PUB " + a + "|" + JSON.stringify(b);
                console.log("[PubSub] Publishing message: " + c), this._socket
                        .send(c)
            } catch (d) {
                R.Utils.logException("Unable to publish to websocket: ", d)
            }
        },
        onStopped : function() {
            this.unbind(), this.subscriptions = null, this._socket
                    && this._close()
        },
        userTopic : function() {
            return this._connectionInfo == null
                    ? (console
                            .log("[PubSub] userTopic called too early. Not connected yet."), null)
                    : this._connectionInfo.topic
        },
        _onMessage : function(a, b) {
            console.log("[PubSub] Received message: ", a, b), this.trigger(a,
                    a, b)
        },
        _connect : R.Utils.reportErrors(function() {
                    if (this._connected)
                        throw new Error("PubSub was already connected");
                    if (this._serverIndex < 0
                            || this._serverIndex >= this._serverList.length) {
                        var a = this;
                        R.Api.request({
                                    method : "pubsubInfo",
                                    success : function(b) {
                                        a._connectionInfo = b.result, a._serverList =
                                                b.result.servers, a._serverIndex =
                                                0, a._connect()
                                    },
                                    error : function() {
                                        a._reconnect()
                                    }
                                })
                    } else
                        this._socket = this._getWebSocket()
                }),
        _reconnect : function() {
            if (this._reconnectTimer)
                return;
            this._socket && this._close();
            var a = this._reconnectIntervals[this._reconnectIndex];
            a += Math.floor(Math.random() * (a / 2)), this._serverIndex++, (!this._serverList || this._serverIndex >= this._serverList.length)
                    && this._reconnectIndex < this._reconnectIntervals.length
                            - 1 && this._reconnectIndex++, console.log(
                    "[WEBSOCKETS] reconnecting in ", a);
            var b = this;
            b._reconnectTimer = _.delay(function() {
                        b._reconnectTimer = null, b._connect()
                    }, a)
        },
        _connectionComplete : function() {
            var a = R.Services.getCaps();
            this._socket.send("CONNECT " + this._connectionInfo.token + "|"
                    + JSON.stringify(a)), this._connected = !0, this
                    ._sendSubscribe(_.keys(this.subscriptions)), this
                    .trigger("reconnect"), this.readyCallback
                    && (this.readyCallback(), this.readyCallback = null)
        },
        _sendSubscribe : function(a) {
            if (a.length == 0)
                return;
            _.isArray(a) && (a = a.join(" ")), console
                    .log("[PubSub] Subscribing to: " + a), this._socket
                    .send("SUB " + a)
        },
        _sendUnsubscribe : function(a) {
            console.log("[PubSub] Unsubscribing from: " + a), this._socket
                    .send("UNSUB " + a)
        },
        _onOpened : function() {
            console.log("[WEBSOCKETS] opening socket"), this._reconnectIndex =
                    0, this._connectionComplete()
        },
        _onClosed : function() {
            console.log("[WEBSOCKETS] socket is closed"), this._reconnect()
        },
        _onSocketMessage : function(a) {
            if (a.data.match(/^PUB/))
                try {
                    var b = a.data.substr(4),
                        c = b.split("|");
                    this._onMessage(c[0], JSON.parse(_.rest(c).join("|")))
                } catch (d) {
                    R.Utils.logException("Unable to parse PUB message: "
                                    + a.data, d)
                }
        },
        _onError : function(a) {
            R.Utils.logException("[WEBSOCKET] error", a), this._reconnect()
        },
        _getWebSocket : function() {
            var a =
                    R.Services.WebSocketFactory
                            .create(this._serverList[this._serverIndex]);
            return a.addEventListener("open", this._onOpened), a
                    .addEventListener("close", this._onClosed), a
                    .addEventListener("message", this._onSocketMessage), a
                    .addEventListener("error", this._onError), a
        },
        isUsable : function() {
            return !R.currentUser.isAnonymous()
        }
    }), R.Services.register("PubSub", {
                isGlobal : !0,
                isDummy : !0,
                subscribe : function(a, b, c) {
                },
                unsubscribe : function(a, b, c) {
                },
                publish : function(a, b) {
                },
                userTopic : function() {
                    return null
                }
            })
}(), function() {
    R.Services.register("DragManager", {
        isGlobal : !0,
        _dropStack : [],
        _currentGreedyDrop : null,
        _dragHappening : !1,
        setupDropTarget : function(a, b) {
            var c = $(a),
                d = this, e, f, g;
            b = b || {}, _.defaults(b, {
                        allowedComponents : null,
                        ignoreEnterLeave : !1,
                        greedy : !1,
                        onEnter : R.doNothing,
                        onLeave : R.doNothing,
                        onDrop : R.doNothing,
                        canAcceptDrop : !0,
                        applyStyling : !0
                    });
            var h = function(a) {
                var c = b.canAcceptDrop;
                return _.isFunction(c) ? c(a) : c
            };
            b.ignoreEnterLeave || (e = this._checkDraggedType(function(e, f) {
                        if (d._checkGreedy(a))
                            return;
                        d._setCurrentTarget(a), f.helper
                                .removeClass("allowed not_allowed"), b.applyStyling
                                && (h(d._draggedComponent) ? (c
                                        .addClass("drop_over"), f.helper
                                        .addClass("allowed")) : f.helper
                                        .addClass("not_allowed")), b.onEnter(e,
                                d._draggedComponent)
                    }, b.allowedComponents), f =
                    this._checkDraggedType(function(e, f) {
                        c.removeClass("drop_over"), d._getCurrentTarget() == a
                                && f.helper.removeClass("allowed not_allowed"), d
                                ._clearDropTarget(a), b.onLeave(e,
                                d._draggedComponent)
                    }, b.allowedComponents)), g =
                    this._checkDraggedType(function(e) {
                                if (d._checkGreedy(a)
                                        || !h(d._draggedComponent))
                                    return;
                                c.removeClass("drop_over"), d.trigger("drop",
                                        d._draggedComponent), b.onDrop(e,
                                        d.getDropPayload(d._draggedComponent))
                            }, b.allowedComponents), b.greedy
                    && c.data("greedyDrop", !0), c.droppable({
                        tolerance : "pointer",
                        over : e,
                        out : f,
                        drop : g
                    })
        },
        cleanupDropTarget : function(a) {
            $(a).droppable("destroy"), $(a).data("greedyDrop", null)
        },
        setupDragListener : function(a, b) {
            var c = $(a),
                d = this;
            _.defaults(b, {
                        namespace : "dl",
                        onEnter : R.doNothing,
                        onLeave : R.doNothing,
                        onOver : R.doNothing
                    }), c.hasClass("ui-droppable") || c.droppable({
                        tolerance : "pointer"
                    }), c.bind("dropover.dragover_" + b.namespace, function(e) {
                if (a != e.target)
                    return;
                $("body").bind("mousemove.dragover_" + b.namespace,
                        function(a) {
                            e.originalEvent.pageX = a.originalEvent.pageX, e.originalEvent.clientX =
                                    a.originalEvent.clientX, e.originalEvent.pageY =
                                    a.originalEvent.pageY, e.originalEvent.clientY =
                                    a.originalEvent.clientY
                        }), c.data("dragover", !0), setTimeout(function f() {
                            b.onOver(e, d._draggedComponent), c
                                    .data("dragover")
                                    && setTimeout(f, 150)
                        }, 150), b.onEnter(e, d._draggedComponent)
            }), c.bind("dropout.dragover_" + b.namespace, function(e) {
                        if (a != e.target)
                            return;
                        c.data("dragover", null), $("body")
                                .unbind("mousemove.dragover_" + b.namespace), b
                                .onLeave(e, d._draggedComponent)
                    }), c.bind("drop.dragover_" + b.namespace, function(a) {
                        $("body").unbind("mousemove.dragover_" + b.namespace)
                    })
        },
        cleanupDragListener : function(a, b) {
            $(a).unbind(".dragover_" + b), $(a).data("dragover", null)
        },
        dragStart : function(a) {
            this._dragHappening = !0, $("<div/>").addClass("drag_shield")
                    .appendTo("body"), this.trigger("dragstart", a), this._draggedComponent =
                    a
        },
        dragEnd : function(a) {
            this._dragHappening = !1, $("body > .drag_shield").remove(), this
                    .trigger("dragend", a), this._clearAllDragoverIntervals(), this
                    ._clearAllDropTargets(), this._draggedComponent = null
        },
        isDragHappening : function() {
            return this._dragHappening
        },
        getDropPayload : function(a) {
            return _.isFunction(a.dropPayload) ? a.dropPayload() : a.model
        },
        _getCurrentTarget : function() {
            return _.last(this._dropStack)
        },
        _setCurrentTarget : function(a) {
            $(a).data("greedyDrop") && (this._currentGreedyDrop = a), this._dropStack
                    .push(a)
        },
        _clearDropTarget : function(a) {
            this._dropStack = _.without(this._dropStack, a), a == this._currentGreedyDrop
                    && (this._currentGreedyDrop = null)
        },
        _clearAllDropTargets : function() {
            this._dropStack = [], this._currentGreedyDrop = null
        },
        _clearAllDragoverIntervals : function() {
            var a = this;
            $(":data(dragover)").data("dragover", null)
        },
        _checkGreedy : function(a) {
            var b = this._getCurrentTarget();
            return !b || a == b || a == this._currentGreedyDrop
                    ? !1
                    : this._currentGreedyDrop
                            && !$(a).parents(":data(greedyDrop)").length
                            ? !0
                            : !1
        },
        _checkDraggedType : function(a, b) {
            var c = R.Utils.reportErrors(a),
                d = this;
            return _.isArray(b) ? function() {
                if (_.any(b, function(a) {
                            return d._draggedComponent instanceof a
                        }))
                    return c.apply(this, arguments)
            } : c
        }
    })
}(), function() {
    R.Services.register("Notifications", {
        isGlobal : !0,
        NOTIFICATION_TYPES : ["alert", "growl", "badge"],
        PRIORITY : {
            LOW : 1,
            MEDIUM : 2,
            HIGH : 3
        },
        onInitialized : function() {
            this.notifications = {}, this._appReady = !1, this._pendingNotifyEvents =
                    []
        },
        notify : function(a, b) {
            b = _.defaults(b || {}, {
                        notificationId : _.uniqueId("notification"),
                        priority : this.PRIORITY.MEDIUM
                    });
            if (_.indexOf(this.NOTIFICATION_TYPES, a) == -1)
                return;
            if (this._higherPriorityExists(a, b.priority))
                return;
            return this._addNotification(a, b.notificationId, b.priority,
                    b.namespace), this._notify(a, b), b.notificationId
        },
        _notify : function(a, b) {
            this._appReady ? (this.trigger("notify", b), this.trigger("notify:"
                            + a, b)) : this._pendingNotifyEvents.push({
                        type : a,
                        options : b
                    })
        },
        setAppReady : function() {
            var a = this;
            this._appReady = !0, _.each(this._pendingNotifyEvents, function(b) {
                        a._notify(b.type, b.options)
                    })
        },
        notificationCount : function(a) {
            return _.filter(this.notifications, function(b) {
                        return b.type == a
                    }).length
        },
        hasNotification : function(a) {
            return this.notifications.id ? !0 : !1
        },
        clear : function(a) {
            var b = this, c;
            a.namespace
                    ? c = this._getNotificationsByNamespace(a.namespace)
                    : c = [this.notifications[a.notificationId]], _.each(c,
                    function(a) {
                        a && (b._removeNotification(a.id), b._clear(a))
                    })
        },
        _clear : function(a) {
            this._appReady
                    ? (this.trigger("clear", a), this.trigger("clear:" + a.id,
                            a), this.trigger("clear:" + a.type, a))
                    : this._pendingNotifyEvents =
                            _.reject(this._pendingNotifyEvents, function(b) {
                                        return b.options.id === a.id
                                    })
        },
        _higherPriorityExists : function(a, b) {
            return a == "badge" ? !1 : _.any(_.values(this.notifications),
                    function(c) {
                        return c.type === a && c.priority > b
                    })
        },
        _getNotificationsByNamespace : function(a) {
            return _.filter(_.values(this.notifications), function(b) {
                        return b.namespace === a
                    })
        },
        _removeNotification : function(a) {
            _.has(this.notifications, a) && delete this.notifications[a]
        },
        _addNotification : function(a, b, c, d) {
            _.has(this.notifications, b) && a != "badge" && this.clear({
                        notificationId : b
                    }), this.notifications[b] = {
                id : b,
                namespace : d,
                type : a,
                priority : c
            }
        }
    })
}(), function() {
    R.Services.register("OfflineMonitor", {
        isGlobal : !0,
        onInitialized : function() {
            var a = this;
            this._currentState = navigator.onLine, this._timer =
                    setInterval(function() {
                                a._onTick()
                            }, 2e3)
        },
        isOnline : function() {
            return this._currentState
        },
        setIsOnline : function(a) {
            this._timer && (clearInterval(this._timer), this._timer = null), console
                    .log("[OfflineMonitor] Overriding online state. From: "
                            + this._currentState + " To: " + a);
            var b = this._currentState;
            this._currentState = a, this.trigger("change", this._currentState,
                    b)
        },
        _onTick : function() {
            if (navigator.onLine == this._currentState)
                return;
            console.log("[OfflineMonitor] Online state changed from: "
                    + this._currentState + " to: " + navigator.onLine);
            var a = this._currentState;
            this._currentState = navigator.onLine, this.trigger("change",
                    this._currentState, a)
        }
    })
}(), function() {
    function c(a, b) {
        this.name = a, this._browser = b, this.startTime = new Date, console.time
                && console.time(a)
    }
    function d(a, c) {
        this.name = a, this._browser = c, this._count = 0, this._serverCount =
                0, b.push(this)
    }
    var a = [],
        b = [];
    _.extend(c.prototype, {
                stop : function() {
                    var b = new Date;
                    return this.time = b - this.startTime, console.timeEnd
                            ? console.timeEnd(this.name)
                            : console
                                    .log("[Timer]", this.name + ":", this.time), a
                            .push(this), this.time
                },
                toJSON : function() {
                    return {
                        bucket : this.name + "." + this._browser,
                        stat : this.time + "|ms",
                        timestamp : this.startTime
                    }
                }
            }), _.extend(d.prototype, {
                increment : function() {
                    this._count += 1
                },
                getCount : function() {
                    return this._count
                },
                _needsToBeSaved : function() {
                    return this._count !== this._serverCount && !this._isSaving
                },
                _beginSaving : function() {
                    this._isSaving = !0, this._countBeingSaved = this._count
                },
                _completeSave : function() {
                    this._isSaving = !1, this._serverCount =
                            this._countBeingSaved
                },
                _failSave : function() {
                    this._isSaving = !1
                },
                toJSON : function() {
                    var a = this._count - this._serverCount;
                    return {
                        bucket : this.name + "." + this._browser,
                        stat : a + "|c"
                    }
                }
            }), R.Services.register("Perf", {
        isGlobal : !0,
        onInitialized : function() {
            _.bindAll(this, "reportToServer")
        },
        onStarted : function(a) {
            this._interval = setInterval(this.reportToServer, 2e4);
            var b = R.Utils.getUserEnvironment(navigator);
            this._browser = b.browser.replace(/ /g, "-"), b.browser === "Internet Explorer"
                    && (this._browser = "IE" + b.browserVersion), a()
        },
        onStopping : function() {
            clearInterval(this._interval), this.reportToServer()
        },
        _reDots : /\./g,
        createTimer : function(a) {
            return new c(this._getBucketName(arguments), this._browser)
        },
        createCounter : function(a) {
            return new d(this._getBucketName(arguments), this._browser)
        },
        _getBucketName : function(a) {
            var b = this;
            return _.reduce(_.tail(a), function(a, c) {
                        return a + "." + c.replace(b._reDots, "_")
                    }, a[0].replace(b._reDots, "_"))
        },
        reportToServer : function() {
            var c = this,
                d = _.filter(b, function(a) {
                            return a._needsToBeSaved()
                        }),
                e = a.concat(d);
            if (!e.length)
                return;
            a = [], _.each(d, function(a) {
                        a._beginSaving()
                    }), R.Api.request({
                        method : "recordClientStats",
                        content : {
                            stats : JSON.stringify(e)
                        },
                        success : function() {
                            _.each(d, function(a) {
                                        a._completeSave()
                                    })
                        },
                        error : function(a) {
                            console.error("could not record perf stats", a), c
                                    .isReady()
                                    && _.each(d, function(a) {
                                                a._failSave()
                                            })
                        }
                    })
        }
    })
}(), function() {
    R.Services.register("ErrorReporter", {
        onStarted : function(a) {
            _.bindAll(this, "reportError", "_resetCounter"), this._errorCounter =
                    0, this._timer = setInterval(this._resetCounter, 6e4), window.onerror =
                    this.reportError, a()
        },
        onStopping : function() {
            window.onerror = R.doNothing, clearInterval(this._timer)
        },
        _resetCounter : function() {
            this._errorCounter = 0
        },
        _hostRe : new RegExp(window.location.host.replace("www.", "")),
        reportError : function(a, b, c, d) {
            try {
                this._errorCounter++;
                if (this._errorCounter >= 30) {
                    R.Services.stop("ErrorReporter");
                    return
                }
                if (!b || !this._hostRe.test(b))
                    return;
                console.log("[Rdio 2 Error] msg:" + a + " url:" + b + " line:"
                        + c), R.Api.request({
                            method : "jsError",
                            content : {
                                msg : a.toString(),
                                url : b,
                                line : c,
                                location : window.location.toString(),
                                log : R.logger.logQueue.join("::"),
                                stack : _.isString(d) ? d : ""
                            },
                            success : function() {
                                console.log("reported error to server")
                            },
                            error : function() {
                                console.error("could not report error",
                                        arguments)
                            }
                        })
            } catch (e) {
                console.exception("Exception occurred while reporting error: ",
                        e)
            }
        }
    })
}(), function() {
    _.extend(R.Router, {
                routeProtectedPlaylist : function(a, b) {
                    return R.Router.routeProtected(a, b, function(a, b) {
                                R.router.trigger("contentChanged", a, b)
                            })
                },
                routeIfArtistProgram : function(a) {
                    return function(b) {
                        R.currentUser.getArtistAccountArtist(b) ? R.router
                                .trigger("contentChanged", a) : R.router
                                .navigate("/artist/" + b + "/", !0)
                    }
                },
                routeIfHasPermission : function(a, b) {
                    return function(c) {
                        var d = R.currentUser.getArtistAccountArtist(c);
                        d && d.hasPermission(b) ? R.router.trigger(
                                "contentChanged", a) : R.router.navigate(
                                "/artist/" + c + "/", !0)
                    }
                },
                routeIfDevsite : function(a) {
                    return function() {
                        R.currentUser.get("features").devsite
                                ? R.router.trigger("contentChanged", a,
                                        arguments)
                                : R.router.window.location.href = "/"
                    }
                },
                redirectToDevsite : function(a) {
                    return function(b) {
                        var c = "/";
                        R.currentUser.get("features").devsite
                                && (c =
                                        "http://dev-beta.rdio."
                                                + (R.serverInfo.get("prod")
                                                        ? "com/"
                                                        : "localhost:8000/")
                                                + (a || "") + (b || "")), R.router
                                .redirectExternal(c)
                    }
                }
            }), R.Router._rdioMap = {
        "apps/" : R.Router.redirectExternal,
        "people/" : {
            "([a-zA-Z0-9_-]{3,30})/" : R.Router.routeProtectedProfile(
                    "Profile.Profile.Rdio", "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/playlists/" : R.Router
                    .routeProtectedProfile("Profile.Playlists",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/playlists/(collaborations|subscribed)/" : R.Router
                    .routeProtectedProfile("Profile.Playlists",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/playlists/(\\d+)/(.*?)/" : R.Router
                    .routeProtectedPlaylist("PlaylistPage",
                            "PlaylistPage.Protected"),
            "([a-zA-Z0-9_-]{3,30})/people/(following|followers)/" : R.Router
                    .routeProtectedProfile("Profile.People.Rdio",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/people/(followers)/(pending)/" : R.Router
                    .routeProtectedProfile("Profile.People.Rdio",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/reviews/" : R.Router.routeProtectedProfile(
                    "Profile.Reviews", "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/reviews/.+" : function(a) {
                R.router.navigate("people/" + a + "/reviews/", !0)
            },
            "([a-zA-Z0-9_-]{3,30})/collection/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(search)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(search)/(.*)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(songs)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(songs)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(songs)/(search)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(songs)/(search)/(.*)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(search)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(search)/(.*)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(songs)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(songs)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(songs)/(search)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/(artist)/(.*)/(songs)/(search)/(.*)/(sort)/(.*)/" : R.Router
                    .routeProtectedProfile("Profile.Collection",
                            "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/collection/albums/.*" : function(a) {
                R.router.navigate("people/" + a + "/collection/", !0)
            },
            "([a-zA-Z0-9_-]{3,30})/collection/artist/(.*)/album/(.*)/" : function(
                    a, b, c) {
                R.router.navigate("people/" + a + "/collection/artist/" + b
                                + "/search/" + c + "/", !0)
            },
            "([a-zA-Z0-9_-]{3,30})/playing/" : R.Router.routeProtectedProfile(
                    "Profile.Queue.Page", "Profile.Protected.Rdio"),
            "([a-zA-Z0-9_-]{3,30})/history/" : R.Router.routeProtectedProfile(
                    "Profile.HistoryPage", "Profile.Protected.Rdio")
        },
        "artist/" : {
            "(.+)/" : "Catalog.Artist",
            "(.+)/albums/" : "Catalog.Artist.Albums",
            "(.+)/albums/(sort)/(name|releaseDate)/" : "Catalog.Artist.Albums",
            "(.+)/albums/(search)/(.*)/" : "Catalog.Artist.Albums",
            "(.+)/albums/(sort)/(name|releaseDate)/(search)/(.*)/" : "Catalog.Artist.Albums",
            "(.+)/songs/" : "Catalog.Artist.Songs",
            "(.+)/songs/(sort)/(name|releaseDate)/" : "Catalog.Artist.Songs",
            "(.+)/songs/(search)/(.*)/" : "Catalog.Artist.Songs",
            "(.+)/songs/(sort)/(name|releaseDate)/(search)/(.*)/" : "Catalog.Artist.Songs",
            "(.+)/(albums|songs)/release_date/(.*)" : function(a, b, c) {
                var d = "artist/" + a + "/" + b + "/sort/releaseDate/" + c;
                R.router.navigate(d, !0)
            },
            "(.+)/(albums|songs)/sort/release_date/(.*)" : function(a, b, c) {
                var d = "artist/" + a + "/" + b + "/sort/releaseDate/" + c;
                R.router.navigate(d, !0)
            },
            "(.+)/related/" : "Catalog.Artist.RelatedArtists",
            "(.+)/related/(.+)/" : "Catalog.Artist.RelatedArtists",
            "(.+)/bio/" : function(a) {
                R.router.navigate("artist/" + a + "/biography/", !0)
            },
            "(.+)/biography/" : "Catalog.ReviewPage",
            "(.+)/album/(.+)/" : "Catalog.Album",
            "(.+)/album/(.+)/track/(.+)/" : "Catalog.Album",
            "(.+)/manage/" : {
                "" : R.Router.routeIfArtistProgram("ArtistProgram.Stats"),
                "links/" : R.Router.routeIfArtistProgram("ArtistProgram.Links"),
                "photo/" : R.Router.routeIfHasPermission("ArtistProgram.Photo",
                        "manageusers"),
                "payments/" : R.Router.routeIfHasPermission(
                        "ArtistProgram.Payments", "manageusers"),
                "admin/" : R.Router.routeIfHasPermission("ArtistProgram.Admin",
                        "manageusers")
            },
            "Various_Artists/" : "NotFound"
        },
        "label/" : {
            "(.+)/" : "Catalog.Label",
            "(.+)/artists/" : "Catalog.Label.Artists",
            "(.+)/(search)/(.*)/" : "Catalog.Label",
            "(.+)/(sort)/(name|releaseDate)/" : "Catalog.Label",
            "(.+)/(sort)/(name|releaseDate)/(search)/(.*)/" : "Catalog.Label"
        },
        "search/" : {
            "(.*)/" : "Search.Page.Rdio",
            "(.*)/(artists|albums|tracks|playlists|people|labels)/" : "Search.Page.Rdio"
        },
        "notifications/" : "NotificationsPage",
        "browse/" : {
            "charts/(.*)/" : "TopChartsPage",
            "charts/" : "TopChartsPage",
            "new/(thisweek|lastweek|twoweeks)/" : "NewReleasesPage",
            "new/" : "NewReleasesPage",
            "" : "TopChartsPage"
        },
        "gift/" : function() {
            if (R.currentUser.isAnonymous()) {
                R.router.window.location.href = "/gift-certificates/";
                return
            }
            R.serverInfo.get("giftcardValidRegion") ? R.router.trigger(
                    "contentChanged", "GiftCertificate", arguments) : R.router
                    .routeNotFound()
        },
        "off/" : function() {
            R.router.window.location.reload()
        },
        "developer/" : {
            "(.*)" : R.Router.redirectToDevsite(""),
            "apps/" : R.Router.redirectToDevsite("applist/")
        },
        "platform/" : {
            "" : R.Router.routeIfDevsite("Platform.AppList"),
            "([a-z]+)/" : R.Router.routeIfDevsite("Platform.App")
        },
        "/?" : "HeavyRotation",
        "management/" : R.Router.redirect("settings/"),
        "management/my_photo/" : R.Router.redirect("settings/"),
        "management/login_info/" : R.Router.redirect("settings/"),
        "management/login_email_info/" : R.Router.redirect("settings/"),
        "management/payment_profiles/" : R.Router.redirect("settings/payment/"),
        "settings/payment_profiles/" : R.Router.redirect("settings/payment/"),
        "management/email_notifications/" : R.Router
                .redirect("settings/notifications/"),
        "management/external/" : R.Router.redirect("settings/external/"),
        "management/advanced/" : R.Router.redirect("settings/advanced/"),
        "management/subscriptions/" : R.Router
                .redirect("settings/subscription/"),
        "management/try_rdio2/" : R.Router.redirect("/"),
        "management/resolve_subscription/" : R.Router
                .redirect("settings/subscription/resolve/"),
        "_%3D_/?" : R.Router.redirect("/"),
        "_=_/?" : R.Router.redirect("/")
    }, _.extend(R.Router.routeMap["settings/"], {
                "subscription/" : R.Router
                        .routeIfPaymentResolved("Settings.Subscription"),
                "payment/" : R.Router
                        .routeIfPaymentResolved("Settings.Payment"),
                "external/" : "Settings.External.Rdio",
                "notifications/" : "Settings.Notifications",
                "advanced/" : "Settings.Advanced.Rdio"
            }), _.extend(R.Router.routeMap, R.Router._rdioMap)
}(), function() {
    var a =
            ["loadstart", "progress", "suspend", "abort", "error", "emptied",
                    "stalled", "loadedmetadata", "loadeddata", "canplay",
                    "canplaythrough", "playing", "waiting", "seeking",
                    "seeked", "ended", "durationchange", "timeupdate", "play",
                    "pause", "ratechange", "volumechange"],
        b = ["loadstart", "loadeddata", "stalled", "waiting"],
        c = null,
        d = function(a) {
            var d = this;
            _.bindAll(this, "_triggerError", "_triggerEnd", "_triggerReady",
                    "_onLoadedMetadata", "_bubbleProfilingEvent"), c
                    || (c = new Audio), this._element = c, this._element.src =
                    a.streamUrl, this._element.addEventListener("ended",
                    this._triggerEnd), this._element.addEventListener("error",
                    this._triggerError), this._element.addEventListener(
                    "canplay", this._triggerReady), this._element
                    .addEventListener("loadedmetadata", this._onLoadedMetadata), _
                    .each(b, function(a) {
                                d._element.addEventListener(a,
                                        d._bubbleProfilingEvent)
                            }), this._element.load()
        };
    _.extend(d.prototype, Backbone.Events, {
        type : "native",
        play : function(a) {
            this.seek(a), _.isNumber(this._volume)
                    && (this._element.volume = this._volume), this._element
                    .play()
        },
        pause : function() {
            this._element.volume = 0, this._element.pause()
        },
        position : function() {
            return this._element.currentTime
        },
        seek : function(a) {
            _.isNumber(a)
                    && this._element.readyState !== this._element.HAVE_NOTHING
                    && (this._element.currentTime = a)
        },
        volume : function(a) {
            this._volume = a, this._element.volume = a
        },
        destroy : function() {
            var c = this;
            this.unbind();
            try {
                this._element.pause(), this._element.removeEventListener(
                        "error", this._triggerError), this._element
                        .removeEventListener("ended", this._triggerEnd), this._element
                        .removeEventListener("canplay", this._triggerReady), this._element
                        .removeEventListener("loadedmetadata",
                                this._onLoadedMetadata), _.each(b, function(a) {
                            c._element.removeEventListener(a,
                                    c._bubbleProfilingEvent)
                        }), _.each(a, function(a) {
                            c._element.removeEventListener(a, c._logEvent)
                        }), this.trigger("destroy")
            } catch (d) {
            }
        },
        _triggerError : function(a) {
            a.target.error.code == 4
                    && R.Services.AudioFactory.trigger("remove"), this
                    ._bubbleProfilingEvent(a), this.trigger("error", a)
        },
        _triggerEnd : function() {
            this.trigger("end")
        },
        _triggerReady : function() {
            this.trigger("ready")
        },
        _onLoadedMetadata : function() {
            this._element.currentTime = 0
        },
        _duration : 0,
        _lastDurationChange : 0,
        _onDurationChange : function(a) {
            var b = a.target,
                c = (new Date).getTime() / 1e3,
                d = this._lastDurationChange ? c - this._lastDurationChange : 0;
            this._lastDurationChange = c, b.duration > this._duration - 2
                    || d < 10 ? this._duration = b.duration : this
                    ._triggerError(a)
        },
        _progressLogCounter : 0,
        _logEvent : function(a) {
            var b,
                c = a.target,
                d = "[AudioElement] " + a.type;
            if (a.type == "progress") {
                this._progressLogCounter++;
                if (this._progressLogCounter % 8 != 0)
                    return
            }
            console.groupCollapsed && console.groupCollapsed(d), console.log(
                    "readyState:", c.readyState), console.log("networkState:",
                    c.networkState), console.log("error:", c.error), console
                    .log("paused:", c.paused), console.log("currentTime:",
                    c.currentTime), console.log("duration:", c.duration);
            var e = "";
            for (b = 0; b < c.buffered.length; b++)
                e +=
                        "[" + c.buffered.start(b) + " - " + c.buffered.end(b)
                                + "] ";
            var f = "";
            for (b = 0; b < c.seekable.length; b++)
                f +=
                        "[" + c.seekable.start(b) + " - " + c.seekable.end(b)
                                + "] ";
            console.log("buffered:", e), console.log("seekable:", f), console.groupEnd
                    && console.groupEnd(d)
        },
        _bubbleProfilingEvent : function(a) {
            a.type === "error" ? this.trigger("profiling:error", this
                            ._getErrorType()) : this.trigger("profiling:"
                    + a.type)
        },
        _getErrorType : function() {
            switch (this._element.error) {
                case 1 :
                    return "ABORTED";
                case 2 :
                    return "NETWORK";
                case 3 :
                    return "DECODE";
                case 4 :
                    return "SRC_NOT_SUPPORTED";
                default :
                    return ""
            }
        }
    }), R.Services.register("AudioFactory", {
        audioType : "mp3-high",
        isUsable : function() {
            var a;
            a = R.Utils.getUserEnvironment(navigator);
            if (!R.isMobile && a.browser === "Safari" && a.browserVersion < 6)
                return !1;
            console
                    .log("[AudioFactory] asking if the Audio element can play mp3");
            try {
                var b = (new Audio).canPlayType('audio/mpeg; codecs="mp3"');
                console.log("[AudioFactory] returned: " + b);
                if (b == "probably" || b == "maybe")
                    return !0
            } catch (c) {
            }
            return !1
        },
        create : function(a) {
            return new d(a)
        }
    }, {
        priority : 1
    }), R.Services.register("AudioFactory", {
                needsFallback : !0,
                audioType : "flash",
                isUsable : function() {
                    return swfobject.hasFlashPlayerVersion("1")
                },
                onStarted : function(a) {
                    R.Services.FallbackWrapper.needsFallback(), R.Services
                            .ready("FallbackWrapper", function() {
                                        a()
                                    })
                },
                create : function(a) {
                    return R.Services.FallbackWrapper.createAudio(a)
                }
            }, {
                priority : 2
            }), R.Services.register("AudioFactory", {
                isDummy : !0,
                audioType : "none",
                create : function(a) {
                    return _.extend({
                                type : "dummy",
                                play : R.doNothing,
                                pause : R.doNothing,
                                position : function() {
                                    return 0
                                },
                                seek : R.doNothing,
                                volume : R.doNothing,
                                destroy : R.doNothing
                            }, Backbone.Events)
                }
            }, {
                priority : 3
            })
}(), function() {
    var a = function(a, b) {
        this._model = a, this._playerData = b, this._onPlayingTrackChanged =
                _.throttle(this._onPlayingTrackChanged, 1e3), _.bindAll(this,
                "_onPlayingTrackChanged", "_onShuffleChanged",
                "_onPlayingSourceChanged", "_onSourceTrackAdded",
                "_onSourceTrackRemoved"), this._model.bind(
                "change:playingTrack", this._onPlayingTrackChanged), this._model
                .bind("change:shuffle", this._onShuffleChanged), this._model
                .bind("change:playingSource", this._onPlayingSourceChanged)
    };
    _.extend(a.prototype, Backbone.Events, {
        playSource : function(a, b) {
            function d(d) {
                var e = 0;
                c._model.get("shuffle") && d.get("type") != "t"
                        && !R.isStation(d) ? (c._addShuffleData(d, a.index), e =
                        d.get("shuffledPositions")[0]) : a.index
                        && (e = a.index);
                var f = {
                    playingSource : d,
                    sourcePosition : e
                };
                d.set({
                            currentPosition : f.sourcePosition
                        }, {
                            silent : !0
                        }), d.get("type") == "t"
                        ? f.playingTrack = d
                        : f.playingTrack =
                                R.Models.ListItem.unwrap(d.get("tracks")
                                        .at(f.sourcePosition)), R.isStation(d)
                        && (f.station = d), c._model.set(f), b()
            }
            var c = this;
            if (this._model.get("station")
                    && this._getKey(a.source) == this._model.get("station")
                            .get("key")) {
                a.index
                        || (a.index =
                                this._model.get("station")
                                        .get("currentPosition")), d(this._model
                        .get("station"));
                return
            }
            if (this._isSourceLoaded(a.source)) {
                d(a.source);
                return
            }
            var e = this._getKey(a.source);
            this._loadSource(e, function(a) {
                        d(a)
                    })
        },
        _onPlayingSourceChanged : function() {
            var a = this._model.previous("playingSource");
            a
                    && a.get("tracks")
                    && (a.get("tracks").unbind("add", this._onSourceTrackAdded), a
                            .get("tracks").unbind("remove",
                                    this._onSourceTrackRemoved));
            var b = this._model.get("playingSource");
            b
                    && b.get("type") == "p"
                    && (b.get("tracks").bind("add", this._onSourceTrackAdded), b
                            .get("tracks").bind("remove",
                                    this._onSourceTrackRemoved))
        },
        _onSourceTrackAdded : function(a, b, c) {
            var d = this._model.get("sourcePosition");
            c.index <= d && (d++, this._model.set({
                        sourcePosition : d
                    }), this._model.get("playingSource").set({
                        currentPosition : d
                    }))
        },
        _onSourceTrackRemoved : function(a, b, c) {
            var d = this._model.get("sourcePosition");
            c.index <= d && (d--, this._model.set({
                        sourcePosition : d
                    }), this._model.get("playingSource").set({
                        currentPosition : d
                    }))
        },
        queueSource : function(a, b) {
            var c = this;
            b = b || {}, _.defaults(b, {
                        addToFront : !1,
                        maintainCurrentPosition : !1
                    });
            var d = {};
            b.addToFront && (d.at = 0);
            if (this._playerData.queueFullyLoaded() || b.addToFront)
                if (this._isSourceLoaded(a)) {
                    var e = a;
                    b.maintainCurrentPosition || e.unset("currentPosition"), this._model
                            .get("queue").addSource(e, d)
                } else
                    this._loadSource(this._getKey(a), function(a) {
                                c._model.get("queue").addSource(a, d)
                            });
            else
                this._playerData.appendToLoadingQueue(a.get("key"))
        },
        moveQueuedSource : function(a, b) {
            if (a == b)
                return;
            var c = this._model.get("queue").at(a);
            if (!c)
                return;
            this._model.get("queue").remove(c), this._model.get("queue").add(c,
                    {
                        at : b
                    })
        },
        removeFromQueue : function(a) {
            var b = this._model.get("queue").at(a);
            if (!b)
                return;
            this._model.get("queue").remove(b)
        },
        playQueuedSource : function(a, b, c) {
            var d = this._model.get("queue").at(a),
                e = null, f;
            if (!d)
                return;
            f = d.getSource();
            if (f.get("type") != "t") {
                if (this._model.get("shuffle") && !R.isStation(f))
                    this._addShuffleData(f, b), b =
                            f.get("shuffledPositions")[0];
                else if (_.isUndefined(b) || _.isNull(b))
                    b = 0;
                e = R.Models.ListItem.unwrap(f.get("tracks").at(b)), f.set({
                            currentPosition : b
                        }, {
                            silent : !0
                        })
            } else
                e = f;
            if (!e)
                return;
            this._model.get("queue").remove(d), this._model.set({
                        playingSource : f,
                        playingTrack : e,
                        sourcePosition : b
                    }), c()
        },
        setSourcePosition : function(a, b) {
            b = b || R.doNothing;
            var c = this._model.get("playingSource");
            if (c.get("type") == "t")
                return;
            var d = R.Models.ListItem.unwrap(c.get("tracks").at(a));
            if (!d)
                return;
            c.set({
                        currentPosition : a
                    }, {
                        silent : !0
                    });
            var e = {
                playingSource : c,
                playingTrack : d,
                sourcePosition : a
            };
            this._model.set(e), b()
        },
        next : function(a, b) {
            var c = this._model.get("playingSource"),
                d = this._model.get("sourcePosition"),
                e = this._model.get("playingTrack"), f;
            if (!c)
                return;
            if (this._model.get("repeat") == R.player.REPEAT_ONE) {
                a();
                return
            }
            if (this._model.get("repeat") == R.player.REPEAT_ALL
                    && !this._isPlayingStation() && !b
                    && (c.get("type") === "t" || !this._model.get("shuffle"))) {
                d++;
                if (c.get("type") === "t"
                        || d >= R.Utils.value(c.get("tracks").length))
                    d = 0
            } else {
                if (this._model.get("shuffle") && c.has("shuffledPositions")) {
                    var g = _.indexOf(c.get("shuffledPositions"), d);
                    g + 1 < c.get("shuffledPositions").length ? d =
                            c.get("shuffledPositions")[g + 1] : this._model
                            .get("repeat") == R.player.REPEAT_ALL ? d =
                            c.get("shuffledPositions")[0] : c = null
                } else
                    c.get("type") != "t"
                            && d + 1 < R.Utils.value(c.get("tracks").length)
                            ? d++
                            : c = null;
                b && (c = null);
                if (c == null && this._model.get("queue").length) {
                    d = 0;
                    var h = 0;
                    this._model.get("shuffle")
                            && (h =
                                    Math.floor(Math.random()
                                            * this._model.get("queue").length)), f =
                            this._model.get("queue").at(h), c = f.getSource(), this._model
                            .get("queue").remove(f), c.get("type") != "t"
                            && (d = c.get("currentPosition") || 0, c.unset(
                                    "currentPosition", {
                                        silent : !0
                                    }), this._model.get("shuffle")
                                    && this._addShuffleData(c))
                }
            }
            !c
                    && this._model.get("station")
                    && (c = this._model.get("station"), d =
                            c.get("currentPosition") || 0, d > 0
                            && d >= R.Utils.value(c.get("tracks").length)
                            && (d = R.Utils.value(c.get("tracks").length) - 1)), c
                    && c.get("type") != "t" ? (e =
                    R.Models.ListItem.unwrap(c.get("tracks").at(d)), c.set({
                        currentPosition : d
                    }, {
                        silent : !0
                    })) : e = c;
            var i = {};
            c
                    ? (this._model.get("station")
                            && c.get("key") == this._model.get("station")
                                    .get("key") && (i.station = c), d != this._model
                            .get("sourcePosition")
                            && (i.sourcePosition = d), c.get("key") != this._model
                            .get("playingSource").get("key")
                            && (i.playingSource = c), e.get("key") != this._model
                            .get("playingTrack").get("key")
                            && (i.playingTrack = e))
                    : (i.sourcePosition = 0, i.playingSource = null, i.playingTrack =
                            null), this._model.set(i), a()
        },
        previous : function(a) {
            var b = this._model.get("sourcePosition");
            if (!this._model.get("shuffle") && b <= 0
                    || this._model.get("repeat") == R.player.REPEAT_ONE) {
                a();
                return
            }
            var c = this._model.get("playingSource"),
                d = b;
            if (this._model.get("shuffle") && c.has("shuffledPositions")) {
                var e = _.indexOf(c.get("shuffledPositions"), d);
                e - 1 >= 0
                        ? d = c.get("shuffledPositions")[e - 1]
                        : this._model.get("repeat") == R.player.REPEAT_ALL
                                && (d =
                                        c.get("shuffledPositions")[c
                                                .get("shuffledPositions").length
                                                - 1])
            } else
                d--;
            c.set({
                        currentPosition : d
                    }, {
                        silent : !0
                    }), this._model.set({
                        playingSource : c,
                        sourcePosition : d,
                        playingTrack : R.Models.ListItem.unwrap(this._model
                                .get("playingSource").get("tracks").at(d))
                    }), a()
        },
        setStation : function(a) {
            if (!a) {
                var b = {
                    station : null
                };
                this._isPlayingStation()
                        && (b.playingSource = null, b.playingTrack = null, b.playState =
                                R.player.PLAYSTATE_STOPPED, R.player._stop()), this._model
                        .set(b);
                return
            }
            var c = this;
            this._loadSource(this._getKey(a), function(a) {
                        if (c._isPlayingStation()
                                || !c._model.get("playingSource")) {
                            R.player.play({
                                        source : a
                                    });
                            return
                        }
                        var b = {
                            station : a
                        };
                        c._model.set(b)
                    })
        },
        removeTrackFromCurrentSource : function(a) {
            if (!this._isPlayingStation())
                return;
            var b =
                    _.indexOf(this._model.get("playingSource").get("tracks")
                                    .pluck("key"), a);
            if (b == -1)
                return;
            if (b == this._model.get("sourcePosition"))
                return;
            var c = this._model.get("playingSource").clone();
            c.get("tracks").remove(c.get("tracks").at(b));
            var d = {
                playingSource : c,
                station : c
            };
            if (this._model.get("sourcePosition") > b) {
                var e = this._model.get("sourcePosition") - 1;
                c.set({
                            currentPosition : e
                        }), d.sourcePosition = e
            }
            this._model.set(d), this._extendStation(1, !1)
        },
        _isSourceLoaded : function(a) {
            return a
                    && _.isFunction(a.has)
                    && (a.get("type") == "t" || a.has("tracks")
                            && R.Utils.value(a.get("tracks").length) != 0) ? a
                    .has("trackTimes") ? !1 : !0 : !1
        },
        _loadSource : function(a, b) {
            R.Api.request({
                        method : "get",
                        content : {
                            keys : [a],
                            extras : ["tracks"]
                        },
                        success : function(c) {
                            b(R.Utils.convertToModel(c.result[a]))
                        }
                    })
        },
        _getKey : function(a) {
            return _.isString(a) ? a : a.key ? a.key : a.get("key")
        },
        _onShuffleChanged : function() {
            if (this._isPlayingStation())
                return;
            var a = this._model.get("playingSource");
            if (!a || a.get("type") == "t")
                return;
            this._model.get("shuffle") ? this._addShuffleData(a, this._model
                            .get("sourcePosition")) : a
                    .unset("shuffledPositions")
        },
        _addShuffleData : function(a, b) {
            if (R.isStation(a))
                return;
            var c = _.range(R.Utils.value(a.get("tracks").length));
            c = _.shuffle(c), _.isUndefined(b) || (c = _.reject(c, function(a) {
                        return a == b
                    }), c.unshift(b)), a.set({
                        shuffledPositions : c
                    })
        },
        _isPlayingStation : function() {
            return R.isStation(this._model.get("playingSource"))
        },
        _isInEndlessPlay : function() {
            return this._isPlayingStation() ? !0 : !1
        },
        _ENDLESS_STATION_REFRESH_THRESHOLD : 2,
        _onPlayingTrackChanged : function() {
            if (this._isInEndlessPlay()
                    && R.player.isMaster()
                    && this._model.get("sourcePosition") > this._ENDLESS_STATION_REFRESH_THRESHOLD) {
                var a =
                        this._model.get("sourcePosition")
                                - this._ENDLESS_STATION_REFRESH_THRESHOLD;
                this._extendStation(a, !0)
            }
        },
        _extendStation : function(a, b) {
            var c = this;
            if (!this._isPlayingStation())
                return;
            var d = this._model.get("playingSource").get("tracks").pluck("key"),
                e = this._model.get("playingSource").get("key");
            this._currentGenerateStationRequest
                    && (this._currentGenerateStationRequest.abort(), this._currentGenerateStationRequest =
                            null), this._currentGenerateStationRequest =
                    R.Api.request({
                                method : "generateStation",
                                content : {
                                    station_key : this._model
                                            .get("playingSource").get("key"),
                                    exclude_tracks : d,
                                    count : a,
                                    extras : ["tracks"]
                                },
                                success : function(d) {
                                    if (e != c._model.get("playingSource")
                                            .get("key"))
                                        return;
                                    if (b
                                            && c._model.get("sourcePosition") < a
                                                    - 1)
                                        return;
                                    var f =
                                            c._model.get("playingSource")
                                                    .clone(),
                                        g = {
                                            playingSource : f,
                                            station : f
                                        };
                                    if (b) {
                                        f.get("tracks").remove(f.get("tracks")
                                                .get({
                                                            start : 0,
                                                            count : a
                                                        }));
                                        var h =
                                                c._model.get("sourcePosition")
                                                        - a;
                                        g.sourcePosition = h, f.set({
                                                    currentPosition : h
                                                })
                                    }
                                    f.get("tracks").add(d.result.tracks.models), f
                                            .set({
                                                        count : R.Utils
                                                                .value(f
                                                                        .get("tracks").length)
                                                    }), c._model.set(g)
                                },
                                complete : function() {
                                    c._currentGenerateStationRequest = null
                                }
                            })
        }
    }), R.Services._player_klasses || (R.Services._player_klasses = {}), R.Services._player_klasses.Sequencer =
            a
}(), function() {
    function b(b, c) {
        return c = c || [], a[b] = c, function() {
            var a = {
                type : b
            },
                d = _.toArray(arguments);
            if (c.length != d.length) {
                console.error("Arg count mismatch for remote method", b, c, d);
                return
            }
            for (var e = 0; e < c.length; e++) {
                var f = d[e];
                c[e] == "key" && (f = R.player.sequencer._getKey(f)), a[c[e]] =
                        f
            }
            this._sendPubSubCommandMessage(a)
        }
    }
    function c(a) {
        return function(b) {
            _.isObject(b) && (b = R.player.sequencer._getKey(b));
            var c = {
                type : "set",
                key : a,
                value : b
            };
            this._sendPubSubCommandMessage(c)
        }
    }
    var a = {},
        d = function() {
            var a = this;
            _.bindAll(this, "_onPubSubMessage"), R.Services.ready("PubSub",
                    function() {
                        R.pubSub.subscribe(R.pubSub.userTopic(),
                                a._onPubSubMessage)
                    })
        };
    _.extend(d.prototype, Backbone.Events, {
        togglePause : b("togglePause"),
        previous : b("previous"),
        next : b("next"),
        nextSource : b("nextSource"),
        _extraPlaySourceParams : ["waitToAutoPlay", "initialPosition", "index"],
        playSource : function(a) {
            var b = _.pick(a, this._extraPlaySourceParams);
            b.type = "playSource", b.key = R.player.sequencer._getKey(a.source), this
                    ._sendPubSubCommandMessage(b)
        },
        queueSource : b("queueSource", ["key"]),
        setCurrentPosition : c("sourcePosition"),
        setRepeat : c("repeat"),
        setShuffle : c("shuffle"),
        setVolume : c("volume"),
        setStation : c("station"),
        enqueueCurrentSource : b("enqueueCurrentSource"),
        moveQueuedSource : b("moveQueuedSource", ["from", "to"]),
        removeFromQueue : b("removeFromQueue", ["index"]),
        clearQueue : b("clearQueue"),
        playQueuedSource : b("playQueuedSource", ["queueIndex", "sourceIndex"]),
        removeTrackFromCurrentSource : function(a) {
            var b = R.player.playingSource();
            if (!b || !R.isStation(b))
                return;
            var c = _.indexOf(b.get("tracks").pluck("key"), a);
            if (c == -1)
                return;
            this._sendPubSubCommandMessage({
                        type : "removeTrackFromCurrentSource",
                        key : a,
                        index : c
                    })
        },
        _sendPubSubCommandMessage : function(a) {
            var b = {
                event : "remote",
                command : a
            };
            R.pubSub.publish(R.pubSub.userTopic(), b)
        },
        _onPubSubMessage : function(b, c) {
            var d = this;
            if (c.event == "remote" && R.player.isMaster()) {
                var e = c.command,
                    f = e.type;
                switch (f) {
                    case "playSource" :
                        var g = _.pick(e, this._extraPlaySourceParams);
                        g.source = {
                            key : e.key
                        }, R.player.play(g);
                        return;
                    case "queueSource" :
                        var h = {
                            key : e.key
                        };
                        R.player.queue.add(h);
                        return;
                    case "removeTrackFromCurrentSource" :
                        var i = e.key;
                        R.player.removeTrackFromCurrentSource(i);
                        return
                }
                var j = {
                    clearQueue : _.bind(R.player.queue.clear, R.player.queue),
                    enqueueCurrentSource : _.bind(
                            R.player.queue.addPlayingSource, R.player.queue),
                    moveQueuedSource : _.bind(R.player.queue.move,
                            R.player.queue),
                    playQueuedSource : _.bind(R.player.queue.play,
                            R.player.queue),
                    removeFromQueue : _.bind(R.player.queue.remove,
                            R.player.queue),
                    playPause : "togglePause",
                    sourcePosition : "sourcePosition",
                    repeat : "repeat",
                    shuffle : "shuffle",
                    station : "station",
                    volume : "volume"
                },
                    k = [];
                a[f] ? _.each(a[f], function(a, b) {
                            k.push(e[a])
                        }) : f == "set"
                        ? (f = e.key, k.push(e.value))
                        : console.warn("Unexpected command type", f, e), _
                        .isFunction(j[f]) ? j[f].apply(null, k) : (f =
                        j[f] || f, R.player[f].apply(R.player, k))
            }
        }
    }), R.Services._player_klasses || (R.Services._player_klasses = {}), R.Services._player_klasses.Remote =
            d
}(), function() {
    var a = function(a) {
        this._model = a, this._serverSaveStateInFlight = !1
    },
        b = ["sourcePosition", "playingSource", "shuffle", "repeat", "station"];
    _.extend(a.prototype, Backbone.Events, {
        initialize : function(a) {
            _.bindAll(this, "_stateChanged", "_queueChanged",
                    "_onPlayingSourceTracksChanged");
            if (R.Services.TESTING && !R.Services.PLAYER_TESTING)
                return;
            R.storage.preserveIfNoSpace("/player/position"), R.storage
                    .preserveIfNoSpace("/player/volume"), R.storage
                    .preserveIfNoSpace("/player/txid"), R.storage
                    .preserveIfNoSpace("/player/eventReporterSent30s"), R.storage
                    .preserveIfNoSpace("/player/masterPlayerId"), R.storage
                    .preserveIfNoSpace("/player/showTimeLeft"), R.storage
                    .preserveIfNoSpace("/player/playerStateVersion"), this._model
                    .get("isMaster") === R.player.MASTER_ME
                    && !this._getSavedMaster()
                    && R.storage.setItem("/player/masterPlayerId", this._model
                                    .get("playerId"));
            var b = this;
            R.Services.ready("PubSub", function() {
                        R.pubSub.bind("reconnect", function() {
                                    b._loadState()
                                })
                    }), this._loadState(a)
        },
        queueFullyLoaded : function() {
            return this._loadingQueue ? !1 : !0
        },
        appendToLoadingQueue : function(a) {
            this._loadingQueue.push({
                        key : a
                    }), this._saveQueue = !0, this._saveStateToServer()
        },
        playerStateVersionChanged : function(a) {
            if (this._serverSaveStateInFlight)
                return;
            var b = R.storage.getItem("/player/playerStateVersion");
            console.log("checking new playerstate version: ", a,
                    " against old: ", b), a > b && this._loadState()
        },
        queueVersionChanged : function(a) {
            if (this._serverSaveStateInFlight)
                return;
            a > this._queueVersion && this._loadState()
        },
        onStopping : function(a) {
            a && R.storage.removeItem("/player/masterPlayerId")
        },
        _getSavedMaster : function() {
            return R.storage.getItem("/player/masterPlayerId")
        },
        _stateChanged : function(a, c) {
            var d = this._model.changedAttributes();
            if (!d)
                return;
            var e = _.keys(d);
            _.contains(e, "playingSource")
                    && this._ensurePlayingSourceTracksListener(), this
                    ._saveStateLocally(e), !c.fromLoadState
                    && _.intersection(e, b).length !== 0
                    && this._saveStateToServer()
        },
        _ensurePlayingSourceTracksListener : function() {
            this._model.get("playingSource")
                    && this._model.get("playingSource").get("tracks")
                    && (this._model.get("playingSource").get("tracks").off(
                            "add remove", this._onPlayingSourceTracksChanged), this._model
                            .get("playingSource").get("tracks").on(
                                    "add remove",
                                    this._onPlayingSourceTracksChanged))
        },
        _onPlayingSourceTracksChanged : function() {
            this._saveStateLocally(["playingSource"])
        },
        _queueChanged : function() {
            if (this._dontSaveQueue)
                return;
            console.info("saving queue"), this._saveQueue = !0, this
                    ._saveStateToServer()
        },
        _saveStateToServer : _.debounce(function() {
            if (this._model.get("isMaster") !== R.player.MASTER_ME)
                return;
            var a = this,
                b = {},
                c = {
                    shuffle : this._model.get("shuffle"),
                    repeat : this._model.get("repeat")
                };
            this._model.get("playingSource")
                    ? (c.currentSource =
                            this._serializeSource(this._model
                                    .get("playingSource")), this._model
                            .get("playingSource").get("type") != "t"
                            && (c.currentSource.currentPosition =
                                    this._model.get("sourcePosition")))
                    : c.currentSource = null;
            var d = this._model.get("station");
            if (d) {
                var e = this._serializeSource(d);
                d.has("currentPosition")
                        && (e.currentPosition = d.get("currentPosition")), c.station =
                        e
            } else
                c.station = null;
            b.player_state = JSON.stringify(c);
            if (this._saveQueue) {
                this._saveQueue = !1;
                var f = this._model.get("queue").map(function(b) {
                    var c = b.getSource(),
                        d = a._serializeSource(c);
                    return c.get("currentPosition")
                            && (d.currentPosition = c.get("currentPosition")), d
                });
                this._loadingQueue && (f = f.concat(this._loadingQueue)), b.queue =
                        JSON.stringify(f)
            }
            console.log("[PlayerData] saving state to server", b), this._serverSaveStateInFlight =
                    !0, R.Api.request({
                        method : "savePlayerState",
                        content : b,
                        success : function(b) {
                            console.log("saving new playerStateVersion",
                                    b.result.playerStateVersion), R.storage
                                    .setItem("/player/playerStateVersion",
                                            b.result.playerStateVersion), a._queueVersion =
                                    b.result.queueVersion
                        },
                        complete : function() {
                            a._serverSaveStateInFlight = !1, a
                                    .playerStateVersionChanged(R.storage
                                            .getItem("/player/playerStateVersion")), a
                                    .queueVersionChanged(a._queueVersion)
                        }
                    })
        }, 500),
        _saveStateLocally : function(a, b) {
            if (_.intersection(["sourcePosition", "playingSource", "shuffle",
                            "repeat", "station"], a).length !== 0
                    || b) {
                var c = {
                    shuffle : this._model.get("shuffle"),
                    repeat : this._model.get("repeat")
                },
                    d = this._model.get("playingSource");
                d
                        ? (c.currentSource = d.toJSON(), d.has("tracks")
                                && (c.currentSource.tracks = d.get("tracks")), d
                                .get("type") != "t"
                                && (c.currentSource.currentPosition =
                                        this._model.get("sourcePosition")))
                        : c.currentSource = null, this._model.get("station")
                        ? c.station = this._model.get("station").attributes
                        : c.station = null, R.storage.setItem(
                        "/player/playerState", c)
            }
            this._model.get("isMaster") === R.player.MASTER_ME
                    && ((_.include(a, "position") || b)
                            && R.storage.setItem("/player/position",
                                    this._model.get("position")), (_.include(a,
                            "playState") || b)
                            && R.storage.setItem("/player/playState",
                                    this._model.get("playState")), (_.include(
                            a, "volume") || b)
                            && R.storage.setItem("/player/volume", this._model
                                            .get("volume")), (_.include(a,
                            "txid") || b)
                            && R.storage.setItem("/player/txid", this._model
                                            .get("txid")), (_.include(a,
                            "eventReporterSent30s") || b)
                            && R.storage.setItem(
                                    "/player/eventReporterSent30s", this._model
                                            .get("eventReporterSent30s"))), _
                    .include(a, "isMaster")
                    && (this._model.get("isMaster") === R.player.MASTER_ME
                            ? R.storage.setItem("/player/masterPlayerId",
                                    this._model.get("playerId"))
                            : this._getSavedMaster() === this._model
                                    .get("playerId")
                                    && R.storage
                                            .removeItem("/player/masterPlayerId")), _
                    .include(a, "showTimeLeft")
                    && R.storage.setItem("/player/showTimeLeft", this._model
                                    .get("showTimeLeft"))
        },
        _serializeSource : function(a) {
            var b = {
                key : a.get("key")
            };
            if (a.get("frozenTrackList") || R.isStation(a))
                b.tracks = a.get("tracks").map(function(a) {
                            return a.get("key")
                        });
            return a.get("count") && (b.count = a.get("count")), b
        },
        _loadState : function(a) {
            function c(a) {
                var c = R.Utils.convertToModel(a.currentSource),
                    d = null,
                    e = 0;
                c
                        && (c.get("type") != "t"
                                ? (a.currentSource.currentPosition
                                        && (e = a.currentSource.currentPosition), d =
                                        R.Models.ListItem.unwrap(c
                                                .get("tracks").at(e)))
                                : d = c);
                var f;
                R.isStation(c) ? f = c : f = R.Utils.convertToModel(a.station), b._model
                        .set({
                                    playingSource : c,
                                    playingTrack : d,
                                    sourcePosition : e,
                                    repeat : a.repeat,
                                    shuffle : a.shuffle,
                                    station : f
                                }, {
                                    fromLoadState : !0
                                })
            }
            var b = this,
                d = {};
            R.storage.getItem("/player/playerStateVersion")
                    && (d.player_state_version =
                            R.storage.getItem("/player/playerStateVersion")), _
                    .isUndefined(this._queueVersion)
                    || (d.queue_version = this._queueVersion), R.Api.request({
                method : "getPlayerState",
                content : d,
                success : function(d) {
                    var e = !0;
                    if (!_.has(d.result, "playerState")) {
                        console
                                .log("[PlayerData] using local playerstate because it's the same version");
                        try {
                            c(R.storage.getItem("/player/playerState"))
                        } catch (f) {
                            console
                                    .error(
                                            "Could not load local playerState, trying again from the server",
                                            f), R.storage.setItem(
                                    "/player/playerStateVersion", 0), b
                                    ._loadState(a);
                            return
                        }
                        b._getSavedMaster()
                                && b._getSavedMaster() !== b._model
                                        .get("playerId") && (e = !1)
                    } else
                        console.log("[PlayerData] using server playerstate"), e =
                                !1, c(d.result.playerState), R.storage.setItem(
                                "/player/playerStateVersion",
                                d.result.playerState.version);
                    R.player.isReady()
                            || (e && b._loadLocalOnlyState(), b
                                    ._saveStateLocally([], !0)), _.has(
                            d.result, "queue")
                            && (b._queueVersion = d.result.queue.version, b._dontSaveQueue =
                                    !0, b._model.get("queue").reset(), b._dontSaveQueue =
                                    !1, d.result.queue.data.length
                                    && (b._loadingQueue = d.result.queue.data, b
                                            ._loadQueue())), R.player.isReady()
                            || (b._model.bind("change", b._stateChanged), b._model
                                    .get("queue").bind("add", b._queueChanged), b._model
                                    .get("queue").bind("remove",
                                            b._queueChanged), b._model
                                    .get("queue")
                                    .bind("reset", b._queueChanged), b
                                    ._ensurePlayingSourceTracksListener()), a
                            && a(e)
                }
            })
        },
        _loadLocalOnlyState : function() {
            var a = {};
            R.storage.getItem("/player/volume") !== null
                    && (a.volume = R.storage.getItem("/player/volume")), R.storage
                    .getItem("/player/position") !== null
                    && (a.position = R.storage.getItem("/player/position")), R.storage
                    .getItem("/player/playState") !== null
                    && (a.playState = R.storage.getItem("/player/playState")), R.storage
                    .getItem("/player/txid") !== null
                    && (a.txid = R.storage.getItem("/player/txid")), R.storage
                    .getItem("/player/eventReporterSent30s") !== null
                    && (a.eventReporterSent30s =
                            R.storage.getItem("/player/eventReporterSent30s")), R.storage
                    .getItem("/player/showTimeLeft") !== null
                    && (a.showTimeLeft =
                            R.storage.getItem("/player/showTimeLeft")), this._model
                    .set(a)
        },
        _loadQueue : function() {
            var a = this;
            if (!this._loadingQueue)
                return;
            var b = Math.min(this._loadingQueue.length, 5),
                c = _.map(this._loadingQueue.slice(0, b), function(a) {
                            return a.key
                        }),
                d = this._loadingQueue;
            R.Api.request({
                method : "get",
                content : {
                    keys : c,
                    extras : ["tracks"]
                },
                success : function(e) {
                    if (d != a._loadingQueue) {
                        console
                                .log("Ignoring loadQueue result. Queue has changed.");
                        return
                    }
                    var f = [];
                    _.each(c, function(b, c) {
                                var d = e.result[b],
                                    g = a._loadingQueue[c].currentPosition;
                                d
                                        && (g && (d.currentPosition = g), f
                                                .push(R.Utils.convertToModel(d)))
                            }), a._loadingQueue.splice(0, b), a._loadingQueue.length == 0
                            && delete a._loadingQueue, a._dontSaveQueue = !0, a._model
                            .get("queue").addSource(f), a._dontSaveQueue = !1, a
                            ._loadQueue()
                }
            })
        }
    }), R.Services._player_klasses || (R.Services._player_klasses = {}), R.Services._player_klasses.PlayerData =
            a
}(), function() {
    var a = function(a) {
        this._model = a
    };
    _.extend(a.prototype, Backbone.Events, {
                initialize : function(a) {
                    if (R.Services.TESTING && !R.Services.PLAYER_TESTING)
                        return;
                    this._model.set({
                                playingSource : null,
                                playingTrack : null,
                                sourcePosition : 0,
                                repeat : R.player.REPEAT_NONE,
                                shuffle : !1,
                                station : null
                            }), a && a(!1)
                },
                queueFullyLoaded : function() {
                    return !0
                },
                appendToLoadingQueue : function(a) {
                    console.assert(!1, "shouldn't ever be called")
                },
                playerStateVersionChanged : function(a) {
                },
                queueVersionChanged : function(a) {
                },
                onStopping : function(a) {
                }
            }), R.Services._player_klasses || (R.Services._player_klasses = {}), R.Services._player_klasses.SandboxedPlayerData =
            a
}(), function() {
    function c(a) {
        var b = R.perf.createCounter.apply(R.perf, arguments);
        return function() {
            b.increment()
        }
    }
    var a = 200,
        b = function(b) {
            this._model = b, _.bindAll(this, "_onPlayingTrackChanged"), this._model
                    .bind("change:playingTrack", this._onPlayingTrackChanged);
            var c = this;
            _.each( ["_recordSongPlayed", "_recordPaused", "_recordResumed",
                            "_recordSkip", "_recordFinished"], function(b) {
                        c[b] = _.throttle(c[b], a)
                    })
        },
        d = function(a) {
            _.bindAll(this, "_startLoadedTimer", "_stopLoadedTimer",
                    "_countError", "_countStalled", "_countWaiting",
                    "_unbindListeners"), a.on("profiling:loadstart",
                    this._startLoadedTimer), a.on("profiling:loadeddata",
                    this._stopLoadedTimer), this.eventCounters = {}, a.on(
                    "profiling:error", this._countError), a.on(
                    "profiling:stalled", this._countStalled), a.on(
                    "profiling:waiting", this._countWaiting), this
                    ._count("create." + a.type), a.on("destroy",
                    this._unbindListeners), this._audio = a
        };
    _.extend(d.prototype, Backbone.Events, {
        _startLoadedTimer : function() {
            this._stopLoadedTimer(), this._loadedTimer =
                    R.perf.createTimer("player", "loadeddata")
        },
        _stopLoadedTimer : function() {
            this._loadedTimer && this._loadedTimer.stop()
        },
        _countError : function(a, b) {
            this._count(b ? "error." + b : "error")
        },
        _countStalled : function() {
            this._count("stalled")
        },
        _countWaiting : function() {
            this._count("waiting")
        },
        _count : function(a) {
            _.has(this.eventCounters, a)
                    || (this.eventCounters[a] = c("player", a)), this.eventCounters[a]()
        },
        _unbindListeners : function() {
            this._audio.off("profiling:loadstart", this._startLoadedTimer), this._audio
                    .off("profiling:loadeddata", this._stopLoadedTimer), this._audio
                    .off("profiling:error", this._countError), this._audio.off(
                    "profiling:stalled", this._countStalled), this._audio.off(
                    "profiling:waiting", this._countWaiting), this._audio.off(
                    "destroy", this.unbindListeners), this._audio = null
        }
    }), _.extend(b.prototype, Backbone.Events, {
        seek : function(a, b) {
            this._recordPaused(a), this._recordResumed(b)
        },
        recordPlay : function() {
            if (this._txid())
                return;
            this._recordSongPlayed()
        },
        record30s : function() {
            this._record30s()
        },
        recordSkip : function(a) {
            this._recordSkip(a), this._onPlayingTrackChanged()
        },
        recordPause : function(a) {
            this._recordPaused(a)
        },
        recordResumed : function(a) {
            this._recordResumed(a)
        },
        recordFinished : function() {
            this._recordFinished(), this._onPlayingTrackChanged()
        },
        monitorStreaming : function(a) {
            var b = this;
            R.Services.ready("Perf", function() {
                        b.streamingMonitor = new d(a)
                    })
        },
        _updateFreeInfo : function(a) {
            if (a && a.result && a.result.free) {
                var b = a.result.free;
                R.currentUser.set({
                            freeRemaining : b.remaining,
                            freeRefreshDate : b.refreshes,
                            isFree : b.isFree,
                            isFreeExpired : b.isFreeExpired
                        })
            }
        },
        _txid : function() {
            return this._model.has("txid")
                    ? this._model.get("txid")
                    : undefined
        },
        _onPlayingTrackChanged : function(a, b, c) {
            this._model.unset("txid", c), this._model.unset(
                    "eventReporterSent30s", c), this._gettingTxid = !1
        },
        _recordSongPlayed : function() {
            if (this._gettingTxid)
                return;
            var a = {
                key : this._model.get("playingTrack").get("key")
            };
            this._model.get("playingSource").get("type") != "t"
                    && (a.source = this._model.get("playingSource").get("key")), this._gettingTxid =
                    !0;
            var b = this;
            R.Api.request({
                        method : "addStartEvent",
                        content : a,
                        success : function(c) {
                            if (a.key != b._model.get("playingTrack")
                                    .get("key"))
                                return;
                            b._updateFreeInfo(c), b._gettingTxid = !1, b._model
                                    .set({
                                                txid : c.result.txid
                                            })
                        }
                    })
        },
        _record30s : function() {
            if (!this._txid()) {
                console.info("[EventReporter] No valid txid for _record30s");
                return
            }
            if (this._model.get("eventReporterSent30s"))
                return;
            this._model.set({
                        eventReporterSent30s : !0
                    }), R.Api.request({
                        method : "addTimedPlayInformation",
                        content : {
                            txid : this._txid()
                        },
                        success : _.bind(this._updateFreeInfo, this)
                    })
        },
        _recordFinished : function() {
            if (!this._txid()) {
                console
                        .info("[EventReporter] No valid txid for _recordFinished");
                return
            }
            R.Api.request({
                        method : "addFinishEvent",
                        content : {
                            txid : this._txid()
                        }
                    })
        },
        _recordSkip : function(a) {
            if (!this._txid()) {
                console.info("[EventReporter] No valid txid for _recordSkip");
                return
            }
            R.Api.request({
                        method : "addSongSkippedTime",
                        content : {
                            txid : this._txid(),
                            time : a
                        },
                        success : _.bind(this._updateFreeInfo, this)
                    })
        },
        _recordPaused : function(a) {
            if (!this._txid()) {
                console.info("[EventReporter] No valid txid for _recordPaused");
                return
            }
            R.Api.request({
                        method : "addPauseEvent",
                        content : {
                            txid : this._txid(),
                            time : a
                        }
                    })
        },
        _recordResumed : function(a) {
            if (!this._txid()) {
                console
                        .info("[EventReporter] No valid txid for _recordResumed");
                return
            }
            R.Api.request({
                        method : "addResumeEvent",
                        content : {
                            txid : this._txid(),
                            time : a
                        }
                    })
        }
    }), R.Services._player_klasses || (R.Services._player_klasses = {}), R.Services._player_klasses.EventReporter =
            b
}(), function() {
    function a(a, b) {
        return function() {
            this._callRemote(a, arguments)
                    || (console.log("[Player] calling ", a), b.apply(this,
                            arguments))
        }
    }
    function b(a, b) {
        var c = this;
        this._player = a, this._collection = b, this._collection.bind("all",
                function(a) {
                    var b = _.toArray(arguments);
                    if (a === "add" || a === "remove")
                        b[1] = b[1].getSource();
                    c.trigger.apply(c, b)
                })
    }
    function c(a, b) {
        return function() {
            this._player._callRemote(a, arguments)
                    || (console.log("[Queue] calling ", a), b.apply(this,
                            arguments))
        }
    }
    function d(a, b, c) {
        _.each(c, function(c, d) {
                    console.assert(!(d in a), "[makeAccessorsForModel] " + d
                                    + " should be available"), a[d] =
                            function(a) {
                                if (a === undefined)
                                    return b.get(d);
                                _.isFunction(c) ? c.call(this, a) : c ? b.set(
                                        d, a) : console.error(d
                                        + " is read-only")
                            }
                })
    }
    R.Models.Player = R.Model.extend({
                defaults : {
                    repeat : 0,
                    playState : 0,
                    shuffle : !1,
                    mute : !1,
                    volume : 1,
                    position : 0,
                    isMaster : 0,
                    playerId : "_web_" + Bujagali.Utils.randomID(),
                    showTimeLeft : !1,
                    sourcePosition : 0,
                    playingSource : null,
                    playingTrack : null
                }
            }, {
                PLAYSTATE_PAUSED : 0,
                PLAYSTATE_PLAYING : 1,
                PLAYSTATE_STOPPED : 2,
                PLAYSTATE_BUFFERING : 3,
                PLAYSTATE_OFFLINE : 4,
                REPEAT_NONE : 0,
                REPEAT_ONE : 1,
                REPEAT_ALL : 2,
                MASTER_UNKNOWN : 0,
                MASTER_ME : 1,
                MASTER_ELSEWHERE : 2
            }), R.Services.register("Player", {
        isGlobal : !0,
        PLAYSTATE_PAUSED : 0,
        PLAYSTATE_PLAYING : 1,
        PLAYSTATE_STOPPED : 2,
        PLAYSTATE_BUFFERING : 3,
        PLAYSTATE_OFFLINE : 4,
        REPEAT_NONE : 0,
        REPEAT_ONE : 1,
        REPEAT_ALL : 2,
        MASTER_UNKNOWN : 0,
        MASTER_ME : 1,
        MASTER_ELSEWHERE : 2,
        onInitialized : function() {
            var a = this;
            this._model = new R.Models.Player, this._model.set({
                        playingSource : new Backbone.Model,
                        station : new Backbone.Model,
                        queue : new R.Models.SourceCollection
                    }), this._model.bind("all", function() {
                        a.trigger.apply(a, arguments)
                    }), d(this, this._model, {
                        playingSource : !1,
                        playingTrack : !1,
                        playState : !1,
                        position : this._seek,
                        repeat : this._setRepeat,
                        showTimeLeft : !0,
                        shuffle : this._setShuffle,
                        sourcePosition : this._setCurrentPosition,
                        station : this._setStation,
                        volume : this._setVolume
                    }), _.bindAll(this, "_onPubSubMessage",
                    "_onRemoteMessageNeeded", "_masterPlayerCapsIdentifier"), this._model
                    .bind("change:playState", this._onRemoteMessageNeeded), this._model
                    .bind("change:volume", _.debounce(
                                    this._onRemoteMessageNeeded, 200))
        },
        onStarted : function(a) {
            this.queue = new b(this, this._model.get("queue")), R.Services.Player =
                    this, this.model = this._model, this.playPause =
                    this.togglePause, this.playSource = this.play, this.seek =
                    this._seek, this.setRepeat = this._setRepeat, this.setShuffle =
                    this._setShuffle, this.setCurrentPosition =
                    this._setCurrentPosition, this.setStation =
                    this._setStation, this.setVolume = this._setVolume, this.clearQueue =
                    _.bind(this.queue.clear, this.queue), this.enqueueCurrentSource =
                    _.bind(this.queue.addPlayingSource, this.queue), this.moveQueuedSource =
                    _.bind(this.queue.move, this.queue), this.playQueuedSource =
                    _.bind(this.queue.play, this.queue), this.queueSource =
                    _.bind(this.queue.add, this.queue), this.removeFromQueue =
                    _.bind(this.queue.remove, this.queue), this._readyCallback =
                    a, this._isSandboxed()
                    ? this.data =
                            new R.Services._player_klasses.SandboxedPlayerData(this._model)
                    : this.data =
                            new R.Services._player_klasses.PlayerData(this._model), this.remote =
                    new R.Services._player_klasses.Remote(this._model), this.sequencer =
                    new R.Services._player_klasses.Sequencer(this._model,
                            this.data), this.eventReporter =
                    new R.Services._player_klasses.EventReporter(this._model);
            var c = this;
            R.Services.ready("AudioFactory", function() {
                c.data.initialize(function(a) {
                            a
                                    && (c.isMaster() || c.noKnownMaster())
                                    && c._model.get("playState") == c.PLAYSTATE_PLAYING
                                    && c._play(!0), c._readyCallback()
                        }), c._timerInterval = setInterval(function() {
                            c._timerTick()
                        }, 1e3)
            }), R.Services.ready("PubSub", function() {
                R.pubSub.subscribe(R.pubSub.userTopic(), c._onPubSubMessage), R.pubSub
                        .subscribe(c._getPlayerControlTopic(),
                                c._onPubSubMessage), R.pubSub.bind("reconnect",
                        c._queryForMaster, c), c._queryForMaster()
            }), R.Services.ready("OfflineMonitor", function() {
                        R.offlineMonitor.bind("change", c._onOfflineChange, c)
                    }), R.currentUser.bind("connectionsChanged",
                    c._onConnectionsChanged, c)
        },
        onStopping : function() {
            if (!this.isMaster())
                return;
            R.pubSub.publish(this._getPlayerControlTopic(), {
                        event : "masterShutdown",
                        position : this._model.get("position")
                    }), this.data.onStopping(!0), R.pubSub.unbind("reconnect",
                    this._queryForMaster, this), R.offlineMonitor.unbind(
                    "change", this._onOfflineChange, this), R.currentUser
                    .unbind("connectionsChanged", this._onConnectionsChanged,
                            this)
        },
        isPlaying : function() {
            return this._model.get("playState") === this.PLAYSTATE_PLAYING
        },
        isMaster : function() {
            return this._model.get("isMaster") === this.MASTER_ME
        },
        isNotMaster : function() {
            return this._model.get("isMaster") === this.MASTER_ELSEWHERE
        },
        noKnownMaster : function() {
            return this._model.get("isMaster") === this.MASTER_UNKNOWN
        },
        _callRemote : function(a, b) {
            if (this.isNotMaster()) {
                if (this.isRemoteControllable())
                    return this.remote[a].apply(this.remote, b), !0;
                this.startMasterTakeover()
            } else
                this.noKnownMaster() && this.startMasterTakeover();
            return !1
        },
        play : function(a) {
            var b = this;
            if (_.isUndefined(a)) {
                this._model.get("playState") == this.PLAYSTATE_PAUSED
                        && this.togglePause();
                return
            }
            if (this._callRemote("playSource", arguments))
                return;
            console.log("[Player] calling play"), this._stop(), this.sequencer
                    .playSource(a, function() {
                                b._stop(), a.waitToAutoPlay && b._model.set({
                                            waitToAutoPlay : a.waitToAutoPlay
                                        }), a.initialPosition && b._model.set({
                                            position : a.initialPosition
                                        }), b._play(!0)
                            })
        },
        pause : function() {
            this._model.get("playState") != this.PLAYSTATE_PAUSED
                    && this.togglePause()
        },
        togglePause : a("togglePause", function() {
                    this._model.get("playState") == this.PLAYSTATE_PAUSED
                            ? this._play(!0)
                            : this._pause()
                }),
        _seek : function(a) {
            var b = a;
            a = Math.max(0, parseInt(a, 10));
            if (!_.isFinite(a)) {
                console.error("[player] invalid position: " + b);
                return
            }
            if (this._model.get("playState") == this.PLAYSTATE_PAUSED
                    || this._model.get("playState") == this.PLAYSTATE_PLAYING)
                this._audio
                        ? (this.eventReporter.seek(this._model.get("position"),
                                a), this._audio.seek(a))
                        : (this._model.set({
                                    position : a
                                }), this._play(!0))
        },
        _setVolume : a("setVolume", function(a) {
                    if (!_.isFinite(a)) {
                        console.error("[player] invalid volume: " + a);
                        return
                    }
                    var b = Math.max(0, Math.min(a, 1));
                    this._model.set({
                                volume : b
                            }), this._audio && this._audio.volume(b)
                }),
        previous : a("previous", function() {
                    var a = this;
                    if (this._model.get("position") > 2) {
                        this._audio ? this._audio.seek(0) : (this._model.set({
                                    position : 0
                                }), this._play(!0));
                        return
                    }
                    a._stop(), this.sequencer.previous(function() {
                                a._stop(), a._play(!0)
                            })
                }),
        next : a("next", function() {
                    this._next(!0)
                }),
        nextSource : a("nextSource", function() {
                    var a = this;
                    a._stop(), this.sequencer.next(function() {
                                a._stop(), a._play(!0)
                            }, !0)
                }),
        _setCurrentPosition : a("setCurrentPosition", function(a) {
            var b = this;
            if (!_.isFinite(a) || a < 0 || Math.floor(a) !== a) {
                console.error("[player] invalid sourcePosition: " + a);
                return
            }
            var c = this._model.get("playingSource");
            if (!c) {
                console
                        .error("[player] can't set sourcePosition if no playingSource");
                return
            }
            if (c.get("type") === "t") {
                a !== 0
                        && console
                                .error("[player] sourcePosition out of range: "
                                        + a);
                return
            }
            if (!c.get("tracks").at(a)) {
                console.error("[player] sourcePosition out of range: " + a);
                return
            }
            this._stop(), this._model.set({
                        playState : this.PLAYSTATE_PLAYING
                    }), this.sequencer.setSourcePosition(a, function() {
                        b._stop(), b._play(!0)
                    })
        }),
        _setStation : a("setStation", function(a) {
                    this.sequencer.setStation(a)
                }),
        removeTrackFromCurrentSource : a("removeTrackFromCurrentSource",
                function(a) {
                    this.sequencer.removeTrackFromCurrentSource(a)
                }),
        _setRepeat : a("setRepeat", function(a) {
                    if (a !== this.REPEAT_NONE && a !== this.REPEAT_ONE
                            && a !== this.REPEAT_ALL) {
                        console.error("[player] invalid repeat: " + a);
                        return
                    }
                    this._model.set({
                                repeat : a
                            })
                }),
        _setShuffle : a("setShuffle", function(a) {
                    this._model.set({
                                shuffle : R.Utils.bool(a)
                            })
                }),
        toggleShuffle : function() {
            this.shuffle(!this.shuffle())
        },
        playingTrackWasMovedTo : function(a) {
            this._model.set({
                        sourcePosition : a
                    })
        },
        startMasterTakeover : function() {
            this._model.set({
                        isMaster : this.MASTER_ME,
                        masterPlayerId : this._model.get("playerId")
                    }), this._sendActivePlayer(), this._model.set("playState",
                    this.PLAYSTATE_PAUSED)
        },
        isRemoteControllable : function() {
            if (this._model.get("isMaster") != this.MASTER_ELSEWHERE
                    || this._isSandboxed())
                return !1;
            var a = this,
                b = R.currentUser.getCapability("player.canRemote", {
                            filter : this._masterPlayerCapsIdentifier
                        });
            return b
        },
        canRemoteControlVolume : function() {
            if (this._model.get("isMaster") != this.MASTER_ELSEWHERE)
                return;
            return !R.currentUser.getCapability("player.remote.noVolume", {
                        filter : this._masterPlayerCapsIdentifier
                    })
        },
        _masterPlayerCapsIdentifier : function(a) {
            return a.player
                    && a.player.name == this._model.get("masterPlayerId")
                    ? !0
                    : !1
        },
        _onRemoteMessageNeeded : function() {
            this.isReady() && this.isMaster()
                    && !this._model.get("losingMaster")
                    && this._sendActivePlayer()
        },
        _onPubSubMessage : function(a, b) {
            var c = this;
            switch (b.event) {
                case "playerStateChanged" :
                    this.data.playerStateVersionChanged(b.version);
                    break;
                case "queueChanged" :
                    this.data.queueVersionChanged(b.version);
                    break;
                case "activePlayer" :
                case "masterPlayer" :
                    this._model.set("masterPlayerId", b.name);
                    if (b.name != this._model.get("playerId")) {
                        this.isMaster()
                                && (this._model.set("losingMaster", !0), this
                                        .isPlaying()
                                        && (this._pause(), this
                                                .trigger("playingElsewhere")), this._model
                                        .unset("losingMaster")), this
                                ._destroyAudio(), this._model.set("isMaster",
                                this.MASTER_ELSEWHERE), this._isSandboxed()
                                || (_.has(b, "playState")
                                        && this._model.set("playState",
                                                b.playState), _
                                        .has(b, "volume")
                                        && this._model.set("volume", b.volume)), this._checkForMasterTimer
                                && (clearTimeout(this._checkForMasterTimer), delete this._checkForMasterTimer), this._becomeMasterTimer
                                && (clearTimeout(this._becomeMasterTimer), delete this._becomeMasterTimer);
                        var d = (270 + parseInt(Math.random() * 60)) * 1e3;
                        this._checkForMasterTimer = setTimeout(function() {
                            if (c.isMaster())
                                return;
                            c._queryForMaster(), c._becomeMasterTimer =
                                    setTimeout(function() {
                                                c._model.set({
                                                            isMaster : c.MASTER_UNKNOWN
                                                        }), c.isPlaying()
                                                        && c._pause()
                                            }, 1e4)
                        }, d)
                    }
                    break;
                case "masterQuery" :
                    this.isMaster() && this._sendActivePlayer();
                    break;
                case "masterShutdown" :
                    this._onMasterShutdown(), _.has(b, "position")
                            && this._model.set("position", b.position)
            }
        },
        _onOfflineChange : function(a) {
            a
                    || (this._pause(), this._model.set("isMaster",
                            this.MASTER_UNKNOWN))
        },
        _onConnectionsChanged : function() {
            var a = R.currentUser.getCapability("player.name", {
                        filter : this._masterPlayerCapsIdentifier
                    });
            _.isUndefined(a) && !this.isMaster() && this._onMasterShutdown()
        },
        _onMasterShutdown : function() {
            this._model.set({
                        playState : this.PLAYSTATE_PAUSED
                    }), this._model.set("isMaster", this.MASTER_UNKNOWN)
        },
        _timerTick : function() {
            if (this._model.get("playState") == this.PLAYSTATE_PLAYING
                    && this._audio && this._audio.processTimerTick) {
                var a = parseInt(this._audio.position());
                this._model.set({
                            position : a
                        }), a > 1 && this.eventReporter.recordPlay(), a > 30
                        && this.eventReporter.record30s()
            }
        },
        _play : function(a) {
            this._model.set({
                        isMaster : this.MASTER_ME,
                        masterPlayerId : this._model.get("playerId")
                    });
            if (this._model.get("playState") == this.PLAYSTATE_PAUSED) {
                this.eventReporter.recordResumed(this._model.get("position")), this._model
                        .set({
                                    playState : this.PLAYSTATE_PLAYING
                                });
                if (this._audio) {
                    a && R.Api.request({
                                method : "updateActivePlayer",
                                content : {
                                    deviceid : this._model.get("playerId"),
                                    manual : "true"
                                }
                            }), this._audio.play();
                    return
                }
            }
            this._model.get("playingSource")
                    && this
                            ._getPlaybackInfo(this._model.get("playingTrack"),
                                    a)
        },
        _pause : function() {
            this._model.get("playState") == this.PLAYSTATE_PLAYING
                    && (this.eventReporter.recordPause(this._model
                            .get("position")), this._model.set({
                                playState : this.PLAYSTATE_PAUSED
                            }), this._audio && this._audio.pause())
        },
        _next : function(a) {
            var b = this;
            b._stop(), this.sequencer.next(function() {
                        b._stop(), b._play(a)
                    })
        },
        _stop : function() {
            this.eventReporter.recordSkip(this._model.get("position")), this
                    ._destroyAudio(), this._model.set({
                        position : 0
                    }), this._model.unset("waitToAutoPlay"), this._model
                    .get("playingSource")
                    || this._model.set({
                                playState : this.PLAYSTATE_STOPPED
                            })
        },
        _destroyAudio : function() {
            this._audio && (this._audio.destroy(), this._audio = null)
        },
        _queryForMaster : function() {
            R.pubSub.publish(this._getPlayerControlTopic(), {
                        event : "masterQuery"
                    })
        },
        _sendActivePlayer : function() {
            var a = {
                event : "masterPlayer",
                name : this._model.get("playerId")
            };
            this._isSandboxed()
                    || (a.playState = this._model.get("playState"), a.volume =
                            this._model.get("volume")), R.pubSub.publish(this
                            ._getPlayerControlTopic(), a)
        },
        _getPlaybackInfo : function(a, b) {
            b || (b = !1);
            if (!a)
                return;
            var c = this;
            this._model.set({
                        playState : R.Models.Player.PLAYSTATE_PLAYING
                    }), R.Api.request({
                method : "getPlaybackInfo",
                content : {
                    key : a.get("key"),
                    manualPlay : b,
                    type : R.Services.AudioFactory.audioType,
                    playerName : this._model.get("playerId"),
                    requiresUnlimited : R.playerRequiresUnlimitedToStream()
                },
                success : function(d) {
                    if (d.result.serror == "Location Changed") {
                        console
                                .log("[Player] Playing elsewhere triggered by Location Changed response from server"), c._model
                                .set({
                                            playState : c.PLAYSTATE_PAUSED
                                        }), c.trigger("playingElsewhere");
                        return
                    }
                    if (_.isNull(d.result.surl) && d.result.serror) {
                        c._next(b);
                        return
                    }
                    c._model.set({
                                isMaster : c.MASTER_ME,
                                masterPlayerId : c._model.get("playerId")
                            });
                    if (a.get("key") != c._model.get("playingTrack").get("key"))
                        return;
                    var e = {
                        streamUrl : d.result.surl,
                        streamHost : d.result.streamHost,
                        streamApp : d.result.streamApp
                    };
                    c._destroyAudio(), c._model.get("playingTrack").set(
                            "duration", d.result.duration), c._audio =
                            R.Services.AudioFactory.create(e), c.eventReporter
                            .monitorStreaming(c._audio), c._audio.bind("ready",
                            function f() {
                                if (a.get("key") != c._model
                                        .get("playingTrack").get("key"))
                                    return;
                                c._audio.volume(c._model.get("volume")), c._model
                                        .get("playState") == c.PLAYSTATE_PLAYING
                                        && c._audio.play(c._model
                                                .get("position")), c._audio.processTimerTick =
                                        !0, c._audio.unbind("ready", f)
                            }), c._audio.bind("error", function(a) {
                        var b = "FLASH";
                        try {
                            b = a.target.error.code
                        } catch (d) {
                        }
                        console.error("[Player] Audio error occurred", b), c
                                ._destroyAudio(), c._model.get("playState") == c.PLAYSTATE_PLAYING
                                && c._play(!1)
                    }), c._audio.bind("end", function() {
                                c.eventReporter.recordFinished();
                                var a = c._model.get("waitToAutoPlay");
                                c._stop();
                                if (c._model.get("playState") == c.PLAYSTATE_PLAYING) {
                                    if (a) {
                                        _.delay(function() {
                                                    c._next()
                                                }, a * 1e3);
                                        return
                                    }
                                    c._next(!1)
                                }
                            })
                }
            })
        },
        _getPlayerControlTopic : function() {
            return R.currentUser.get("key") + "/player"
        },
        _isSandboxed : function() {
            return this.options.sandbox || R.currentUser.isAnonymous()
        },
        getCaps : function() {
            return {
                player : {
                    canRemote : !this._isSandboxed(),
                    name : this._model.get("playerId")
                }
            }
        }
    }), _.extend(b.prototype, Backbone.Events, {
                data : function() {
                    return this._collection
                },
                length : function() {
                    return this._collection.length
                },
                has : function(a) {
                    return _.isObject(this._collection.find(function(b) {
                                return b.getSource().get("key") === a
                            }))
                },
                at : function(a) {
                    return this._collection.at(a).getSource()
                },
                clear : c("clearQueue", function() {
                            this._collection.reset()
                        }),
                addPlayingSource : c("enqueueCurrentSource", function() {
                            var a = this._player.playingSource();
                            if (!a || R.isStation(a))
                                return;
                            this._player._stop(), this._player.sequencer
                                    .queueSource(a, {
                                                addToFront : !0,
                                                maintainCurrentPosition : !0
                                            })
                        }),
                move : c("moveQueuedSource", function(a, b) {
                            this._player.sequencer.moveQueuedSource(a, b)
                        }),
                play : c("playQueuedSource", function(a, b) {
                            var c = this;
                            this._player.sequencer.playQueuedSource(a, b,
                                    function() {
                                        c._player._stop(), c._player._play(!0)
                                    })
                        }),
                add : c("queueSource", function(a) {
                            this._player.sequencer.queueSource(a)
                        }),
                remove : c("removeFromQueue", function(a) {
                            this._player.sequencer.removeFromQueue(a)
                        })
            }), R.playerRequiresUnlimitedToStream = function() {
        return R.isMobile || R.isTv
    }
}(), function() {
    R.Services.register("FacebookMusic", {
        onInitialized : function() {
            _.bindAll(this)
        },
        onStarted : function(a) {
            var b = this;
            R.Services.ready("Player", function() {
                        b._fbInited = !1, b.onHasFBChanged(), R.currentUser
                                .bind("change:has_facebook", b.onHasFBChanged), a()
                    })
        },
        onHasFBChanged : function() {
            R.currentUser.get("has_facebook") ? this.initFB() : this._fbInited
                    && this.destroyFB()
        },
        initFB : function() {
            $("#fb-root").length === 0
                    && $("body").prepend('<div id="fb-root" />'), R.fbInit(!1,
                    this._facebookReady)
        },
        _facebookReady : function() {
            this._oldState = {
                playing : R.player.isPlaying()
            };
            var a = R.player.playingSource();
            a && a.get("url")
                    && (this._oldState.song = R.Utils.fullUrl(a.get("url")));
            var b = $("#fb-root object");
            b.attr({
                        wmode : "transparent",
                        height : "1px",
                        width : "1px"
                    }), b.css({
                        position : "absolute",
                        top : "-1px"
                    }), window.FB.Event.subscribe("fb.music.PLAY",
                    this.onFBMusicPlay), window.FB.Event.subscribe(
                    "fb.music.RESUME", this.onFBMusicResume), window.FB.Event
                    .subscribe("fb.music.PAUSE", this.onFBMusicPause), window.FB.Event
                    .subscribe("fb.music.STATUS", this.onFBMusicStatus), R.player
                    .bind("change:playState", this.onPlayEvent), R.player.bind(
                    "change:playingTrack", this.onPlayEvent), R.player.bind(
                    "change:position", this.onPositionChanged), this._fbInited =
                    !0
        },
        onStopping : function() {
            this._fbInited && this.destroyFB()
        },
        onPositionChanged : function() {
            var a = R.player.position(), b, c;
            !this._lastSavedPosition || !this._lastSavedPositionTime
                    ? c = !0
                    : (b = (new Date - this._lastSavedPositionTime) / 1e3, Math
                            .abs(b - (a - this._lastSavedPosition)) > 1
                            && (c = !0)), c
                    && (this._lastSavedPosition = a, this._lastSavedPositionTime =
                            new Date, this.sendFBStatus(!1))
        },
        destroyFB : function() {
            this._oldState = {}, window.FB.Event.unsubscribe("fb.music.PLAY",
                    this.onFBMusicPlay), window.FB.Event.unsubscribe(
                    "fb.music.RESUME", this.onFBMusicResume), window.FB.Event
                    .unsubscribe("fb.music.PAUSE", this.onFBMusicPause), window.FB.Event
                    .unsubscribe("fb.music.STATUS", this.onFBMusicStatus), R.player
                    .unbind(
                            "change:playState change:playingTrack change:position",
                            this.onPlayEvent), $("#fb-root").remove(), this._fbInited =
                    !1
        },
        playSource : function(a) {
            a.waitToAutoPlay || R.player.queue.addPlayingSource(), R.player
                    .play(a)
        },
        onFBMusicPlay : function(a, b) {
            var c = "",
                d = [],
                e = {},
                f = function(a) {
                    return new Backbone.Model({
                                key : a.get("key")
                            })
                },
                g = function(a) {
                    return function(b) {
                        var c = b.get("tracks"),
                            d = new Backbone.Model({
                                        key : b.get("key")
                                    });
                        if (!a || !c || !c.length)
                            return d;
                        var f = 0;
                        return c.find(function(b, c) {
                                    return a.indexOf(b.get("url")) === -1
                                            ? !1
                                            : (f = c, !0)
                                }), e.index = f, d
                    }
                };
            if (a.song) {
                c = a.song;
                var h = a.album || a.playlist;
                h && (c = h, d = ["tracks"], f = g(a.song))
            } else
                a.playlist ? c = a.playlist : a.album
                        ? c = a.album
                        : a.musician
                                && (c = a.musician, d = ["collectionKey"], f =
                                        function(a) {
                                            var b = a.get("type"),
                                                c = new Backbone.Model({
                                                            key : a.get("key")
                                                        });
                                            if (b === "s") {
                                                var d = a.get("collectionKey");
                                                d && c.set({
                                                            key : d
                                                        })
                                            } else if (b === "r") {
                                                var e = a.get("topSongsKey");
                                                e && c.set({
                                                            key : e
                                                        })
                                            }
                                            return c
                                        });
            if (!c || c.length === 0)
                return;
            var i = new R.Models.ObjectModel({
                        url : decodeURIComponent(c)
                    }, {
                        extras : d
                    }),
                j = this;
            i.fetch({
                        success : function(c, d) {
                            c = f(c), e.source = c, a.listen_with_friends
                                    && (e.waitToAutoPlay = 10), a.offset
                                    && (e.initialPosition = a.offset), b
                                    && b(e), j.playSource(e)
                        }
                    })
        },
        onFBMusicResume : function(a) {
            R.player._play()
        },
        onFBMusicPause : function(a) {
            R.player._pause()
        },
        onFBMusicStatus : function(a) {
            this.sendFBStatus(!0)
        },
        onPlayEvent : function(a) {
            this.sendFBStatus(!1)
        },
        sendFBStatus : function(a) {
            var b = R.currentUser;
            if (!b.get("has_facebook"))
                return;
            var c = R.player.isPlaying(),
                d = !b.get("prefs").get("fbScrobble"),
                e = {
                    playing : c,
                    user_id : b.get("facebookId"),
                    post_open_graph : {
                        open_graph_disabled : d,
                        private_session : !1
                    }
                },
                f = R.player.playingTrack();
            f
                    && (e.song = R.Utils.fullUrl(f.get("url")), c
                            && (e.expires_in =
                                    Math
                                            .max(
                                                    0,
                                                    Math
                                                            .floor( f
                                                                            .get("duration")
                                                                            - R.player
                                                                                    .position()))));
            if (!a && _.isEqual(e, this._oldState))
                return;
            this._oldState = e;
            try {
                window.FB.Music.send("STATUS", e)
            } catch (g) {
                console.error("Error sending status to Facebook music bridge")
            }
        },
        isUsable : function() {
            return !R.currentUser.isAnonymous()
        }
    })
}(), function() {
    var a = R.Model.extend({
        initialize : function() {
            R.Model.prototype.initialize.apply(this, arguments), this.set({
                        key : this.get("user").get("key"),
                        blocks : new Backbone.Collection([])
                    }), this.get("user").trackField("lastSongPlayed"), this
                    .get("user").bind("change:lastSongPlayed",
                            this._onLastSongPlayedChange, this), this
                    ._onLastSongPlayedChange()
        },
        addMessage : function(a, c) {
            var d = R.currentUser;
            a == this.get("key") && (d = this.get("user"));
            var e = this.get("blocks");
            if (e.length !== 0 && e.last().get("key") == d.get("key")
                    && e.last() instanceof b)
                e.at(e.length - 1).addMessage(c);
            else {
                var f = new b({
                            user : d
                        });
                e.add(f), f.addMessage(c)
            }
            this.trigger("newMessage")
        },
        sendMessage : function(a) {
            R.chat.sendMessage(this, a), this._typingNotificationTimeout
                    && (clearTimeout(this._typingNotificationTimeout), delete this._typingNotificationTimeout)
        },
        sendTypingNotification : function() {
            if (!this._typingNotificationTimeout) {
                R.chat.sendTypingNotification(this.get("key"));
                var a = this;
                this._typingNotificationTimeout = setTimeout(function() {
                            delete a._typingNotificationTimeout
                        }, 15e3)
            }
        },
        receiveTypingNotification : function() {
            this.trigger("typing")
        },
        _onLastSongPlayedChange : function() {
            this.get("user").has("lastSongPlayed")
                    && (this.get("blocks").length !== 0
                            && this.get("blocks").last() instanceof c
                            ? this.get("blocks").last().set("track",
                                    this.get("user").get("lastSongPlayed"))
                            : this.get("blocks").add(new c({
                                        user : this.get("user"),
                                        track : this.get("user")
                                                .get("lastSongPlayed")
                                    })), this.trigger("newMessage", !0))
        }
    }),
        b = R.Model.extend({
                    type : "message",
                    initialize : function() {
                        R.Model.prototype.initialize.apply(this, arguments), this
                                .set({
                                            key : this.get("user").get("key"),
                                            messages : new Backbone.Collection([]),
                                            date : new Date
                                        })
                    },
                    addMessage : function(a) {
                        this.get("messages").add(new Backbone.Model({
                                    message : a
                                }))
                    }
                }),
        c = R.Model.extend({
                    type : "listening",
                    initialize : function() {
                        R.Model.prototype.initialize.apply(this, arguments), this
                                .set({
                                            key : this.get("user").get("key")
                                        })
                    }
                });
    R.Services.register("Chat", {
        isGlobal : !0,
        onInitialized : function() {
            _.bindAll(this, "_onChatMessage")
        },
        onStarted : function(a) {
            var b = this;
            this._chats = {}, this._chatOrdering = [], this._chatModels = {}, R.Services
                    .ready("PubSub", function() {
                                R.pubSub.subscribe(R.currentUser.get("key")
                                                + "/inbox/chat",
                                        b._onChatMessage), a()
                            })
        },
        sendMessage : function(a, b) {
            R.pubSub.publish(a.get("key") + "/inbox/chat", {
                        type : "message",
                        message : b
                    })
        },
        sendTypingNotification : function(a) {
            R.pubSub.publish(a + "/inbox/chat", {
                        type : "typing",
                        chat : R.currentUser.get("key")
                    })
        },
        startChat : function(b, c) {
            if (this._chats[b.get("key")]) {
                this.focusChat(b.get("key"), !1);
                return
            }
            var d = this;
            R.loader.load(["Chat.Window", "Chat.OverflowButton"], function() {
                var e = new a({
                            user : b
                        }),
                    f = new R.Components.Chat.Window({
                                model : e
                            });
                d._app.addChild(f), d._chats[b.get("key")] = f, d._chatModels[b
                        .get("key")] = e, d._chatOrdering.push(b.get("key")), f
                        .on("destroy", d._onWindowDestroyed, d), f.render(
                        function() {
                            $("body").append(f.$el);
                            var a = !0;
                            c && (a = !1, f.model.addMessage(b.get("key"), c)), d
                                    .focusChat(b.get("key"), a), f.bind(
                                    "flash", d._onWindowFlash, d)
                        })
            })
        },
        focusChat : function(a, b) {
            if (!this._chats[a])
                return;
            if (this._overflowLength
                    && _.indexOf(this._chatOrdering, a) >= this._chatOrdering.length
                            - this._overflowLength) {
                var c = _.indexOf(this._chatOrdering, a);
                this._chatOrdering.splice(c, 1), this._chatOrdering.splice(
                        this._chatOrdering.length - this._overflowLength, 0, a)
            }
            this._reflowChats(), b && this._chats[a].focusInput()
        },
        _onChatMessage : function(a, b) {
            switch (b.message.type) {
                case "message" :
                    var c = b.sender,
                        d = b.message.message;
                    if (this._chatModels[c]) {
                        this._chatModels[c].addMessage(c, d);
                        return
                    }
                    var e = R.currentUser.get("following").findByKey(c);
                    e && this.startChat(e, d);
                    break;
                case "typing" :
                    var f = b.message.chat;
                    if (f != b.sender)
                        return;
                    this._chatModels[f]
                            && this._chatModels[f].receiveTypingNotification()
            }
        },
        _onWindowDestroyed : function(a) {
            this._chats[a.model.get("key")]
                    && (delete this._chats[a.model.get("key")], delete this._chatModels[a.model
                            .get("key")], this._chatOrdering =
                            _.reject(this._chatOrdering, function(b) {
                                        return b == a.model.get("key")
                                    }), a.unbind("flash", this._onWindowFlash,
                            this)), this._reflowChats()
        },
        _onAppResized : function() {
            this._reflowChats()
        },
        _onWindowFlash : function(a) {
            if (this._overflowButton) {
                if (_.indexOf(this._chatOrdering, a.model.get("key")) < this._overflowLength)
                    return;
                this._overflowButton.flashButton()
            }
        },
        _reflowChats : function() {
            if (this._chatOrdering.length === 0 || _.isEmpty(this._chats))
                return;
            var a = this,
                b = _.map(this._chatOrdering, function(b) {
                            return a._chats[b]
                        }),
                c = b[0].$el.width(),
                d = this._app.getContainer().width(),
                e = 0;
            this._app.sidebarVisible() && (e = 230);
            var f = !1,
                g = 0,
                h = [];
            _.each(b, function(a, b) {
                        var i = b * (c + 16) + 16;
                        if (i + c > d) {
                            f || (f = !0, g = i + 16), a.$el.hide(), h.push(a);
                            return
                        }
                        a.$el.show(), a.$el.css("right", i + e)
                    });
            if (f) {
                this._overflowButton
                        || (this._overflowButton =
                                new R.Components.Chat.OverflowButton({
                                            model : new Backbone.Collection
                                        }), this._app
                                .addChild(this._overflowButton), this._overflowButton
                                .render(function() {
                                            $("body")
                                                    .append(a._overflowButton.$el)
                                        }));
                var i = _.map(h, function(a) {
                            return new Backbone.Model({
                                        label : a.model.get("user")
                                                .getFullName(!0),
                                        value : a.model.get("key"),
                                        window : a,
                                        extraClassNames : function() {
                                            if (a.isFlashing())
                                                return "new_chat_menu_item"
                                        }
                                    })
                        });
                this._overflowButton.model.reset(i), this._overflowButton.$el
                        .show(), this._overflowButton.$el.css("right", g + e), this._overflowLength =
                        i.length
            } else
                this._overflowButton
                        && (this._overflowButton.$el.hide(), this._overflowLength =
                                0)
        },
        onAppCreated : function(a) {
            this._app
                    && (this._chats = {}, this._app.unbind("resize",
                            this._onAppResized, this)), a.bind("resize",
                    this._onAppResized, this), this._app = a;
            var b = this,
                c = function() {
                    b._app.off("render", c), _.isEmpty(b._chatModels)
                            || _.each(_.values(b._chatModels), function(a) {
                                var c = new R.Components.Chat.Window({
                                            model : a
                                        });
                                b._app.addChild(c), b._chats[a.get("key")] = c, c
                                        .on("destroy", b._onWindowDestroyed, b), c
                                        .render(function() {
                                                    $("body").append(c.$el), c
                                                            .bind(
                                                                    "flash",
                                                                    b._onWindowFlash,
                                                                    b)
                                                })
                            }), b._reflowChats()
                };
            a.isRendered() ? c() : b._app.on("render", c)
        },
        isUsable : function() {
            return !R.currentUser.isAnonymous()
        },
        getCaps : function() {
            return {
                chat : {
                    canChat : !0
                }
            }
        }
    })
}(), function() {
    function e(a, b, c) {
        var d =
                "s.version='H.23.8';s.an=s_an;s.logDebug=function(m){var s=this,tcf=new Function('var e;try{console.log(\"'+s.rep(s.rep(m,\"\\n\",\"\\\\n\"),\"\\\"\",\"\\\\\\\"\")+'\");}catch(e){}');tcf()};s.cls=function(x,c){var i,y='';if(!c)c=this.an;for(i=0;i<x.length;i++){n=x.substring(i,i+1);if(c.indexOf(n)>=0)y+=n}return y};s.fl=function(x,l){return x?(''+x).substring(0,l):x};s.co=function(o){if(!o)return o;var n=new Object,x;for(x in o)if(x.indexOf('select')<0&&x.indexOf('filter')<0)n[x]=o[x];return n};s.num=function(x){x=''+x;for(var p=0;p<x.length;p++)if(('0123456789').indexOf(x.substring(p,p+1))<0)return 0;return 1};s.rep=s_rep;s.sp=s_sp;s.jn=s_jn;s.ape=function(x){var s=this,h='0123456789ABCDEF',i,c=s.charSet,n,l,e,y='';c=c?c.toUpperCase():'';if(x){x=''+x;if(s.em==3)x=encodeURIComponent(x);else if(c=='AUTO'&&('').charCodeAt){for(i=0;i<x.length;i++){c=x.substring(i,i+1);n=x.charCodeAt(i);if(n>127){l=0;e='';while(n||l<4){e=h.substring(n%16,n%16+1)+e;n=(n-n%16)/16;l++}y+='%u'+e}else if(c=='+')y+='%2B';else y+=escape(c)}x=y}else x=escape(''+x);x=s.rep(x,'+','%2B');if(c&&c!='AUTO'&&s.em==1&&x.indexOf('%u')<0&&x.indexOf('%U')<0){i=x.indexOf('%');while(i>=0){i++;if(h.substring(8).indexOf(x.substring(i,i+1).toUpperCase())>=0)return x.substring(0,i)+'u00'+x.substring(i);i=x.indexOf('%',i)}}}return x};s.epa=function(x){var s=this;if(x){x=s.rep(''+x,'+',' ');return s.em==3?decodeURIComponent(x):unescape(x)}return x};s.pt=function(x,d,f,a){var s=this,t=x,z=0,y,r;while(t){y=t.indexOf(d);y=y<0?t.length:y;t=t.substring(0,y);r=s[f](t,a);if(r)return r;z+=y+d.length;t=x.substring(z,x.length);t=z<x.length?t:''}return ''};s.isf=function(t,a){var c=a.indexOf(':');if(c>=0)a=a.substring(0,c);c=a.indexOf('=');if(c>=0)a=a.substring(0,c);if(t.substring(0,2)=='s_')t=t.substring(2);return (t!=''&&t==a)};s.fsf=function(t,a){var s=this;if(s.pt(a,',','isf',t))s.fsg+=(s.fsg!=''?',':'')+t;return 0};s.fs=function(x,f){var s=this;s.fsg='';s.pt(x,',','fsf',f);return s.fsg};s.si=function(){var s=this,i,k,v,c=s_gi+'var s=s_gi(\"'+s.oun+'\");s.sa(\"'+s.un+'\");';for(i=0;i<s.va_g.length;i++){k=s.va_g[i];v=s[k];if(v!=undefined){if(typeof(v)!='number')c+='s.'+k+'=\"'+s_fe(v)+'\";';else c+='s.'+k+'='+v+';'}}c+=\"s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';\";return c};s.c_d='';s.c_gdf=function(t,a){var s=this;if(!s.num(t))return 1;return 0};s.c_gd=function(){var s=this,d=s.wd.location.hostname,n=s.fpCookieDomainPeriods,p;if(!n)n=s.cookieDomainPeriods;if(d&&!s.c_d){n=n?parseInt(n):2;n=n>2?n:2;p=d.lastIndexOf('.');if(p>=0){while(p>=0&&n>1){p=d.lastIndexOf('.',p-1);n--}s.c_d=p>0&&s.pt(d,'.','c_gdf',0)?d.substring(p):d}}return s.c_d};s.c_r=function(k){var s=this;k=s.ape(k);var c=' '+s.d.cookie,i=c.indexOf(' '+k+'='),e=i<0?i:c.indexOf(';',i),v=i<0?'':s.epa(c.substring(i+2+k.length,e<0?c.length:e));return v!='[[B]]'?v:''};s.c_w=function(k,v,e){var s=this,d=s.c_gd(),l=s.cookieLifetime,t;v=''+v;l=l?(''+l).toUpperCase():'';if(e&&l!='SESSION'&&l!='NONE'){t=(v!=''?parseInt(l?l:0):-60);if(t){e=new Date;e.setTime(e.getTime()+(t*1000))}}if(k&&l!='NONE'){s.d.cookie=k+'='+s.ape(v!=''?v:'[[B]]')+'; path=/;'+(e&&l!='SESSION'?' expires='+e.toGMTString()+';':'')+(d?' domain='+d+';':'');return s.c_r(k)==v}return 0};s.eh=function(o,e,r,f){var s=this,b='s_'+e+'_'+s._in,n=-1,l,i,x;if(!s.ehl)s.ehl=new Array;l=s.ehl;for(i=0;i<l.length&&n<0;i++){if(l[i].o==o&&l[i].e==e)n=i}if(n<0){n=i;l[n]=new Object}x=l[n];x.o=o;x.e=e;f=r?x.b:f;if(r||f){x.b=r?0:o[e];x.o[e]=f}if(x.b){x.o[b]=x.b;return b}return 0};s.cet=function(f,a,t,o,b){var s=this,r,tcf;if(s.apv>=5&&(!s.isopera||s.apv>=7)){tcf=new Function('s','f','a','t','var e,r;try{r=s[f](a)}catch(e){r=s[t](e)}return r');r=tcf(s,f,a,t)}else{if(s.ismac&&s.u.indexOf('MSIE 4')>=0)r=s[b](a);else{s.eh(s.wd,'onerror',0,o);r=s[f](a);s.eh(s.wd,'onerror',1)}}return r};s.gtfset=function(e){var s=this;return s.tfs};s.gtfsoe=new Function('e','var s=s_c_il['+s._in+'],c;s.eh(window,\"onerror\",1);s.etfs=1;c=s.t();if(c)s.d.write(c);s.etfs=0;return true');s.gtfsfb=function(a){return window};s.gtfsf=function(w){var s=this,p=w.parent,l=w.location;s.tfs=w;if(p&&p.location!=l&&p.location.host==l.host){s.tfs=p;return s.gtfsf(s.tfs)}return s.tfs};s.gtfs=function(){var s=this;if(!s.tfs){s.tfs=s.wd;if(!s.etfs)s.tfs=s.cet('gtfsf',s.tfs,'gtfset',s.gtfsoe,'gtfsfb')}return s.tfs};s.mrq=function(u){var s=this,l=s.rl[u],n,r;s.rl[u]=0;if(l)for(n=0;n<l.length;n++){r=l[n];s.mr(0,0,r.r,r.t,r.u)}};s.flushBufferedRequests=function(){};s.mr=function(sess,q,rs,ta,u){var s=this,dc=s.dc,t1=s.trackingServer,t2=s.trackingServerSecure,tb=s.trackingServerBase,p='.sc',ns=s.visitorNamespace,un=s.cls(u?u:(ns?ns:s.fun)),r=new Object,l,imn='s_i_'+(un),im,b,e;if(!rs){if(t1){if(t2&&s.ssl)t1=t2}else{if(!tb)tb='2o7.net';if(dc)dc=(''+dc).toLowerCase();else dc='d1';if(tb=='2o7.net'){if(dc=='d1')dc='112';else if(dc=='d2')dc='122';p=''}t1=un+'.'+dc+'.'+p+tb}rs='http'+(s.ssl?'s':'')+'://'+t1+'/b/ss/'+s.un+'/'+(s.mobile?'5.1':'1')+'/'+s.version+(s.tcn?'T':'')+'/'+sess+'?AQB=1&ndh=1'+(q?q:'')+'&AQE=1';if(s.isie&&!s.ismac)rs=s.fl(rs,2047)}if(s.d.images&&s.apv>=3&&(!s.isopera||s.apv>=7)&&(s.ns6<0||s.apv>=6.1)){if(!s.rc)s.rc=new Object;if(!s.rc[un]){s.rc[un]=1;if(!s.rl)s.rl=new Object;s.rl[un]=new Array;setTimeout('if(window.s_c_il)window.s_c_il['+s._in+'].mrq(\"'+un+'\")',750)}else{l=s.rl[un];if(l){r.t=ta;r.u=un;r.r=rs;l[l.length]=r;return ''}imn+='_'+s.rc[un];s.rc[un]++}im=s.wd[imn];if(!im)im=s.wd[imn]=new Image;im.s_l=0;im.onload=new Function('e','this.s_l=1;var wd=window,s;if(wd.s_c_il){s=wd.s_c_il['+s._in+'];s.mrq(\"'+un+'\");s.nrs--;if(!s.nrs)s.m_m(\"rr\")}');if(!s.nrs){s.nrs=1;s.m_m('rs')}else s.nrs++;if(s.debugTracking){var d='AppMeasurement Debug: '+rs,dl=s.sp(rs,'&'),dln;for(dln=0;dln<dl.length;dln++)d+=\"\\n\\t\"+s.epa(dl[dln]);s.logDebug(d)}im.src=rs;if((!ta||ta=='_self'||ta=='_top'||(s.wd.name&&ta==s.wd.name))&&rs.indexOf('&pe=')>=0){b=e=new Date;while(!im.s_l&&e.getTime()-b.getTime()<500)e=new Date}return ''}return '<im'+'g sr'+'c=\"'+rs+'\" width=1 height=1 border=0 alt=\"\">'};s.gg=function(v){var s=this;if(!s.wd['s_'+v])s.wd['s_'+v]='';return s.wd['s_'+v]};s.glf=function(t,a){if(t.substring(0,2)=='s_')t=t.substring(2);var s=this,v=s.gg(t);if(v)s[t]=v};s.gl=function(v){var s=this;if(s.pg)s.pt(v,',','glf',0)};s.rf=function(x){var s=this,y,i,j,h,p,l=0,q,a,b='',c='',t;if(x&&x.length>255){y=''+x;i=y.indexOf('?');if(i>0){q=y.substring(i+1);y=y.substring(0,i);h=y.toLowerCase();j=0;if(h.substring(0,7)=='http://')j+=7;else if(h.substring(0,8)=='https://')j+=8;i=h.indexOf(\"/\",j);if(i>0){h=h.substring(j,i);p=y.substring(i);y=y.substring(0,i);if(h.indexOf('google')>=0)l=',q,ie,start,search_key,word,kw,cd,';else if(h.indexOf('yahoo.co')>=0)l=',p,ei,';if(l&&q){a=s.sp(q,'&');if(a&&a.length>1){for(j=0;j<a.length;j++){t=a[j];i=t.indexOf('=');if(i>0&&l.indexOf(','+t.substring(0,i)+',')>=0)b+=(b?'&':'')+t;else c+=(c?'&':'')+t}if(b&&c)q=b+'&'+c;else c=''}i=253-(q.length-c.length)-y.length;x=y+(i>0?p.substring(0,i):'')+'?'+q}}}}return x};s.s2q=function(k,v,vf,vfp,f){var s=this,qs='',sk,sv,sp,ss,nke,nk,nf,nfl=0,nfn,nfm;if(k==\"contextData\")k=\"c\";if(v){for(sk in v) {if((!f||sk.substring(0,f.length)==f)&&v[sk]&&(!vf||vf.indexOf(','+(vfp?vfp+'.':'')+sk+',')>=0)){nfm=0;if(nfl)for(nfn=0;nfn<nfl.length;nfn++)if(sk.substring(0,nfl[nfn].length)==nfl[nfn])nfm=1;if(!nfm){if(qs=='')qs+='&'+k+'.';sv=v[sk];if(f)sk=sk.substring(f.length);if(sk.length>0){nke=sk.indexOf('.');if(nke>0){nk=sk.substring(0,nke);nf=(f?f:'')+nk+'.';if(!nfl)nfl=new Array;nfl[nfl.length]=nf;qs+=s.s2q(nk,v,vf,vfp,nf)}else{if(typeof(sv)=='boolean'){if(sv)sv='true';else sv='false'}if(sv){if(vfp=='retrieveLightData'&&f.indexOf('.contextData.')<0){sp=sk.substring(0,4);ss=sk.substring(4);if(sk=='transactionID')sk='xact';else if(sk=='channel')sk='ch';else if(sk=='campaign')sk='v0';else if(s.num(ss)){if(sp=='prop')sk='c'+ss;else if(sp=='eVar')sk='v'+ss;else if(sp=='list')sk='l'+ss;else if(sp=='hier'){sk='h'+ss;sv=sv.substring(0,255)}}}qs+='&'+s.ape(sk)+'='+s.ape(sv)}}}}}}if(qs!='')qs+='&.'+k}return qs};s.hav=function(){var s=this,qs='',l,fv='',fe='',mn,i,e;if(s.lightProfileID){l=s.va_m;fv=s.lightTrackVars;if(fv)fv=','+fv+','+s.vl_mr+','}else{l=s.va_t;if(s.pe||s.linkType){fv=s.linkTrackVars;fe=s.linkTrackEvents;if(s.pe){mn=s.pe.substring(0,1).toUpperCase()+s.pe.substring(1);if(s[mn]){fv=s[mn].trackVars;fe=s[mn].trackEvents}}}if(fv)fv=','+fv+','+s.vl_l+','+s.vl_l2;if(fe){fe=','+fe+',';if(fv)fv+=',events,'}if (s.events2)e=(e?',':'')+s.events2}for(i=0;i<l.length;i++){var k=l[i],v=s[k],b=k.substring(0,4),x=k.substring(4),n=parseInt(x),q=k;if(!v)if(k=='events'&&e){v=e;e=''}if(v&&(!fv||fv.indexOf(','+k+',')>=0)&&k!='linkName'&&k!='linkType'){if(k=='timestamp')q='ts';else if(k=='dynamicVariablePrefix')q='D';else if(k=='visitorID')q='vid';else if(k=='pageURL'){q='g';v=s.fl(v,255)}else if(k=='referrer'){q='r';v=s.fl(s.rf(v),255)}else if(k=='vmk'||k=='visitorMigrationKey')q='vmt';else if(k=='visitorMigrationServer'){q='vmf';if(s.ssl&&s.visitorMigrationServerSecure)v=''}else if(k=='visitorMigrationServerSecure'){q='vmf';if(!s.ssl&&s.visitorMigrationServer)v=''}else if(k=='charSet'){q='ce';if(v.toUpperCase()=='AUTO')v='ISO8859-1';else if(s.em==2||s.em==3)v='UTF-8'}else if(k=='visitorNamespace')q='ns';else if(k=='cookieDomainPeriods')q='cdp';else if(k=='cookieLifetime')q='cl';else if(k=='variableProvider')q='vvp';else if(k=='currencyCode')q='cc';else if(k=='channel')q='ch';else if(k=='transactionID')q='xact';else if(k=='campaign')q='v0';else if(k=='resolution')q='s';else if(k=='colorDepth')q='c';else if(k=='javascriptVersion')q='j';else if(k=='javaEnabled')q='v';else if(k=='cookiesEnabled')q='k';else if(k=='browserWidth')q='bw';else if(k=='browserHeight')q='bh';else if(k=='connectionType')q='ct';else if(k=='homepage')q='hp';else if(k=='plugins')q='p';else if(k=='events'){if(e)v+=(v?',':'')+e;if(fe)v=s.fs(v,fe)}else if(k=='events2')v='';else if(k=='contextData'){qs+=s.s2q('c',s[k],fv,k,0);v=''}else if(k=='lightProfileID')q='mtp';else if(k=='lightStoreForSeconds'){q='mtss';if(!s.lightProfileID)v=''}else if(k=='lightIncrementBy'){q='mti';if(!s.lightProfileID)v=''}else if(k=='retrieveLightProfiles')q='mtsr';else if(k=='deleteLightProfiles')q='mtsd';else if(k=='retrieveLightData'){if(s.retrieveLightProfiles)qs+=s.s2q('mts',s[k],fv,k,0);v=''}else if(s.num(x)){if(b=='prop')q='c'+n;else if(b=='eVar')q='v'+n;else if(b=='list')q='l'+n;else if(b=='hier'){q='h'+n;v=s.fl(v,255)}}if(v)qs+='&'+s.ape(q)+'='+(k.substring(0,3)!='pev'?s.ape(v):v)}}return qs};s.ltdf=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase():'';var qi=h.indexOf('?');h=qi>=0?h.substring(0,qi):h;if(t&&h.substring(h.length-(t.length+1))=='.'+t)return 1;return 0};s.ltef=function(t,h){t=t?t.toLowerCase():'';h=h?h.toLowerCase():'';if(t&&h.indexOf(t)>=0)return 1;return 0};s.lt=function(h){var s=this,lft=s.linkDownloadFileTypes,lef=s.linkExternalFilters,lif=s.linkInternalFilters;lif=lif?lif:s.wd.location.hostname;h=h.toLowerCase();if(s.trackDownloadLinks&&lft&&s.pt(lft,',','ltdf',h))return 'd';if(s.trackExternalLinks&&h.substring(0,1)!='#'&&(lef||lif)&&(!lef||s.pt(lef,',','ltef',h))&&(!lif||!s.pt(lif,',','ltef',h)))return 'e';return ''};s.lc=new Function('e','var s=s_c_il['+s._in+'],b=s.eh(this,\"onclick\");s.lnk=s.co(this);s.t();s.lnk=0;if(b)return this[b](e);return true');s.bc=new Function('e','var s=s_c_il['+s._in+'],f,tcf;if(s.d&&s.d.all&&s.d.all.cppXYctnr)return;s.eo=e.srcElement?e.srcElement:e.target;tcf=new Function(\"s\",\"var e;try{if(s.eo&&(s.eo.tagName||s.eo.parentElement||s.eo.parentNode))s.t()}catch(e){}\");tcf(s);s.eo=0');s.oh=function(o){var s=this,l=s.wd.location,h=o.href?o.href:'',i,j,k,p;i=h.indexOf(':');j=h.indexOf('?');k=h.indexOf('/');if(h&&(i<0||(j>=0&&i>j)||(k>=0&&i>k))){p=o.protocol&&o.protocol.length>1?o.protocol:(l.protocol?l.protocol:'');i=l.pathname.lastIndexOf('/');h=(p?p+'//':'')+(o.host?o.host:(l.host?l.host:''))+(h.substring(0,1)!='/'?l.pathname.substring(0,i<0?0:i)+'/':'')+h}return h};s.ot=function(o){var t=o.tagName;if(o.tagUrn||(o.scopeName&&o.scopeName.toUpperCase()!='HTML'))return '';t=t&&t.toUpperCase?t.toUpperCase():'';if(t=='SHAPE')t='';if(t){if((t=='INPUT'||t=='BUTTON')&&o.type&&o.type.toUpperCase)t=o.type.toUpperCase();else if(!t&&o.href)t='A';}return t};s.oid=function(o){var s=this,t=s.ot(o),p,c,n='',x=0;if(t&&!o.s_oid){p=o.protocol;c=o.onclick;if(o.href&&(t=='A'||t=='AREA')&&(!c||!p||p.toLowerCase().indexOf('javascript')<0))n=s.oh(o);else if(c){n=s.rep(s.rep(s.rep(s.rep(''+c,\"\\r\",''),\"\\n\",''),\"\\t\",''),' ','');x=2}else if(t=='INPUT'||t=='SUBMIT'){if(o.value)n=o.value;else if(o.innerText)n=o.innerText;else if(o.textContent)n=o.textContent;x=3}else if(o.src&&t=='IMAGE')n=o.src;if(n){o.s_oid=s.fl(n,100);o.s_oidt=x}}return o.s_oid};s.rqf=function(t,un){var s=this,e=t.indexOf('='),u=e>=0?t.substring(0,e):'',q=e>=0?s.epa(t.substring(e+1)):'';if(u&&q&&(','+u+',').indexOf(','+un+',')>=0){if(u!=s.un&&s.un.indexOf(',')>=0)q='&u='+u+q+'&u=0';return q}return ''};s.rq=function(un){if(!un)un=this.un;var s=this,c=un.indexOf(','),v=s.c_r('s_sq'),q='';if(c<0)return s.pt(v,'&','rqf',un);return s.pt(un,',','rq',0)};s.sqp=function(t,a){var s=this,e=t.indexOf('='),q=e<0?'':s.epa(t.substring(e+1));s.sqq[q]='';if(e>=0)s.pt(t.substring(0,e),',','sqs',q);return 0};s.sqs=function(un,q){var s=this;s.squ[un]=q;return 0};s.sq=function(q){var s=this,k='s_sq',v=s.c_r(k),x,c=0;s.sqq=new Object;s.squ=new Object;s.sqq[q]='';s.pt(v,'&','sqp',0);s.pt(s.un,',','sqs',q);v='';for(x in s.squ)if(x&&(!Object||!Object.prototype||!Object.prototype[x]))s.sqq[s.squ[x]]+=(s.sqq[s.squ[x]]?',':'')+x;for(x in s.sqq)if(x&&(!Object||!Object.prototype||!Object.prototype[x])&&s.sqq[x]&&(x==q||c<2)){v+=(v?'&':'')+s.sqq[x]+'='+s.ape(x);c++}return s.c_w(k,v,0)};s.wdl=new Function('e','var s=s_c_il['+s._in+'],r=true,b=s.eh(s.wd,\"onload\"),i,o,oc;if(b)r=this[b](e);for(i=0;i<s.d.links.length;i++){o=s.d.links[i];oc=o.onclick?\"\"+o.onclick:\"\";if((oc.indexOf(\"s_gs(\")<0||oc.indexOf(\".s_oc(\")>=0)&&oc.indexOf(\".tl(\")<0)s.eh(o,\"onclick\",0,s.lc);}return r');s.wds=function(){var s=this;if(s.apv>3&&(!s.isie||!s.ismac||s.apv>=5)){if(s.b&&s.b.attachEvent)s.b.attachEvent('onclick',s.bc);else if(s.b&&s.b.addEventListener)s.b.addEventListener('click',s.bc,false);else s.eh(s.wd,'onload',0,s.wdl)}};s.vs=function(x){var s=this,v=s.visitorSampling,g=s.visitorSamplingGroup,k='s_vsn_'+s.un+(g?'_'+g:''),n=s.c_r(k),e=new Date,y=e.getYear();e.setYear(y+10+(y<1900?1900:0));if(v){v*=100;if(!n){if(!s.c_w(k,x,e))return 0;n=x}if(n%10000>v)return 0}return 1};s.dyasmf=function(t,m){if(t&&m&&m.indexOf(t)>=0)return 1;return 0};s.dyasf=function(t,m){var s=this,i=t?t.indexOf('='):-1,n,x;if(i>=0&&m){var n=t.substring(0,i),x=t.substring(i+1);if(s.pt(x,',','dyasmf',m))return n}return 0};s.uns=function(){var s=this,x=s.dynamicAccountSelection,l=s.dynamicAccountList,m=s.dynamicAccountMatch,n,i;s.un=s.un.toLowerCase();if(x&&l){if(!m)m=s.wd.location.host;if(!m.toLowerCase)m=''+m;l=l.toLowerCase();m=m.toLowerCase();n=s.pt(l,';','dyasf',m);if(n)s.un=n}i=s.un.indexOf(',');s.fun=i<0?s.un:s.un.substring(0,i)};s.sa=function(un){var s=this;s.un=un;if(!s.oun)s.oun=un;else if((','+s.oun+',').indexOf(','+un+',')<0)s.oun+=','+un;s.uns()};s.m_i=function(n,a){var s=this,m,f=n.substring(0,1),r,l,i;if(!s.m_l)s.m_l=new Object;if(!s.m_nl)s.m_nl=new Array;m=s.m_l[n];if(!a&&m&&m._e&&!m._i)s.m_a(n);if(!m){m=new Object,m._c='s_m';m._in=s.wd.s_c_in;m._il=s._il;m._il[m._in]=m;s.wd.s_c_in++;m.s=s;m._n=n;m._l=new Array('_c','_in','_il','_i','_e','_d','_dl','s','n','_r','_g','_g1','_t','_t1','_x','_x1','_rs','_rr','_l');s.m_l[n]=m;s.m_nl[s.m_nl.length]=n}else if(m._r&&!m._m){r=m._r;r._m=m;l=m._l;for(i=0;i<l.length;i++)if(m[l[i]])r[l[i]]=m[l[i]];r._il[r._in]=r;m=s.m_l[n]=r}if(f==f.toUpperCase())s[n]=m;return m};s.m_a=new Function('n','g','e','if(!g)g=\"m_\"+n;var s=s_c_il['+s._in+'],c=s[g+\"_c\"],m,x,f=0;if(!c)c=s.wd[\"s_\"+g+\"_c\"];if(c&&s_d)s[g]=new Function(\"s\",s_ft(s_d(c)));x=s[g];if(!x)x=s.wd[\\'s_\\'+g];if(!x)x=s.wd[g];m=s.m_i(n,1);if(x&&(!m._i||g!=\"m_\"+n)){m._i=f=1;if((\"\"+x).indexOf(\"function\")>=0)x(s);else s.m_m(\"x\",n,x,e)}m=s.m_i(n,1);if(m._dl)m._dl=m._d=0;s.dlt();return f');s.m_m=function(t,n,d,e){t='_'+t;var s=this,i,x,m,f='_'+t,r=0,u;if(s.m_l&&s.m_nl)for(i=0;i<s.m_nl.length;i++){x=s.m_nl[i];if(!n||x==n){m=s.m_i(x);u=m[t];if(u){if((''+u).indexOf('function')>=0){if(d&&e)u=m[t](d,e);else if(d)u=m[t](d);else u=m[t]()}}if(u)r=1;u=m[t+1];if(u&&!m[f]){if((''+u).indexOf('function')>=0){if(d&&e)u=m[t+1](d,e);else if(d)u=m[t+1](d);else u=m[t+1]()}}m[f]=1;if(u)r=1}}return r};s.m_ll=function(){var s=this,g=s.m_dl,i,o;if(g)for(i=0;i<g.length;i++){o=g[i];if(o)s.loadModule(o.n,o.u,o.d,o.l,o.e,1);g[i]=0}};s.loadModule=function(n,u,d,l,e,ln){var s=this,m=0,i,g,o=0,f1,f2,c=s.h?s.h:s.b,b,tcf;if(n){i=n.indexOf(':');if(i>=0){g=n.substring(i+1);n=n.substring(0,i)}else g=\"m_\"+n;m=s.m_i(n)}if((l||(n&&!s.m_a(n,g)))&&u&&s.d&&c&&s.d.createElement){if(d){m._d=1;m._dl=1}if(ln){if(s.ssl)u=s.rep(u,'http:','https:');i='s_s:'+s._in+':'+n+':'+g;b='var s=s_c_il['+s._in+'],o=s.d.getElementById(\"'+i+'\");if(s&&o){if(!o.l&&s.wd.'+g+'){o.l=1;if(o.i)clearTimeout(o.i);o.i=0;s.m_a(\"'+n+'\",\"'+g+'\"'+(e?',\"'+e+'\"':'')+')}';f2=b+'o.c++;if(!s.maxDelay)s.maxDelay=250;if(!o.l&&o.c<(s.maxDelay*2)/100)o.i=setTimeout(o.f2,100)}';f1=new Function('e',b+'}');tcf=new Function('s','c','i','u','f1','f2','var e,o=0;try{o=s.d.createElement(\"script\");if(o){o.type=\"text/javascript\";'+(n?'o.id=i;o.defer=true;o.onload=o.onreadystatechange=f1;o.f2=f2;o.l=0;':'')+'o.src=u;c.appendChild(o);'+(n?'o.c=0;o.i=setTimeout(f2,100)':'')+'}}catch(e){o=0}return o');o=tcf(s,c,i,u,f1,f2)}else{o=new Object;o.n=n+':'+g;o.u=u;o.d=d;o.l=l;o.e=e;g=s.m_dl;if(!g)g=s.m_dl=new Array;i=0;while(i<g.length&&g[i])i++;g[i]=o}}else if(n){m=s.m_i(n);m._e=1}return m};s.voa=function(vo,r){var s=this,l=s.va_g,i,k,v,x;for(i=0;i<l.length;i++){k=l[i];v=vo[k];if(v||vo['!'+k]){if(!r&&(k==\"contextData\"||k==\"retrieveLightData\")&&s[k])for(x in s[k])if(!v[x])v[x]=s[k][x];s[k]=v}}};s.vob=function(vo){var s=this,l=s.va_g,i,k;for(i=0;i<l.length;i++){k=l[i];vo[k]=s[k];if(!vo[k])vo['!'+k]=1}};s.dlt=new Function('var s=s_c_il['+s._in+'],d=new Date,i,vo,f=0;if(s.dll)for(i=0;i<s.dll.length;i++){vo=s.dll[i];if(vo){if(!s.m_m(\"d\")||d.getTime()-vo._t>=s.maxDelay){s.dll[i]=0;s.t(vo)}else f=1}}if(s.dli)clearTimeout(s.dli);s.dli=0;if(f){if(!s.dli)s.dli=setTimeout(s.dlt,s.maxDelay)}else s.dll=0');s.dl=function(vo){var s=this,d=new Date;if(!vo)vo=new Object;s.vob(vo);vo._t=d.getTime();if(!s.dll)s.dll=new Array;s.dll[s.dll.length]=vo;if(!s.maxDelay)s.maxDelay=250;s.dlt()};s.track=s.t=function(vo){var s=this,trk=1,tm=new Date,sed=Math&&Math.random?Math.floor(Math.random()*10000000000000):tm.getTime(),sess='s'+Math.floor(tm.getTime()/10800000)%10+sed,y=tm.getYear(),vt=tm.getDate()+'/'+tm.getMonth()+'/'+(y<1900?y+1900:y)+' '+tm.getHours()+':'+tm.getMinutes()+':'+tm.getSeconds()+' '+tm.getDay()+' '+tm.getTimezoneOffset(),tcf,tfs=s.gtfs(),ta=-1,q='',qs='',code='',vb=new Object;s.gl(s.vl_g);s.uns();s.m_ll();if(!s.td){var tl=tfs.location,a,o,i,x='',c='',v='',p='',bw='',bh='',j='1.0',k=s.c_w('s_cc','true',0)?'Y':'N',hp='',ct='',pn=0,ps;if(String&&String.prototype){j='1.1';if(j.match){j='1.2';if(tm.setUTCDate){j='1.3';if(s.isie&&s.ismac&&s.apv>=5)j='1.4';if(pn.toPrecision){j='1.5';a=new Array;if(a.forEach){j='1.6';i=0;o=new Object;tcf=new Function('o','var e,i=0;try{i=new Iterator(o)}catch(e){}return i');i=tcf(o);if(i&&i.next)j='1.7'}}}}}if(s.apv>=4)x=screen.width+'x'+screen.height;if(s.isns||s.isopera){if(s.apv>=3){v=s.n.javaEnabled()?'Y':'N';if(s.apv>=4){c=screen.pixelDepth;bw=s.wd.innerWidth;bh=s.wd.innerHeight}}s.pl=s.n.plugins}else if(s.isie){if(s.apv>=4){v=s.n.javaEnabled()?'Y':'N';c=screen.colorDepth;if(s.apv>=5){bw=s.d.documentElement.offsetWidth;bh=s.d.documentElement.offsetHeight;if(!s.ismac&&s.b){tcf=new Function('s','tl','var e,hp=0;try{s.b.addBehavior(\"#default#homePage\");hp=s.b.isHomePage(tl)?\"Y\":\"N\"}catch(e){}return hp');hp=tcf(s,tl);tcf=new Function('s','var e,ct=0;try{s.b.addBehavior(\"#default#clientCaps\");ct=s.b.connectionType}catch(e){}return ct');ct=tcf(s)}}}else r=''}if(s.pl)while(pn<s.pl.length&&pn<30){ps=s.fl(s.pl[pn].name,100)+';';if(p.indexOf(ps)<0)p+=ps;pn++}s.resolution=x;s.colorDepth=c;s.javascriptVersion=j;s.javaEnabled=v;s.cookiesEnabled=k;s.browserWidth=bw;s.browserHeight=bh;s.connectionType=ct;s.homepage=hp;s.plugins=p;s.td=1}if(vo){s.vob(vb);s.voa(vo)}if((vo&&vo._t)||!s.m_m('d')){if(s.usePlugins)s.doPlugins(s);var l=s.wd.location,r=tfs.document.referrer;if(!s.pageURL)s.pageURL=l.href?l.href:l;if(!s.referrer&&!s._1_referrer){s.referrer=r;s._1_referrer=1}s.m_m('g');if(s.lnk||s.eo){var o=s.eo?s.eo:s.lnk,p=s.pageName,w=1,t=s.ot(o),n=s.oid(o),x=o.s_oidt,h,l,i,oc;if(s.eo&&o==s.eo){while(o&&!n&&t!='BODY'){o=o.parentElement?o.parentElement:o.parentNode;if(o){t=s.ot(o);n=s.oid(o);x=o.s_oidt}}if(o){oc=o.onclick?''+o.onclick:'';if((oc.indexOf('s_gs(')>=0&&oc.indexOf('.s_oc(')<0)||oc.indexOf('.tl(')>=0)o=0}}if(o){if(n)ta=o.target;h=s.oh(o);i=h.indexOf('?');h=s.linkLeaveQueryString||i<0?h:h.substring(0,i);l=s.linkName;t=s.linkType?s.linkType.toLowerCase():s.lt(h);if(t&&(h||l)){s.pe='lnk_'+(t=='d'||t=='e'?t:'o');q+='&pe='+s.pe+(h?'&pev1='+s.ape(h):'')+(l?'&pev2='+s.ape(l):'');}else trk=0;if(s.trackInlineStats){if(!p){p=s.pageURL;w=0}t=s.ot(o);i=o.sourceIndex;if(s.gg('objectID')){n=s.gg('objectID');x=1;i=1}if(p&&n&&t)qs='&pid='+s.ape(s.fl(p,255))+(w?'&pidt='+w:'')+'&oid='+s.ape(s.fl(n,100))+(x?'&oidt='+x:'')+'&ot='+s.ape(t)+(i?'&oi='+i:'')}}else trk=0}if(trk||qs){s.sampled=s.vs(sed);if(trk){if(s.sampled)code=s.mr(sess,(vt?'&t='+s.ape(vt):'')+s.hav()+q+(qs?qs:s.rq()),0,ta);qs='';s.m_m('t');if(s.p_r)s.p_r();s.referrer=s.lightProfileID=s.retrieveLightProfiles=s.deleteLightProfiles=''}s.sq(qs)}}else s.dl(vo);if(vo)s.voa(vb,1);s.lnk=s.eo=s.linkName=s.linkType=s.wd.s_objectID=s.ppu=s.pe=s.pev1=s.pev2=s.pev3='';if(s.pg)s.wd.s_lnk=s.wd.s_eo=s.wd.s_linkName=s.wd.s_linkType='';return code};s.trackLink=s.tl=function(o,t,n,vo){var s=this;s.lnk=s.co(o);s.linkType=t;s.linkName=n;s.t(vo)};s.trackLight=function(p,ss,i,vo){var s=this;s.lightProfileID=p;s.lightStoreForSeconds=ss;s.lightIncrementBy=i;s.t(vo)};s.setTagContainer=function(n){var s=this,l=s.wd.s_c_il,i,t,x,y;s.tcn=n;if(l)for(i=0;i<l.length;i++){t=l[i];if(t&&t._c=='s_l'&&t.tagContainerName==n){for(i=0;i<s.va_g.length;i++){x=s.va_g[i];if(t[x])s[x]=t[x]}if(t.lmq)for(i=0;i<t.lmq.length;i++){x=t.lmq[i];y='m_'+x.n;if(!s[y]&&!s[y+'_c']){s[y]=t[y];s[y+'_c']=t[y+'_c']}s.loadModule(x.n,x.u,x.d)}if(t.ml)for(x in t.ml)if(s[x]){y=s[x];x=t.ml[x];for(i in x)if(!Object.prototype[i]){if(typeof(x[i])!='function'||(''+x[i]).indexOf('s_c_il')<0)y[i]=x[i]}}if(t.mmq)for(i=0;i<t.mmq.length;i++){x=t.mmq[i];if(s[x.m]){y=s[x.m];if(y[x.f]&&typeof(y[x.f])=='function'){if(x.a)y[x.f].apply(y,x.a);else y[x.f].apply(y)}}}if(t.tq)for(i=0;i<t.tq.length;i++)s.t(t.tq[i]);t.s=s;return}}};s.wd=window;s.ssl=(s.wd.location.protocol.toLowerCase().indexOf('https')>=0);s.d=document;s.b=s.d.body;if(s.d.getElementsByTagName){s.h=s.d.getElementsByTagName('HEAD');if(s.h)s.h=s.h[0]}s.n=navigator;s.u=s.n.userAgent;s.ns6=s.u.indexOf('Netscape6/');var apn=s.n.appName,v=s.n.appVersion,ie=v.indexOf('MSIE '),o=s.u.indexOf('Opera '),i;if(v.indexOf('Opera')>=0||o>0)apn='Opera';s.isie=(apn=='Microsoft Internet Explorer');s.isns=(apn=='Netscape');s.isopera=(apn=='Opera');s.ismac=(s.u.indexOf('Mac')>=0);if(o>0)s.apv=parseFloat(s.u.substring(o+6));else if(ie>0){s.apv=parseInt(i=v.substring(ie+5));if(s.apv>3)s.apv=parseFloat(i)}else if(s.ns6>0)s.apv=parseFloat(s.u.substring(s.ns6+10));else s.apv=parseFloat(v);s.em=0;if(s.em.toPrecision)s.em=3;else if(String.fromCharCode){i=escape(String.fromCharCode(256)).toUpperCase();s.em=(i=='%C4%80'?2:(i=='%U0100'?1:0))}if(s.oun)s.sa(s.oun);s.sa(un);s.vl_l='dynamicVariablePrefix,visitorID,vmk,visitorMigrationKey,visitorMigrationServer,visitorMigrationServerSecure,ppu,charSet,visitorNamespace,cookieDomainPeriods,cookieLifetime,pageName,pageURL,referrer,currencyCode';s.va_l=s.sp(s.vl_l,',');s.vl_mr=s.vl_m='charSet,visitorNamespace,cookieDomainPeriods,cookieLifetime,contextData,lightProfileID,lightStoreForSeconds,lightIncrementBy';s.vl_t=s.vl_l+',variableProvider,channel,server,pageType,transactionID,purchaseID,campaign,state,zip,events,events2,products,linkName,linkType,contextData,lightProfileID,lightStoreForSeconds,lightIncrementBy,retrieveLightProfiles,deleteLightProfiles,retrieveLightData';var n;for(n=1;n<=75;n++){s.vl_t+=',prop'+n+',eVar'+n;s.vl_m+=',prop'+n+',eVar'+n}for(n=1;n<=5;n++)s.vl_t+=',hier'+n;for(n=1;n<=3;n++)s.vl_t+=',list'+n;s.va_m=s.sp(s.vl_m,',');s.vl_l2=',tnt,pe,pev1,pev2,pev3,resolution,colorDepth,javascriptVersion,javaEnabled,cookiesEnabled,browserWidth,browserHeight,connectionType,homepage,plugins';s.vl_t+=s.vl_l2;s.va_t=s.sp(s.vl_t,',');s.vl_g=s.vl_t+',trackingServer,trackingServerSecure,trackingServerBase,fpCookieDomainPeriods,disableBufferedRequests,mobile,visitorSampling,visitorSamplingGroup,dynamicAccountSelection,dynamicAccountList,dynamicAccountMatch,trackDownloadLinks,trackExternalLinks,trackInlineStats,linkLeaveQueryString,linkDownloadFileTypes,linkExternalFilters,linkInternalFilters,linkTrackVars,linkTrackEvents,linkNames,lnk,eo,lightTrackVars,_1_referrer,un';s.va_g=s.sp(s.vl_g,',');s.pg=pg;s.gl(s.vl_g);s.contextData=new Object;s.retrieveLightData=new Object;if(!ss)s.wds();if(pg){s.wd.s_co=function(o){s_gi(\"_\",1,1).co(o)};s.wd.s_gs=function(un){s_gi(un,1,1).t()};s.wd.s_dc=function(un){s_gi(un,1).t()}}",
            e = this,
            f = e.s_c_il,
            g = navigator,
            h = g.userAgent,
            i = g.appVersion,
            j = i.indexOf("MSIE "),
            k = h.indexOf("Netscape6/"), l, m, n, o, p;
        if (a) {
            a = a.toLowerCase();
            if (f)
                for (n = 0; n < 2; n++)
                    for (m = 0; m < f.length; m++) {
                        p = f[m], o = p._c;
                        if ((!o || o == "s_c" || n > 0 && o == "s_l")
                                && (p.oun == a || p.fs && p.sa
                                        && p.fs(p.oun, a))) {
                            p.sa && p.sa(a);
                            if (o == "s_c")
                                return p
                        } else
                            p = 0
                    }
        }
        e.s_an =
                "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", e.s_sp =
                new Function(
                        "x",
                        "d",
                        "var a=new Array,i=0,j;if(x){if(x.split)a=x.split(d);else if(!d)for(i=0;i<x.length;i++)a[a.length]=x.substring(i,i+1);else while(i>=0){j=x.indexOf(d,i);a[a.length]=x.substring(i,j<0?x.length:j);i=j;if(i>=0)i+=d.length}}return a"), e.s_jn =
                new Function(
                        "a",
                        "d",
                        "var x='',i,j=a.length;if(a&&j>0){x=a[0];if(j>1){if(a.join)x=a.join(d);else for(i=1;i<j;i++)x+=d+a[i]}}return x"), e.s_rep =
                new Function("x", "o", "n", "return s_jn(s_sp(x,o),n)"), e.s_d =
                new Function(
                        "x",
                        "var t='`^@$#',l=s_an,l2=new Object,x2,d,b=0,k,i=x.lastIndexOf('~~'),j,v,w;if(i>0){d=x.substring(0,i);x=x.substring(i+2);l=s_sp(l,'');for(i=0;i<62;i++)l2[l[i]]=i;t=s_sp(t,'');d=s_sp(d,'~');i=0;while(i<5){v=0;if(x.indexOf(t[i])>=0) {x2=s_sp(x,t[i]);for(j=1;j<x2.length;j++){k=x2[j].substring(0,1);w=t[i]+k;if(k!=' '){v=1;w=d[b+l2[k]]}x2[j]=w+x2[j].substring(1)}}if(v)x=s_jn(x2,'');else{w=t[i]+' ';if(x.indexOf(w)>=0)x=s_rep(x,w,t[i]);i++;b+=62}}}return x"), e.s_fe =
                new Function(
                        "c",
                        "return s_rep(s_rep(s_rep(c,'\\\\','\\\\\\\\'),'\"','\\\\\"'),\"\\n\",\"\\\\n\")"), e.s_fa =
                new Function(
                        "f",
                        "var s=f.indexOf('(')+1,e=f.indexOf(')'),a='',c;while(s>=0&&s<e){c=f.substring(s,s+1);if(c==',')a+='\",\"';else if((\"\\n\\r\\t \").indexOf(c)<0)a+=c;s++}return a?'\"'+a+'\"':a"), e.s_ft =
                new Function(
                        "c",
                        "c+='';var s,e,o,a,d,q,f,h,x;s=c.indexOf('=function(');while(s>=0){s++;d=1;q='';x=0;f=c.substring(s);a=s_fa(f);e=o=c.indexOf('{',s);e++;while(d>0){h=c.substring(e,e+1);if(q){if(h==q&&!x)q='';if(h=='\\\\')x=x?0:1;else x=0}else{if(h=='\"'||h==\"'\")q=h;if(h=='{')d++;if(h=='}')d--}if(d>0)e++}c=c.substring(0,s)+'new Function('+(a?a+',':'')+'\"'+s_fe(c.substring(o+1,e))+'\")'+c.substring(e+1);s=c.indexOf('=function(')}return c;"), d =
                s_d(d), j > 0 ? (l = parseInt(m = i.substring(j + 5)), l > 3
                && (l = parseFloat(m))) : k > 0 ? l =
                parseFloat(h.substring(k + 10)) : l = parseFloat(i);
        if (l < 5 || i.indexOf("Opera") >= 0 || h.indexOf("Opera") >= 0)
            d = s_ft(d);
        return p
                || (p = new Object, e.s_c_in
                        || (e.s_c_il = new Array, e.s_c_in = 0), p._il =
                        e.s_c_il, p._in = e.s_c_in, p._il[p._in] = p, e.s_c_in++), p._c =
                "s_c", (new Function("s", "un", "pg", "ss", d))(p, a, b, c), p
    }
    function f() {
        var a = window,
            b = a.s_giq, c, d, f;
        if (b)
            for (c = 0; c < b.length; c++)
                d = b[c], f = e(d.oun), f.sa(d.un), f
                        .setTagContainer(d.tagContainerName);
        a.s_giq = 0
    }
    var a = R.serverInfo.get("omnitureAccount"),
        b = e(a);
    _.extend(b, {
        charSet : "UTF-8",
        currencyCode : "USD",
        trackDownloadLinks : !0,
        trackExternalLinks : !0,
        trackInlineStats : !0,
        linkDownloadFileTypes : "dmg,exe,zip,wav,mp3,mov,mpg,avi,wmv,pdf,doc,docx,xls,xlsx,ppt,pptx",
        linkInternalFilters : "javascript:,.rdio.com,//rdio.com,127.0.0.1,127.0.0.1:8000,"
                + window.location.host,
        linkLeaveQueryString : !1,
        linkTrackVars : "None",
        linkTrackEvents : "None",
        usePlugins : !1,
        doPlugins : R.doNothing
    }), b.visitorNamespace = "rdio", b.trackingServer = "rdio.d1.sc.omtrdc.net";
    var c = "", d;
    f(), R.Services.register("Omniture", {
        _subscriptionStateMap : {
            trial : "Free Trial Users",
            freeLimited : "Free Limited Users",
            web : "Web Subs",
            unlimited : "Unlimited Subs",
            familyMaster : "Family Plan 1 Subs",
            familyMember : "Family Plan 2 Subs"
        },
        onStarted : function(a) {
            Backbone.history.bind("route", this.onRoute, this), R.currentUser
                    .bind("change", this.onUserChanged, this), this
                    .onUserChanged(R.currentUser), a()
        },
        onStopping : function() {
            R.router.unbind("route", this.onRoute, this), R.currentUser.unbind(
                    "change", this.onUserChanged, this)
        },
        onRoute : function() {
            b.pageUrl =
                    "http://" + window.location.host + "/"
                            + Backbone.history.getFragment(), console
                    .log("Sending data to omniture"), b.t()
        },
        onUserChanged : function(a) {
            a.get("compSubscriptionType") ? b.eVar3 = "Compd Users" : b.eVar3 =
                    "Non-compd Users", b.eVar1 = a.get("key"), a.isAnonymous()
                    || (b.eVar2 =
                            this._subscriptionStateMap[a.get("accountType")], b.eVar5 =
                            a.get("has_facebook"), b.eVar6 =
                            a.get("has_twitter"), b.eVar7 = a.get("has_lastfm"))
        }
    })
}(), function() {
    R.Services.register("UnityWebApp", {
        isUsable : function() {
            return !0
        },
        onInitialized : function() {
            _.bindAll(this, "_onUnityInit", "_onPlayStateChanged",
                    "_onPlayingTrackChanged", "_onNext", "_onPrevious",
                    "_onPlayPause")
        },
        onStarted : function(a) {
            var b = this;
            _.delay(function() {
                try {
                    b._unity = external.getUnityObject(1)
                } catch (c) {
                    console
                            .log("[UnityWebApp] unable to start, should try again later, but not doing that yet");
                    return
                }
                b._readyCallback = a, R.Services.ready("Player", function() {
                    R.player.bind("change:playState", b._onPlayStateChanged), R.player
                            .bind("change:playingTrack",
                                    b._onPlayingTrackChanged), b._unity.init({
                        name : "Rdio",
                        iconUrl : "http://www.rdio.com/media/images/icons/Rdio_128.png",
                        onInit : b._onUnityInit
                    })
                })
            }, 3e3)
        },
        _onUnityInit : function() {
            console.log("[UnityWebApp] Unity Web App integration is ready"), this._unity.MediaPlayer
                    .onNext(this._onNext), this._unity.MediaPlayer
                    .onPrevious(this._onPrevious), this._unity.MediaPlayer
                    .onPlayPause(this._onPlayPause), this
                    ._onPlayingTrackChanged(), this._onPlayStateChanged(), this._readyCallback
                    && (this._readyCallback(), delete this._readyCallback)
        },
        _onPlayingTrackChanged : function() {
            try {
                var a = R.player.playingTrack();
                a && this._unity.MediaPlayer.setTrack({
                            title : a.get("name"),
                            album : a.get("album"),
                            artist : a.get("artist"),
                            artLocation : a.get("icon")
                        })
            } catch (b) {
                console.error(b)
            }
        },
        _onPlayStateChanged : function() {
            try {
                R.player.isPlaying()
                        ? this._unity.MediaPlayer
                                .setPlaybackState(this._unity.MediaPlayer.PlaybackState.PLAYING)
                        : this._unity.MediaPlayer
                                .setPlaybackState(this._unity.MediaPlayer.PlaybackState.PAUSED)
            } catch (a) {
                console.error(a)
            }
        },
        _onNext : function() {
            R.player.next()
        },
        _onPrevious : function() {
            R.player.previous()
        },
        _onPlayPause : function() {
            R.player.togglePause()
        }
    })
}(), function() {
    R.rdioInit = function() {
        R.currentUser = new R.Models.CurrentUser.Rdio(Env.currentUser);
        if (!R.Init.ensureDecentBrowser())
            return;
        R.Init.setupGlobals();
        var a = R.Init.rdioFaviconLinkTags().concat([{
                    rel : "search",
                    title : R.serverInfo.get("product_name"),
                    type : "application/opensearchdescription+xml",
                    href : "/opensearch.xml"
                }]);
        R.Init.installHeaderTags("link", a), R.Init.installHeaderTags("meta", [
                {
                    name : "description",
                    content : t("[product_name] lets you listen to millions of songs ad-free wherever you are Ð on the web and on your phone, even offline.")
                }]), R.currentUser.isAnonymous()
                && R.injectScript("//use.typekit.com/aqk0kdr.js", null,
                        function() {
                            try {
                                Typekit.load()
                            } catch (a) {
                                console.warn("Could not load Typekit", a)
                            }
                        }), R.Init.startApp("App.Rdio"), R.isDesktop
                && R.loader.load(["Desktop.Main"], function() {
                            R.desktop = new R.Components.Desktop.Main
                        })
    }
}(), function() {
    R.Models.Video = R.Models.ObjectModel.extend({
        overrides : {
            icon : "icon",
            frame : "frame",
            detailFrame : "detailFrame"
        },
        icon : function() {
            return this.attributes[window.devicePixelRatio > 1
                    ? "icon500"
                    : "icon"]
        },
        frame : function() {
            return this.attributes[window.devicePixelRatio > 1
                    ? "frame500"
                    : "frame"]
        },
        detailFrame : function() {
            return this.attributes[window.devicePixelRatio > 1
                    ? "frame1000"
                    : "frame500"]
        },
        getDescription : function() {
            return this.get("description")
        },
        getDefaultGridDisplayType : function() {
            return R.Components.Grid.DisplayTypes.LARGE_RECT_GRID
        },
        getRentalPlayWindow : function(a) {
            var b = _.extend({}, this.get("rentalPlayWindows"));
            return b[a]
        },
        getStaticPrices : function() {
            return _.reduce(this.get("prices"), function(a, b, c) {
                        var d = R.Models.Video.PurchaseTypeIds[c];
                        return a[d] = b, a
                    }, {})
        },
        getPrices : function(a, b) {
            R.Api.request({
                        method : "getPriceForRelease",
                        content : {
                            release : this.get("key"),
                            purchaseTypes : _
                                    .keys(R.Models.Video.PurchaseTypes),
                            paymentProfileId : a.get("profileId")
                        },
                        success : function(a) {
                            b(a.result)
                        }
                    })
        },
        purchase : function(a) {
            R.Api.request({
                        method : "purchaseVideoRelease",
                        content : {
                            paymentProfileId : a.paymentProfileId,
                            purchaseType : a.purchaseType,
                            videoRelease : this.get("key")
                        },
                        success : function(b) {
                            R.Payment.purchaseSuccess(b, a)
                        },
                        error : function(b) {
                            R.Payment.purchaseError(b, a)
                        }
                    })
        },
        getCreatorsText : function() {
            var a = this.get("creators"),
                b = a.first(a.length() - 1),
                c = a.last();
            return t({
                        description : "created by",
                        m : "Created by [[ [person] ]](person_url)",
                        v : "Created by [people] and [[ [person] ]](person_url)"
                    }, {
                        creators : b.map(function(a) {
                            return '<a href="' + a.get("url") + '">'
                                    + Bujagali.Utils.escape(a.get("name"))
                                    + "</a>"
                        }).join(", "),
                        creator : Bujagali.Utils.escape(c.get("name")),
                        creator_url : {
                            href : c.get("url")
                        },
                        form : Bujagali.Utils.getGenderForm(a, function(a) {
                                    return "m"
                                })
                    })
        },
        getDirectorsText : function() {
            var a = this.get("directors"),
                b = a.first(a.length() - 1),
                c = a.last();
            return t({
                description : "directed by",
                m : "Directed by [[ [director] ]](director_url)",
                v : "Directed by [directors] and [[ [director] ]](director_url)"
            }, {
                directors : b.map(function(a) {
                    return '<a href="' + a.get("url") + '">'
                            + Bujagali.Utils.escape(a.get("name")) + "</a>"
                }).join(", "),
                director : Bujagali.Utils.escape(c.get("name")),
                director_url : {
                    href : c.get("url")
                },
                form : Bujagali.Utils.getGenderForm(a, function(a) {
                            return "m"
                        })
            })
        },
        getPlayerTitle : function() {
            return this.get("name")
        },
        getTitle : function() {
            return this.get("name")
        },
        isNewRelease : function() {
            var a = Bujagali.Utils.date(this.get("releaseDate")),
                b = new Date;
            return b.setDate(b.getDate() - 7), a > b
        },
        isUnwatched : function() {
            var a = this.get("watchProgress") || 0;
            return a === 0
        },
        canShare : function() {
            return !1
        },
        canPreview : function() {
            return !!this.get("trailerStreamUrl")
        },
        canPurchase : function() {
            return !1
        },
        isExpiring : function() {
            return this.has("expirationDate")
        },
        getExpirationDate : function() {
            return Bujagali.Utils.date(this.get("expirationDate"))
        },
        canRent : function() {
            return !1
        },
        canWatch : function() {
            return !1
        },
        getSegmentDescription : function() {
            return !1
        },
        getPurchaseText : function(a) {
            return a.amount === 0 ? t("Buy for Free") : t("Buy for [amount]", {
                        amount : R.Models.Video.getAmount(a)
                    })
        },
        getPlaybackToken : function(a) {
            var b = this;
            if (!this.has("key"))
                throw new Error("Must have a key to request playback token");
            R.Api.request({
                        method : a.trailer
                                ? "getVideoTrailerPlaybackToken"
                                : "getVideoPlaybackToken",
                        content : {
                            item : this.get("key")
                        },
                        success : function(c) {
                            b.set("playbackToken", c.result), a.success()
                        },
                        error : a.error
                    })
        }
    }, {
        getAmount : function(a) {
            return I18n.currency(a.amount / 100, a.currency)
        },
        PurchaseTypeIds : {
            1 : "HD_VOD",
            2 : "HD_EST",
            3 : "SD_VOD",
            4 : "SD_EST"
        },
        PurchaseTypes : {
            HD_VOD : 1,
            HD_EST : 2,
            SD_VOD : 3,
            SD_EST : 4
        },
        VODPurchaseTypes : [1, 3],
        ESTPurchaseTypes : [2, 4],
        isVODPurchaseType : function(a) {
            return _.contains(R.Models.Video.VODPurchaseTypes, a)
        },
        isESTPurchaseType : function(a) {
            return _.contains(R.Models.Video.ESTPurchaseTypes, a)
        }
    }), R.Models.AdminVideo = R.Models.Video.extend({
        defaults : {
            trailerStreamUrl : "",
            playerAspectRatio : [4, 3]
        },
        getPlaybackToken : function(a) {
            var b = this;
            if (!this.has("assetId"))
                throw new Error("Must have an assetId to request playback token");
            R.Api.request({
                        method : "getAdminVideoPlaybackToken",
                        content : {
                            assetId : this.get("assetId")
                        },
                        success : function(c) {
                            b.set("playbackToken", c.result), a.success()
                        },
                        error : a.error
                    })
        }
    })
}(), function() {
    R.Models.Movie = R.Models.Video.extend({
                canShare : function() {
                    return !0
                },
                canPurchase : function() {
                    return _.size(this.get("prices")) > 0
                },
                canWatch : function() {
                    return !0
                },
                getCreditsUrl : function() {
                    return this.get("url") + "credits/"
                },
                getPurchaseMessage : function() {
                    return t("You're about to purchase a movie.")
                },
                getReleaseYear : function() {
                    var a = this.get("releaseDate");
                    if (a)
                        return Bujagali.Utils.date(a, !0).getFullYear()
                },
                canRent : function() {
                    return !0
                },
                getRentalText : function(a) {
                    return a.amount === 0 ? t("Rent for Free") : t(
                            "Rent for [amount]", {
                                amount : R.Models.Movie.getAmount(a)
                            })
                }
            })
}(), function() {
    R.Models.Episode = R.Models.Video.extend({
                getDefaultGridDisplayType : function() {
                    return _.isEqual(this.get("frameAspectRatio"), [4, 3])
                            ? R.Components.Grid.DisplayTypes.MEDIUM_STANDARD_GRID
                            : R.Components.Grid.DisplayTypes.MEDIUM_LANDSCAPE_GRID
                },
                getSegmentDescription : function() {
                    if (this.has("seasonNumber")
                            && this.has("seasonEpisodeNumber"))
                        return t(
                                "Season [season_number], Episode [episode_number]",
                                {
                                    season_number : this.get("seasonNumber"),
                                    episode_number : this
                                            .get("seasonEpisodeNumber")
                                });
                    if (this.has("seasonNumber"))
                        return t("Season [season_number]", {
                                    season_number : this.get("seasonNumber")
                                });
                    if (this.has("seasonEpisodeNumber"))
                        return t("Episode [episode_number]", {
                                    episode_number : this
                                            .get("seasonEpisodeNumber")
                                })
                },
                getDescription : function() {
                    return this.get("synopsis")
                },
                canWatch : function() {
                    return !0
                },
                getPlayerTitle : function() {
                    return this.get("seriesName")
                },
                canPurchase : function() {
                    return _.size(this.get("prices")) > 0
                }
            })
}(), function() {
    var a = R.Models.ListItem = Backbone.Model.extend({
                getSource : function() {
                    return this.get("source")
                }
            }, {
                unwrap : function(b) {
                    return b instanceof a ? b.getSource() : b
                }
            }),
        b = R.Models.SourceCollection = Backbone.Collection.extend({
                    addSource : function(b, c) {
                        return b = _.isArray(b) ? b : [b], b =
                                _.map(b, function(b) {
                                            return b instanceof a ? b : new a({
                                                        source : b
                                                    })
                                        }), this.add(b, c)
                    },
                    getSourceKeys : function() {
                        return this.map(function(a) {
                                    return a.getSource().get("key")
                                })
                    }
                })
}(), function() {
    var a = ["approved", "pending", "hidden"];
    R.Models.User = R.Models.ObjectModel.extend({
        idAttribute : "key",
        fieldConverter : {
            lastSongPlayed : "loadLastSongPlayed"
        },
        overrides : {
            lastSongPlayed : "lastSongPlayed"
        },
        initialize : function() {
            R.Models.ObjectModel.prototype.initialize.apply(this, arguments), _
                    .bindAll(this, "loadLastSongPlayed")
        },
        getFullName : function(a) {
            var b = this.get("firstName") || "";
            return b !== "" && this.get("lastName") && (b += " "), this
                    .get("lastName")
                    && (b += this.get("lastName")), b = b.trim(), a
                    && (b = Bujagali.Utils.escape(b)), b
        },
        getTwitterId : function() {
            var a =
                    this.has("twitterUrl") ? this.get("twitterUrl").replace(
                            /.+\//, "@") : null;
            return a
        },
        getQueueUrl : function() {
            return this.get("url") + "playing/"
        },
        getHistoryUrl : function() {
            return this.get("url") + "history/"
        },
        getPlaylistsUrl : function() {
            return this.get("url") + "playlists/"
        },
        getReviewsUrl : function() {
            return this.get("url") + "reviews/"
        },
        getFollowingUrl : function() {
            return this.get("url") + "people/following/"
        },
        getFollowersUrl : function() {
            return this.get("url") + "people/followers/"
        },
        getFavoritesUrl : function() {
            return this.get("url") + "favorites/"
        },
        getPurchasesUrl : function(a) {
            return this.get("url") + "purchases/"
        },
        getDefaultSetUrl : function(a) {
            var b = R.Models.Set.getTypeFromShortName(a);
            if (b)
                return this.get("url") + a + "/"
        },
        getSetsUrl : function() {
            return this.get("url") + "sets/"
        },
        getCollectionUrl : function(a, b, c, d) {
            var e = this.get("url") + "collection/";
            return d && (e += d.slice(1)), a && a !== "null"
                    ? e += a + "/"
                    : c == "album" && (c = null), b
                    && (e += "search/" + b + "/"), c
                    && (e += "sort/" + c + "/"), e
        },
        getUserStation : function(a) {
            if (!this.get("stations"))
                return console.warn("User has no stations"), null;
            if (!this._stations) {
                var b = this._stations = {};
                _.each(this.get("stations"), function(a) {
                            b[a.type] = new R.Models.Station(a)
                        })
            }
            return this._stations[a]
        },
        isSelf : function() {
            return this.get("key") == R.currentUser.get("key")
        },
        loadLastSongPlayed : function(a, b) {
            var c = this;
            R.Api.request({
                        method : "get",
                        content : {
                            keys : [b]
                        },
                        success : function(d) {
                            var e = {};
                            e[a] = d.result[b], c.set(e)
                        }
                    })
        },
        lastSongPlayed : function() {
            return R.Utils.convertToModel(this.attributes.lastSongPlayed)
        },
        sendInvites : function(a, b) {
            b = b || {}, _.defaults(b, {
                        message : null,
                        success : R.doNothing,
                        error : R.doNothing
                    }), R.Api.request({
                        method : "sendInvites",
                        content : {
                            contacts : a,
                            message : b.message
                        },
                        success : b.success,
                        error : b.error
                    })
        },
        share : function(a, b, c) {
            c = _.extend({
                        services : "rdio",
                        message : null
                    }, c), a && !_.isArray(a) && (a = [a]);
            if (!b.canShare || !b.canShare()) {
                console.warn("Tried to share an unsharable object:", b);
                return
            }
            var d = [];
            a && (a = _.pluck(_.filter(a, function(a) {
                                return _.isString(a) ? (d.push(a), !1) : !0
                            }), "id")), R.Api.request({
                        method : "shareItem",
                        content : {
                            key : b.get("key"),
                            services : c.services,
                            users : a,
                            emails : d,
                            message : c.message
                        },
                        success : c.success,
                        error : c.error
                    })
        },
        canShareWith : function() {
            if (this.has("followsYou") && this.has("canUnfollow"))
                return this.get("followsYou") === !0
                        && this.get("canUnfollow") === !0;
            throw new Error("User does not have 'followsYou' and 'canUnfollow', these are needed to determine if you can share")
        },
        canChatWith : function() {
            return this.get("followsYou") === !0
                    && this.get("canUnfollow") === !0
                    && this.get("online") === !0
                    && this.getCapability("chat.canChat") === !0
                    && !this.get("disableChat")
        },
        canShare : function() {
            return !0
        },
        follow : function() {
            var a = this,
                b = this.isProtected() ? "pending" : "approved",
                c = this.get("followingState"), d;
            R.Api.request({
                        method : "addFriend",
                        content : {
                            user : this.get("key")
                        },
                        success : function(a) {
                            d = a.result
                        },
                        complete : function() {
                            a.set({
                                        followingState : d ? b : c,
                                        canUnfollow : !0
                                    })
                        }
                    }), this.set({
                        followingState : b,
                        canUnfollow : !0
                    })
        },
        unfollow : function() {
            var a = this, b;
            R.Api.request({
                        method : "removeFriend",
                        content : {
                            user : this.get("key")
                        },
                        success : function(a) {
                            b = a.result
                        },
                        complete : function() {
                            a.set({
                                        followingState : b ? null : a
                                                .get("followingState"),
                                        canUnfollow : !1
                                    })
                        }
                    }), this.set({
                        followingState : null,
                        canUnfollow : !1
                    })
        },
        approve : function() {
            var a = this,
                b = this.get("followerState");
            R.Api.request({
                        method : "approveFollower",
                        content : {
                            user : this.get("key")
                        },
                        success : function(b) {
                            a.set(b.result)
                        },
                        error : function() {
                            a.set("followerState", b)
                        }
                    }), this.set("followerState", "approved")
        },
        unapprove : function() {
            var a = this,
                b = this.get("followerState");
            R.Api.request({
                        method : "unapproveFollower",
                        content : {
                            user : this.get("key")
                        },
                        success : function(b) {
                            a.set(b.result)
                        },
                        error : function() {
                            a.set("followerState", b)
                        }
                    }), this.set("followerState", "pending")
        },
        hide : function() {
            var a = this,
                b = this.get("followerState");
            R.Api.request({
                        method : "hideFollower",
                        content : {
                            user : this.get("key")
                        },
                        success : function(b) {
                            a.set(b.result)
                        },
                        error : function() {
                            a.set("followerState", b)
                        }
                    }), this.set("followerState", "hidden")
        },
        canView : function() {
            var a = this.isProtected();
            return this.isSelf() || !a || a
                    && this.get("followingState") === "approved"
        },
        isProtected : function() {
            return this.get("isProtected") ? !0 : !1
        },
        trackPresence : function() {
            if (!this._trackingPresence) {
                var a = this,
                    b = this.get("key") + "/presence";
                R.Services.ready("PubSub", function() {
                            R.pubSub.subscribe(b, a.onPresenceUpdate, a)
                        }), R.Services.ready("OfflineMonitor", function() {
                            R.offlineMonitor.bind("change",
                                    a._onOnlineStatusChanged, a)
                        }), this._trackingPresence = 1
            } else
                this._trackingPresence++;
            return this
        },
        untrackPresence : function() {
            this._trackingPresence--;
            if (!this._trackingPresence) {
                var a = this.get("key") + "/presence";
                R.pubSub.unsubscribe(a, this.onPresenceUpdate, this), R.offlineMonitor
                        .unbind("change", this._onOnlineStatusChanged, this)
            }
            return this
        },
        onPresenceUpdate : function(a, b) {
            switch (b.event) {
                case "join" :
                    this.set("online", !0);
                    break;
                case "part" :
                    this.set("online", !1);
                    break;
                case "connectionJoin" :
                    this._clients || (this._clients = {}), this._clients[b.id] =
                            b.caps, this.trigger("connectionsChanged");
                    break;
                case "connectionPart" :
                    if (!this._clients)
                        return;
                    this._clients[b.id] && delete this._clients[b.id], this
                            .trigger("connectionsChanged")
            }
        },
        getCapability : function(a, b) {
            b = b || {};
            var c = a.split(".");
            for (var d in this._clients) {
                var e = this._clients[d];
                if (_.isUndefined(e))
                    continue;
                if (b.filter && !b.filter(e))
                    continue;
                var f = this._getCapabilityWithSplit(c.slice(0), e);
                if (!_.isUndefined(f))
                    return f
            }
        },
        _getCapabilityWithSplit : function(a, b) {
            var c = a.shift();
            if (_.has(b, c))
                return _.isObject(b[c]) && a.length > 0 ? this
                        ._getCapabilityWithSplit(a, b[c]) : b[c]
        },
        _onOnlineStatusChanged : function() {
            R.offlineMonitor.isOnline()
                    || (this.set("online", !1), this._clients = {})
        }
    }, {
        profileFields : ["location", "twitterUrl", "facebookUrl", "facebookId",
                "lastfmUrl", "followerCount", "followingCount",
                "playlistCount", "reviewCount", "favoriteCount", "setCount",
                "stations", "followsYou", "albumCount", "username"]
    })
}(), R.Models.CollaborativeModel = R.Models.ObjectModel.extend({
    overrides : {
        subscribers : R.Models.ModelFieldCollection,
        owner : R.Models.User
    },
    extras : ["isSubscribed", "isCollaborating"],
    initialize : function() {
        R.Models.ObjectModel.prototype.initialize.apply(this, arguments), _
                .bindAll(this, "onSubscribersChanged", "onCollaboratorsChanged"), this._requestQueue =
                new R.ApiRequestQueue
    },
    save : function(a, b) {
        var a = a || {},
            b = b || {};
        return _.extend(b, {
                    wait : !0
                }), R.Models.ObjectModel.prototype.save.call(this, a, b)
    },
    isCollaborating : function() {
        if (!this.has("isCollaborating"))
            throw new Error("Model missing attribute 'isCollaborating'.");
        return this.get("isCollaborating")
    },
    isSubscribed : function() {
        if (!this.has("isSubscribed"))
            throw new Error("Model missing attribute 'isSubscribed'.");
        return this.get("isSubscribed")
    },
    isOwner : function() {
        if (!this.get("owner"))
            throw new Error("Model missing attribute 'owner'.");
        if (this.get("owner").get("key") == null)
            throw new Error("Model owner missing attribute 'key'.");
        return this.get("owner").get("key") == R.currentUser.get("key")
    },
    canEdit : function() {
        return this.isOwner() || this.isCollaborating()
    },
    onSubscribersChanged : function(a, b) {
        if (b.key !== R.currentUser.get("key"))
            return;
        b.event == "added" ? this.set({
                    isSubscribed : !0
                }) : b.event == "removed" && this.set({
                    isSubscribed : !1
                })
    },
    onCollaboratorsChanged : function(a, b) {
        if (b.key !== R.currentUser.get("key"))
            return;
        b.event == "added" ? this.set({
                    isCollaborating : !0
                }) : b.event == "removed" && this.set({
                    isCollaborating : !1
                })
    }
}, {
    CollaborationMode : {
        OFF : 0,
        ALL : 1,
        FOLLOWING : 2
    },
    PublishedState : {
        PUBLIC : 0,
        PRIVATE : 1
    }
}), function() {
    R.Models.Playlist = R.Models.CollaborativeModel.extend({
        method : {
            create : "createPlaylist",
            update : "updatePlaylistMetadata",
            "delete" : "deletePlaylist"
        },
        content : {
            create : function() {
                return _.extend({
                            description : ""
                        }, this.attributes)
            },
            update : function() {
                var a =
                        _.pick(this.attributes, "name", "description",
                                "isPublished", "collaborationMode");
                return a.playlist = this.get("key"), a
            },
            "delete" : function() {
                return {
                    playlist : this.get("key")
                }
            }
        },
        parse : function(a) {
            var b;
            return a
                    && a.tracks
                    && (b = new R.Models.SourceCollection([]), b
                            .addSource(a.tracks.models), a.tracks = b), a
        },
        overrides : _.defaults({
            canDownload : "canDownload",
            icon : "icon",
            bigIcon : "bigIcon",
            tracks : function(a, b) {
                var c = new R.Models.SourceCollection([], b);
                return a && a.models ? c.addSource(a.models) : _.isArray(a)
                        && c.add(_.map(a, function(a) {
                                    return new R.Models.ListItem({
                                                source : new R.Models.Track(a.source)
                                            })
                                })), c
            }
        }, R.Models.CollaborativeModel.prototype.overrides),
        fieldConverter : {
            tracks : "onTracksChanged"
        },
        icon : function() {
            return window.devicePixelRatio > 1 && this.attributes.icon400
                    ? this.attributes.icon400
                    : this.attributes.icon
        },
        bigIcon : function() {
            return window.devicePixelRatio > 1 && this.attributes.bigIcon1200
                    ? this.attributes.bigIcon1200
                    : this.attributes.bigIcon
        },
        add : function(a) {
            if (a.get("type") == "a" || a.get("type") == "al"
                    || a.get("type") == "t") {
                var b = null,
                    c = this;
                a.get("type") == "a" || a.get("type") == "al" ? b =
                        a.get("trackKeys") : (b = [a.get("key")], c
                        .has("tracks")
                        && c.get("tracks").addSource(a));
                var d = {
                    method : "addToPlaylist",
                    content : {
                        playlist : this.get("key"),
                        tracks : b,
                        extras : ["-*", "duration", "Playlist.PUBLISHED"]
                    },
                    success : function(a) {
                        a.result && c.set(a.result)
                    }
                };
                this._requestQueue.push(d)
            }
        },
        remove : function(a, b) {
            var c = this,
                d = c.get("tracks");
            c.has("tracks") && c.get("tracks").remove(c.get("tracks").at(b));
            var e = {
                method : "removeFromPlaylist",
                content : {
                    playlist : c.get("key"),
                    index : b,
                    count : 1,
                    tracks : [a.get("key")],
                    extras : ["-*", "duration", "Playlist.PUBLISHED"]
                },
                success : function(a) {
                    a.result && c.set(a.result)
                },
                error : function() {
                    c.set({
                                tracks : d
                            })
                }
            };
            this._requestQueue.push(e)
        },
        setCollaborating : function(a) {
            var b = this,
                c = b.get("collaborating");
            b.set({
                        isCollaborating : a
                    }), R.Api.request({
                        method : "setPlaylistCollaborating",
                        content : {
                            playlist : this.get("key"),
                            collaborating : a
                        },
                        error : function() {
                            b.set({
                                        isCollaborating : c
                                    })
                        }
                    })
        },
        setPlaylistOrder : function() {
            var a = this,
                b = this.get("tracks").map(function(a) {
                            return a.getSource().get("key")
                        });
            R.Api.request({
                        method : "setPlaylistOrder",
                        content : {
                            playlist : this.get("key"),
                            tracks : b,
                            extras : ["-*", "Playlist.PUBLISHED"]
                        },
                        success : function(b) {
                            b.result && a.set(b.result)
                        }
                    })
        },
        canShare : function() {
            return !0
        },
        canDownload : function() {
            return this.has("price") ? this.get("price") !== "None" : (this
                    .addField("price"), this.fetch(), !1)
        },
        getPurchaseMessage : function() {
            return t(
                    ["You're about to purchase a playlist with [num] song.",
                            "You're about to purchase a playlist with [num] songs."],
                    {
                        num : this.get("length")
                    })
        },
        onTracksChanged : function(a, b) {
            var c = this.get("tracks").all(function(a, c) {
                        return a.getSource().get("key") === b[c]
                    }),
                d = this.get("tracks").length === b.length;
            (!c || !d) && this._requestQueue.isEmpty() && this.fetch()
        }
    }, {
        LABELS : {
            NEW : t("New Playlist"),
            CREATE : t("Create Playlist"),
            EDIT : t("Edit Playlist"),
            DELETE : t("Delete Playlist")
        },
        MESSAGES : {
            WARNING : {
                DELETE : t("Are you sure you want to delete this playlist? Once deleted, it can't be recovered.")
            },
            ERROR : {
                DELETE : t("There was a problem deleting this playlist.")
            },
            PRIVACY : {
                PUBLIC_DESCRIPTION : t(
                        "Anyone on [product_name] can see this playlist.", {
                            product_name : R.serverInfo.get("product_name")
                        }),
                PRIVATE_DESCRIPTION : t("Only people with a link can see this playlist.")
            }
        },
        ReasonNotViewable : {
            VIEWABLE : 0,
            USER_PREFERENCE : 1,
            ORDERED_ALBUM : 2,
            TOO_FEW_SONGS : 3
        }
    })
}(), function() {
    R.Models.Set = R.Models.CollaborativeModel.extend({
        method : {
            create : "createCollectionSet",
            update : "updateCollectionSetMetadata",
            "delete" : "deleteCollectionSet"
        },
        content : {
            create : function() {
                return this.attributes
            },
            update : function() {
                var a =
                        _.pick(this.attributes, "name", "description",
                                "collaborationMode");
                return a.collectionSet = this.get("key"), a
            },
            "delete" : function() {
                return {
                    collectionSet : this.get("key")
                }
            }
        },
        overrides : _.extend({
                    items : R.Models.ModelFieldCollection
                }, R.Models.CollaborativeModel.prototype.overrides),
        initialize : function() {
            R.Models.CollaborativeModel.prototype.initialize.apply(this,
                    arguments), this.subscribeToItemKeysChanged()
        },
        destroy : function() {
            this.unsubscribeFromItemKeysChanged(), R.Models.CollaborativeModel.prototype.destroy
                    .apply(this, arguments)
        },
        contains : function(a) {
            return _.contains(this.get("itemKeys"), a.get("key"))
        },
        isUserSet : function() {
            return _.isNull(this.get("setType"))
        },
        isSetOfType : function(a) {
            var b = R.Models.Set.TYPES[a.toUpperCase()];
            return b && b === this.get("setType")
        },
        canEdit : function() {
            var a =
                    R.Models.CollaborativeModel.prototype.canEdit.apply(this,
                            arguments);
            return this.isUserSet() && a
        },
        isType : function(a) {
            var b = R.Models.Set.getTypeFromShortName(a);
            return this.get("setType") === b
        },
        canAdd : function(a) {
            var b = a instanceof R.Models.Set;
            if (this.isType("watchlater")) {
                var c = a instanceof R.Models.Video;
                if (!b && !c)
                    return !1
            }
            if (b) {
                if (!a.isUserSet())
                    return !1;
                if (this.get("key") === a.get("key"))
                    return !1
            }
            return !0
        },
        isEmpty : function() {
            return this.get("itemCount") === 0
        },
        getDisplayName : function() {
            var a = this.get("setType");
            return R.Models.Set.DISPLAY_NAMES[a] || this.get("name")
        },
        getDisplayDescription : function() {
            var a = this.get("description");
            return a ? Bujagali.Utils.enrich(a) : ""
        },
        addItem : function(a) {
            var b = this;
            if (!this.canAdd(a))
                return;
            var c = {
                method : "addToCollectionSet",
                content : {
                    collectionSet : this.get("key"),
                    item : a.get("key"),
                    sortText : a.get("name")
                },
                success : function(a) {
                    var c = a.result;
                    c && b.set(c)
                }
            };
            this._requestQueue.push(c)
        },
        removeItem : function(a) {
            var b = this,
                c = {
                    method : "removeFromCollectionSet",
                    content : {
                        collectionSet : this.get("key"),
                        item : a.get("key")
                    },
                    success : function(a) {
                        var c = a.result;
                        c && b.set(c)
                    }
                };
            this._requestQueue.push(c)
        },
        subscribeToItemKeysChanged : function() {
            if (!this._itemKeysTopic) {
                var a = this;
                this._itemKeysTopic = this.get("key") + "/itemKeys", R.Services
                        .ready("PubSub", function() {
                                    R.pubSub.subscribe(a._itemKeysTopic,
                                            a._onItemKeysChanged, a)
                                })
            }
        },
        unsubscribeFromItemKeysChanged : function() {
            if (this._itemKeysTopic) {
                var a = this;
                R.Services.ready("PubSub", function() {
                            R.pubSub.unsubscribe(a._itemKeysTopic,
                                    a._onItemKeysChanged, a)
                        })
            }
        },
        _onItemKeysChanged : function(a, b) {
            var c = b.event,
                d = b.item_key;
            if (this.has("itemKeys"))
                switch (c) {
                    case "added" :
                        var e = _.clone(this.get("itemKeys"));
                        e.push(d), this.set("itemKeys", e);
                        break;
                    case "removed" :
                        var e = _.without(this.get("itemKeys"), d);
                        this.set("itemKeys", e);
                        break;
                    case "emptied" :
                        this.set("itemKeys", [])
                }
        }
    }, {
        LABELS : {
            NEW : t("New Set"),
            CREATE : t("Create Set"),
            EDIT : t("Edit Set"),
            DELETE : t("Delete Set")
        },
        MESSAGES : {
            WARNING : {
                DELETE : t("Are you sure you want to delete this set? Once deleted, it can't be recovered.")
            },
            ERROR : {
                DELETE : t("There was a problem deleting this set.")
            },
            PRIVACY : {
                PUBLIC_DESCRIPTION : t(
                        "Anyone on [product_name] can see this set.", {
                            product_name : R.serverInfo.get("product_name")
                        }),
                PRIVATE_DESCRIPTION : t("Only people with a link can see this set.")
            }
        },
        TYPES : {
            FAVORITES : 1,
            WATCHLATER : 2
        },
        DISPLAY_NAMES : {
            1 : t("Favorites"),
            2 : t("Watch Later")
        },
        getTypeFromShortName : function(a) {
            if (a)
                return this.TYPES[a.toUpperCase()]
        }
    })
}(), function() {
    R.Models.LibraryCollection = function(a) {
        this._user = a, this._offline = {}, this._online = {}, _.bindAll(this,
                "_refreshCollection");
        var b = this;
        R.Services.ready("Storage", function() {
                    b._load()
                }), R.Services.ready("PubSub", function() {
                    b._user.trackField("libraryVersion"), b._user.bind(
                            "change:libraryVersion", b._refreshCollection), R.pubSub
                            .bind("reconnect", b._refreshCollection)
                })
    }, _.extend(R.Models.LibraryCollection.prototype, Backbone.Events, {
        getKeysFromModel : function(a) {
            return a instanceof R.Models.Playlist
                    || a instanceof R.Models.Track
                    ? [a.get("key")]
                    : a instanceof R.Models.Album && a.has("trackKeys") ? a
                            .get("trackKeys") : []
        },
        _keysForCollection : function(a, b, c) {
            var d,
                e = c ? this.offlineContains : this.contains,
                f = this;
            return a instanceof R.Model ? d = this.getKeysFromModel(a) : d = a, _
                    .filter(d, function(a) {
                                return b ? !e.call(f, a) : e.call(f, a)
                            })
        },
        contains : function(a) {
            return this._searchForKeys(a, !1)
        },
        offlineContains : function(a) {
            return this._searchForKeys(a, !0)
        },
        getSummary : function(a) {
            var b = a;
            a instanceof R.Model && (b = this.getKeysFromModel(a)), b instanceof Array
                    || (b = [b]);
            var c = this,
                d = _.filter(b, function(a) {
                            return c.contains([a])
                        });
            return {
                inCollection : d,
                setOffline : _.filter(d, function(a) {
                            return c.offlineContains([a])
                        })
            }
        },
        add : function(a) {
            this._triggerLibraryChange(a, !0, !1, "addToCollection")
        },
        remove : function(a) {
            this._triggerLibraryChange(a, !1, !1, "removeFromCollection")
        },
        offlineAdd : function(a) {
            this._triggerLibraryChange(a, !0, !0, "setAvailableOffline")
        },
        offlineRemove : function(a) {
            this._triggerLibraryChange(a, !1, !0, "setAvailableOffline")
        },
        isOfflineEmpty : function() {
            return _.isEmpty(this._offline)
        },
        _triggerLibraryChange : function(a, b, c, d) {
            var e = this, f,
                g = this._keysForCollection(a, b, c);
            if (!g.length)
                return;
            _.each(g, function(a) {
                        c ? b
                                ? (delete e._online[a], e._offline[a] = !0)
                                : (delete e._offline[a], e._online[a] = !0) : b
                                ? e._online[a] = !0
                                : (delete e._offline[a], delete e._online[a])
                    }), this._saveLibrary(), this.trigger("changed", g), f = {
                keys : g
            }, c && (f.offline = b), R.Api.request({
                        method : d,
                        content : f
                    })
        },
        _saveLibrary : function() {
            try {
                R.storage.preserveIfNoSpace("/library/version"), R.storage
                        .setItem("/library/version", this._version), R.storage
                        .setItem("/library/offline", _.keys(this._offline)), R.storage
                        .setItem("/library/online", _.keys(this._online))
            } catch (a) {
                R.Utils.logException("Unable to save library", a), R.storage
                        .removeItem("/library/version")
            }
        },
        _load : function() {
            if (R.currentUser.isAnonymous()) {
                this._version = -1, this._online = {}, this._offline = {}, this._loaded =
                        !0;
                return
            }
            this._version = R.storage.getItem("/library/version"), this._version
                    ? (this._offline =
                            this._dict(R.storage.getItem("/library/offline")), this._online =
                            this._dict(R.storage.getItem("/library/online")), this._loaded =
                            !0, this._refreshCollection())
                    : (this._version = -1, this._refreshCollection())
        },
        _refreshCollection : function() {
            var a = this;
            R.Api.request({
                method : "getKeysInCollection",
                content : {
                    version : this._version
                },
                success : function(b) {
                    var c = b.result;
                    c.version != a._version
                            && (a._version = c.version, a._offline =
                                    a._dict(c.offline), a._online =
                                    a._dict(c.online), a._saveLibrary()), a._loaded =
                            !0, a.trigger("loaded")
                }
            })
        },
        _searchForKeys : function(a, b) {
            if (_.isUndefined(a) || !this._loaded)
                return !1;
            a instanceof R.Model && (a = this.getKeysFromModel(a)), a instanceof Array
                    || (a = [a]);
            for (var c = 0; c < a.length; c++) {
                var d = a[c];
                if (b) {
                    if (!this._offline[d])
                        return !1
                } else if (!this._online[d] && !this._offline[d])
                    return !1
            }
            return !0
        },
        _dict : function(a) {
            var b = {};
            return _.each(a, function(a) {
                        b[a] = !0
                    }), b
        }
    })
}(), function() {
    R.Models.PaymentProfile = R.Model.extend({
                idAttribute : "profileId",
                method : {
                    "delete" : function() {
                        return this.isPending()
                                ? "deletePendingPaymentProfile"
                                : "deletePaymentProfile"
                    }
                },
                content : {
                    "delete" : function() {
                        return {
                            profileId : this.get("profileId")
                        }
                    }
                },
                getDisplayName : function() {
                    var a = this.get("lastFour"),
                        b = this.get("profileTypeName"),
                        c = this.get("expirationDate") || new Date,
                        d = "";
                    return a
                            ? this.isOi()
                                    ? d =
                                            t(
                                                    "[type] for number ending with [lastFour]",
                                                    {
                                                        type : b,
                                                        lastFour : a
                                                    })
                                    : this.isPaypal() ? d =
                                            t("PayPal account for [email]", {
                                                        email : this
                                                                .get("paypalEmail")
                                                    })
                                            : this.isPending()
                                                    ? d =
                                                            t(
                                                                    "Unverified: [type] for number ending with [lastFour]",
                                                                    {
                                                                        type : b,
                                                                        lastFour : a
                                                                    })
                                                    : (d =
                                                            t(
                                                                    "[type] ending in [lastFour]",
                                                                    {
                                                                        type : b,
                                                                        lastFour : a
                                                                    }), c <= new Date
                                                            ? d +=
                                                                    " "
                                                                            + t(
                                                                                    "expired [expiration]",
                                                                                    {
                                                                                        expiration : R.Date
                                                                                                .formatCreditCardDate(c)
                                                                                    })
                                                            : d +=
                                                                    " "
                                                                            + t(
                                                                                    "expires [expiration]",
                                                                                    {
                                                                                        expiration : R.Date
                                                                                                .formatCreditCardDate(c)
                                                                                    }))
                            : d += this.get("profileTypeName"), this
                            .get("defaultProfile")
                            && (d += " (" + t("default") + ")"), d
                },
                isNew : function() {
                    Backbone.Model.prototype.isNew.call(this)
                },
                isWallet : function() {
                    return this.get("profileShortName") === "wallet"
                },
                isOi : function() {
                    return this.get("profileShortName") === "oi"
                },
                isPaypal : function() {
                    return this.get("profileShortName") === "paypal"
                },
                isPending : function() {
                    return this.get("profileShortName") === "oiPending"
                },
                canExpire : function() {
                    return this.has("expirationDate")
                            && this.get("profileShortName") !== "amazon"
                },
                isExpiring : function() {
                    if (!this.canExpire())
                        return !1;
                    var a = new Date,
                        b = Bujagali.Utils.date(this.get("expirationDate"));
                    return a.getMonth() === b.getMonth()
                            && a.getFullYear() === b.getFullYear()
                },
                isExpired : function() {
                    if (!this.canExpire())
                        return !1;
                    var a = Bujagali.Utils.date(this.get("expirationDate"));
                    a.setMonth(a.getMonth() + 1), a.setMilliseconds(-1);
                    var b = new Date;
                    return a < b
                }
            }), R.Models.PaymentProfiles = R.Models.SimpleCollection.extend({
                model : R.Models.PaymentProfile,
                method : "getPaymentProfiles",
                initialize : function() {
                    R.Models.SimpleCollection.prototype.initialize.apply(this,
                            arguments);
                    if (!R.currentUser.isAnonymous()) {
                        var a = this;
                        this.loading = !0, this.fetch({
                                    success : function() {
                                        a.loading = !1
                                    }
                                })
                    }
                },
                comparator : function(a, b) {
                    return a && a.isWallet() ? 1 : b && b.isWallet() ? -1 : a
                            .get("profileId") > b.get("profileId") ? 1 : -1
                },
                getDefault : function() {
                    return this.find(function(a) {
                                return a.get("defaultProfile")
                            })
                }
            })
}(), function() {
    var a = 200;
    R.Models.SearchSuggestionsModel = R.Models.SimpleCollection.extend({
        method : "searchSuggestions",
        initialize : function(b, c) {
            this.options = c, this._debounceFetch =
                    _.debounce(this._debounceFetch, a)
        },
        content : function(a) {
            return _.extend({
                        query : this.searchTerm,
                        types : this.options.types,
                        extras : ["location", "username", "directors",
                                "squareIcon", "itemCount", "seasonCount",
                                "episodeCount"],
                        countryCode : R.Utils.value(this.options.countryCode)
                    }, a)
        },
        shouldFetch : function() {
            return this.searchTerm && this.searchTerm.length > 1
        },
        cancelFetch : function() {
            this.pendingFetch
                    && (this.pendingFetch.abort(), this.pendingFetch = null)
        },
        _debounceFetch : function() {
            this.cancelFetch(), this.shouldFetch()
                    && (this.pendingFetch = this.fetch())
        },
        setSearchTerm : function(a) {
            this.searchTerm != a
                    && (this.searchTerm = a, this.shouldFetch() ? this
                            ._debounceFetch() : this.reset())
        },
        parse : function(a) {
            return a.items = R.Utils.convertToModels(a.items), R.Models.SimpleCollection.prototype.parse
                    .call(this, a)
        }
    }), R.Models.SearchModel = R.Models.SearchSuggestionsModel.extend({
                method : "search"
            })
}(), function() {
    R.Models.SearchPageModel = R.Models.SparseCollection.extend({
                method : "search",
                content : function(a) {
                    return _.extend({
                                query : this.options.searchTerm,
                                types : this.options.types,
                                extras : ["location", "username", "stations",
                                        "description", "followerCount",
                                        "followingCount", "favoriteCount",
                                        "setCount"]
                            }, a)
                }
            }), R.Models.HeavyRotation = R.Models.SparseCollection.extend({
                method : function() {
                    return this._loadTopAlbums
                            ? "getTopCharts"
                            : "getHeavyRotation"
                },
                initialize : function() {
                    this._loadTopAlbums = !1, this
                            .bind("loaded", this.onLoaded), this.bind("reset",
                            this.onReset)
                },
                onLoaded : function() {
                    this.options.allowTopAlbums && !this.length()
                            && !this._loadTopAlbums
                            && (this._loadTopAlbums = !0, this.fetch())
                },
                onReset : function() {
                    this._loadTopAlbums = !1
                },
                content : function(a) {
                    return this._loadTopAlbums ? _.extend({
                                type : "Album",
                                count : 15
                            }, a) : _.extend({
                                friends : this.options.friends,
                                user : this.options.userKey,
                                count : this.options.count,
                                type : this.options.type
                            }, a)
                }
            }), R.Models.NewReleasesModel = R.Models.SparseCollection.extend({
                method : "getNewReleases",
                content : function(a) {
                    return _.extend({
                                type : this.options.type
                            }, a)
                }
            })
}(), function() {
    R.Models.TopCharts = R.Models.SparseCollection.extend({
                method : "getTopCharts",
                content : function(a) {
                    return _.extend({
                                type : this.options.type,
                                count : this.options.count
                            }, a)
                }
            });
    var a = R.Model.extend({
                overrides : {
                    owner : R.Models.User,
                    playlist : R.Models.Playlist
                }
            });
    R.Models.RecentActivityPageModel = R.Models.SparseCollection.extend({
                appendOnly : !0,
                model : a,
                method : "getActivityStream",
                hasFetchedToEnd : function() {
                    return this.lastId === 0
                },
                prepModel : function(a) {
                    return _.indexOf([6, 7, 8, 9], a.update_type) != -1
                            ? new R.Models.Comment(a)
                            : R.Models.SparseCollection.prototype.prepModel
                                    .apply(this, arguments)
                },
                content : function(a) {
                    return _.extend({
                                user : this.options.user,
                                scope : this.options.scope
                            }, a)
                },
                parse : function(a, b) {
                    return this.lastId = a.last_id, a.updates ? a.updates : []
                },
                reset : function() {
                    this.lastId = null, R.Models.SparseCollection.prototype.reset
                            .apply(this, arguments)
                }
            })
}(), function() {
    R.Models.Series = R.Models.Video.extend({
                overrides : _.defaults({
                            episodes : R.Models.ModelFieldCollection,
                            seasons : R.Models.ModelFieldCollection.extend({
                                        extras : ["SeasonRelease.DETAILS",
                                                "EpisodeRelease.DETAILS"]
                                    })
                        }, R.Models.Video.prototype.overrides),
                getSegmentDescription : function(a) {
                    if (a)
                        return t(["[num] Episode", "[num] Episodes"], {
                                    num : this.get("purchasedEpisodeCount")
                                            || 0
                                });
                    if (this.has("seasonCount"))
                        return t(["[num] Season", "[num] Seasons"], {
                                    num : this.get("seasonCount")
                                })
                },
                isUnwatched : function() {
                    return this.has("seasons") ? this.get("seasons").any(
                            function(a) {
                                return a.isUnwatched()
                            }) : !1
                },
                isNewRelease : function() {
                    return this.has("seasons") ? this.get("seasons").any(
                            function(a) {
                                return a.isNewRelease()
                            }) : !1
                },
                canShare : function() {
                    return !0
                },
                getCreditsUrl : function() {
                    return this.get("url") + "credits/"
                },
                getStartYear : function() {
                    return this.get("startDate") ? Bujagali.Utils.date(
                            this.get("startDate"), !0).getFullYear() : null
                },
                getEndYear : function() {
                    return this.get("endDate") ? Bujagali.Utils.date(
                            this.get("endDate"), !0).getFullYear() : null
                }
            })
}(), function() {
    R.Models.Contributor = R.Models.ObjectModel.extend({
        overrides : {
            actorAssociations : R.Models.ModelFieldCollection,
            writerAssociations : R.Models.ModelFieldCollection,
            directorAssociations : R.Models.ModelFieldCollection,
            creatorAssociations : R.Models.ModelFieldCollection,
            producerAssociations : R.Models.ModelFieldCollection,
            screenwriterAssociations : R.Models.ModelFieldCollection
        },
        canShare : function() {
            return !1
        },
        getAssociationString : function() {
            var a = _.reduce(this.get("associations"), function(a, b) {
                        var c = a ? ", " : "";
                        switch (b) {
                            case "Actor" :
                                return a + c + t("Actor");
                            case "Director" :
                                return a + c + t("Director");
                            case "Writer" :
                                return a + c + t("Writer");
                            case "Producer" :
                                return a + c + t("Producer");
                            case "Creator" :
                                return a + c + t("Creator");
                            default :
                                return console
                                        .error(
                                                "Unknown association in Contributor model: %s",
                                                b), a
                        }
                    }, "");
            return a
        }
    })
}(), function() {
    R.Models.Season = R.Models.Video.extend({
        overrides : {
            episodes : R.Models.ModelFieldCollection.extend({
                        parse : function() {
                            var a =
                                    R.Models.ModelFieldCollection.prototype.parse
                                            .apply(this, arguments);
                            return this._parentModel.has("episodeCount")
                                    && this.limit(this._parentModel
                                            .get("episodeCount")), a
                        }
                    })
        },
        getSegmentDescription : function(a) {
            if (a)
                return t(["[num] Episode", "[num] Episodes"], {
                            num : this.get("purchasedEpisodeCount") || 0
                        });
            if (this.has("episodeCount"))
                return t(["[num] Episode", "[num] Episodes"], {
                            num : this.get("episodeCount")
                        })
        },
        isUnwatched : function() {
            return this.has("episodes") ? this.get("episodes").any(function(a) {
                        return a.isUnwatched()
                    }) : !1
        },
        isNewRelease : function() {
            return this.has("episodes") ? this.get("episodes").any(function(a) {
                        return a.isNewRelease()
                    }) : R.Models.Video.prototype.isNewRelease.apply(this,
                    arguments)
        },
        canPurchase : function() {
            return _.size(this.get("prices")) > 0
        },
        getTitle : function() {
            return t("[series], [season]", {
                        series : this.get("seriesName"),
                        season : this.get("name")
                    })
        },
        getPurchaseText : function(a) {
            return a.amount === 0 ? t("Buy Season for Free") : t(
                    "Buy Season for [amount]", {
                        amount : R.Models.Season.getAmount(a)
                    })
        }
    })
}(), function() {
    R.Models.Studio = R.Models.ObjectModel.extend({
                overrides : {
                    content : R.Models.ModelFieldCollection
                }
            })
}(), function() {
    R.Models.Network = R.Models.ObjectModel.extend({
                overrides : {
                    content : R.Models.ModelFieldCollection
                }
            })
}(), function() {
    R.Models.Genre = R.Models.ObjectModel.extend({
                overrides : {
                    movies : R.Models.ModelFieldCollection,
                    series : R.Models.ModelFieldCollection,
                    url : "url"
                },
                url : function() {
                    return this.has("urlScope") ? "/" + this.get("urlScope")
                            + this.attributes.url : null
                }
            })
}(), function() {
    R.Models.FeaturedCollection = R.Model.extend({
                method : {
                    read : "getFeaturedCollection",
                    update : "saveEditorialCollection"
                },
                content : {
                    read : function() {
                        return {
                            contentType : this.get("type"),
                            region : this.get("region")
                        }
                    },
                    update : function() {
                        return {
                            region : this.get("region"),
                            collection : this.get("key"),
                            name : this.get("name"),
                            content : this.get("content").pluck("key")
                        }
                    }
                }
            }), R.Models.EditorialCollectionSearch =
            R.Models.SearchSuggestionsModel.extend({
                        method : "editorialCollectionSearchSuggestions",
                        initialize : function(a) {
                            R.Models.SearchSuggestionsModel.prototype.initialize
                                    .apply(this, arguments), this._region =
                                    a.region
                        },
                        content : function(a) {
                            return _.extend({
                                        query : this.searchTerm,
                                        region : this._region
                                    }, a)
                        },
                        parse : function(a) {
                            return R.Models.SimpleCollection.prototype.parse
                                    .call(this, a)
                        },
                        setRegion : function(a) {
                            this._region = a
                        },
                        getRegion : function() {
                            return this._region
                        }
                    })
}(), function() {
    R.Models.Track = R.Models.ObjectModel.extend({
                canShare : function() {
                    return !0
                },
                getPurchaseMessage : function() {
                    return t("You're about to purchase a song.")
                },
                isVariousArtists : function() {
                    return this.get("artistKey") === R.serverInfo
                            .get("various_artist_key")
                }
            }), R.Models.TrackCollection = R.Models.SparseCollection.extend({
                model : R.Models.Track
            })
}(), function() {
    R.Models.UserPrefs = R.Model.extend({
        initialize : function(a, b) {
            var c = this;
            this._changedFields = [], this._reverseNameConversionTable = {}, _
                    .each(this._nameConversionTable, function(a, b) {
                                c._reverseNameConversionTable[a] = b
                            }), a
                    && (this._convertFieldNames(a), this.attributes = a), R.Model.prototype.initialize
                    .apply(this, arguments), this.bind("change",
                    this._onPropertyChanged, this)
        },
        method : {
            create : "savePref"
        },
        content : {
            create : function(a) {
                var b = this,
                    c = {};
                return _.each(this._changedFields, function(a) {
                            c[b._convertLongName(a)] = b.get(a)
                        }), this._changedFields = [], {
                    prefs : JSON.stringify(c)
                }
            }
        },
        _nameConversionTable : {
            sawSyncDialog : "s_sd",
            v_collection_artists_sidebar : "v_cas",
            disableChat : "dc",
            fbShareWatch : "fb_w",
            fbShareFavorite : "fb_f",
            fbShareSets : "fb_s"
        },
        _convertLongName : function(a) {
            return _.has(this._nameConversionTable, a)
                    ? this._nameConversionTable[a]
                    : a
        },
        _onPropertyChanged : function() {
            if (this._dontSave)
                return;
            this._changedFields =
                    _.uniq(this._changedFields.concat(_.keys(this
                            .changedAttributes())))
        },
        fieldUpdates : function(a) {
            this._dontSave = !0, this._convertFieldNames(a), this.set(a), this._dontSave =
                    !1
        },
        _convertFieldNames : function(a) {
            _.each(this._reverseNameConversionTable, function(b, c) {
                        _.has(a, c) && (a[b] = a[c], delete a[c])
                    })
        }
    }), R.Models.CurrentUser = R.Models.User.extend({
        overrides : {
            prefs : R.Models.UserPrefs
        },
        initialize : function() {
            var a = this;
            R.Models.User.prototype.initialize.apply(this, arguments), R.Services
                    .ready("PubSub", function() {
                                R.pubSub.subscribe(R.pubSub.userTopic(), _
                                                .bind(a.onPrivatePubSubMessage,
                                                        a))
                            }), this.trackPresence()
        },
        onPrivatePubSubMessage : function(a, b) {
            b.event
                    && b.event == "changed"
                    && b.fields
                    && (_.has(b.fields, "prefs") ? this.get("prefs")
                            .fieldUpdates(b.fields.prefs) : this
                            .onFieldsChanged(a, b))
        },
        onDestroyed : function() {
            R.pubSub.unsubscribe(R.pubSub.userTopic(),
                    this.onPrivatePubSubMessage), this.untrackPresence()
        },
        isAnonymous : function() {
            return this.get("isAnonymous")
        }
    })
}(), function() {
    R.Payment = {
        waitForAsyncPaymentComplete : function(a, b) {
            var c = function(c) {
                R.Api.request({
                            method : "getAmazonChargeStatus",
                            content : {
                                caller_ref : a
                            },
                            success : function(a) {
                                c(a)
                            },
                            error : function() {
                                b.error && b.error()
                            }
                        })
            },
                d = function(a) {
                    var e = a.result;
                    !e.success || e.error ? b.error && b.error() : e.charged
                            ? b.success && b.success()
                            : setTimeout(function() {
                                        c(d)
                                    }, 3e3)
                };
            c(d)
        },
        purchaseSuccess : function(a, b) {
            var c;
            a.result
                    && (c = a.result, c.async
                            ? R.Payment.waitForAsyncPaymentComplete(
                                    c.ref.caller_ref, b)
                            : b.success && b.success(c))
        },
        purchaseError : function(a, b) {
            b.error && b.error(a)
        }
    }, R.Models.CollectionsBaseModel = R.Models.SimpleCollection.extend({
        _requiredFields : [],
        content : function() {
            return {
                extras : this._requiredFields
            }
        },
        initialize : function(a, b) {
            R.Models.SimpleCollection.prototype.initialize.apply(this,
                    arguments), _.bindAll(this, "onPubSubUpdate"), b.parentModel
                    .isAnonymous()
                    || this.fetch()
        },
        onPubSubUpdate : function(a, b) {
            var c = this,
                d = this.findByKey(b.key),
                e = "Model for key " + b.key + " was not found.";
            if (b.event === "added") {
                if (d)
                    return;
                d = new this.model({
                            key : b.key
                        }, {
                            isNew : !0,
                            extras : this._requiredFields || []
                        }), d.fetch({
                            success : function(a) {
                                var d = c.findByKey(b.key);
                                if (d)
                                    return;
                                c.add(a, {
                                            at : 0
                                        })
                            },
                            error : function() {
                                console.error(e)
                            }
                        })
            } else if (b.event === "removed") {
                if (!d)
                    return;
                c.remove(d)
            }
        }
    });
    var a = R.Models.SimpleCollection.extend({
        model : R.Models.User,
        method : "userFollowing",
        _requiredUserFields : ["-*", "key", "firstName", "lastName", "icon",
                "url", "playlistCount", "disableChat", "followingState"],
        initialize : function(a, b) {
            R.Models.SimpleCollection.prototype.initialize.apply(this,
                    arguments), _.bindAll(this, "onFollowingChanged"), b.parentModel
                    .get("followingCount")
                    && !b.parentModel.isAnonymous() && this.fetch()
        },
        comparator : function(a) {
            var b = Bujagali.Utils.escape(a.getFullName());
            return b ? b.toLowerCase() : ""
        },
        content : function() {
            return {
                user : R.currentUser.get("key"),
                count : R.currentUser.get("followingCount"),
                extras : this._requiredUserFields
            }
        },
        onFollowingChanged : function(a, b) {
            var c = this,
                d = b.event, e;
            if (d == "added")
                e = new R.Models.User({
                            key : b.key
                        }, {
                            isNew : !0,
                            extras : this._requiredUserFields
                        }), e.fetch({
                            success : function(a) {
                                if (c.get(a.id))
                                    return;
                                c.add(a)
                            },
                            error : function() {
                                console.error("User for key " + b.key
                                        + " was not found.")
                            }
                        });
            else if (d == "removed") {
                e = c.get(b.key);
                if (!e) {
                    console.error("User for key " + b.key + " was not found.");
                    return
                }
                c.remove(e)
            }
        },
        online : function() {
            return this.filter(function(a) {
                        return a.get("online")
                    })
        },
        offline : function() {
            return this.filter(function(a) {
                        return !a.get("online")
                    })
        }
    });
    R.Models.CurrentUser.Racoon = R.Models.CurrentUser.extend({
        extras : function() {
            return ["availableBalance", "unreadNotificationsCount",
                    "acceptedTOS"]
        },
        initialize : function() {
            _.extend(this.overrides, {
                        following : a,
                        paymentProfiles : R.Models.PaymentProfiles
                    });
            var b = this;
            R.Models.CurrentUser.prototype.initialize.apply(this, arguments), R.Services
                    .ready("PubSub", function() {
                                b.trackField(["availableBalance",
                                        "unreadNotificationsCount"])
                            })
        },
        getFeedUrl : function() {
            var a = this.get("prefs").get("v_feed");
            return a ? "/" + a + "/" : "/"
        },
        getChartsUrl : function() {
            var a = this.get("prefs").get("v_charts"),
                b = "/browse/charts/";
            return a ? b + a + "/" : b
        },
        getPendingFollowersUrl : function() {
            return this.getFollowersUrl() + "pending/"
        },
        addFriends : function(a, b) {
            if (!_.isArray(a) || !a.length)
                return;
            R.Api.request({
                        method : "addFriends",
                        content : {
                            users : a
                        },
                        success : function() {
                            _.isFunction(b) && b()
                        }
                    })
        },
        getNewReleasesUrl : function() {
            var a = this.get("prefs").get("v_releases"),
                b = "/browse/new/";
            return a ? b + a + "/" : b
        },
        getCollectionUrl : function(a, b, c, d) {
            var e = this.get("prefs");
            a = a || e.get("v_collection");
            var f = e.get("v_collection_sort");
            return a == "songs" && (f = e.get("v_collection_sort_songs")), c =
                    c || f, R.Models.User.prototype.getCollectionUrl.call(this,
                    a, b, c, d)
        },
        setProtected : function() {
            return R.Api.request({
                        method : "setAccountPrivacy",
                        content : {
                            privacy : "protected"
                        }
                    })
        },
        setPublic : function() {
            return R.Api.request({
                        method : "setAccountPrivacy",
                        content : {
                            privacy : "public"
                        }
                    })
        },
        isProtected : function() {
            return this.get("prefs").get("pr") ? !0 : !1
        },
        canPayWithAccountCredit : function(a) {
            var b = this.get("availableBalance");
            return b && a > 0 && a <= b.amount
        },
        hasPurchased : function(a, b) {
            return R.Api.request({
                        method : "hasPurchased",
                        content : {
                            item : a
                        },
                        success : function(a) {
                            a && a.result && a.result.purchased ? b(!0) : b(!1)
                        },
                        error : function() {
                            b(!1)
                        }
                    })
        },
        mustResolvePayment : function() {
            return this.get("hasSubscriptionFailure")
                    || this.get("hasOutstandingPurchase")
        },
        services : function() {
            return new Backbone.Collection([{
                        id : "suggested",
                        name : t("Suggested users")
                    }, {
                        id : "facebook",
                        name : "Facebook",
                        hasKey : "has_facebook",
                        hasInviteMode : !0,
                        url : R.serverInfo.get("urls").oauthFacebook
                    }, {
                        id : "twitter",
                        name : "Twitter",
                        hasKey : "has_twitter",
                        url : R.serverInfo.get("urls").oauthTwitter
                    }, {
                        id : "lastfm",
                        name : "last.fm",
                        hasKey : "has_lastfm",
                        url : R.serverInfo.get("urls").oauthLastfm,
                        hasFriends : !1
                    }, {
                        id : "gmail",
                        name : "Gmail",
                        url : R.serverInfo.get("urls").oauthGmailStart,
                        email : !0
                    }, {
                        id : "yahoo",
                        name : "Yahoo",
                        url : R.serverInfo.get("urls").oauthYahooStart,
                        email : !0
                    }, {
                        id : "aol",
                        name : "Aol",
                        email : !0
                    }, {
                        id : "live",
                        name : "Hotmail",
                        url : R.serverInfo.get("urls").oauthLiveStart,
                        email : !0
                    }, {
                        id : "email",
                        name : t("Invite by email")
                    }])
        }
    })
}(), function() {
    R.Models.Album = R.Models.ObjectModel.extend({
        overrides : {
            canDownload : "canDownload",
            icon : "icon",
            bigIcon : "bigIcon"
        },
        icon : function() {
            return window.devicePixelRatio > 1 && this.attributes.icon400
                    ? this.attributes.icon400
                    : this.attributes.icon
        },
        bigIcon : function() {
            return window.devicePixelRatio > 1 && this.attributes.bigIcon1200
                    ? this.attributes.bigIcon1200
                    : this.attributes.bigIcon
        },
        canShare : function() {
            return !0
        },
        canDownload : function() {
            return this.get("price") !== "None"
        },
        getPurchaseMessage : function() {
            return t(
                    ["You're about to purchase an album with [num] song.",
                            "You're about to purchase an album with [num] songs."],
                    {
                        num : this.get("length")
                    })
        },
        isVariousArtists : function() {
            var a = R.serverInfo.get("various_artist_key");
            return this.get("artistKey") === a
                    || this.get("rawArtistKey") === a
        },
        getAlbumKey : function() {
            return this.get("albumKey") || this.get("key")
        }
    }), R.Models.AlbumCollection = R.Models.SparseCollection.extend({
                model : R.Models.Album
            })
}(), function() {
    R.Models.Label = R.Models.ObjectModel.extend({
                getArtistsPageUrl : function() {
                    return this.get("url") + "artists/"
                },
                getAlbumsPageUrl : function(a, b) {
                    var c = "";
                    return a && (c += "sort/" + a + "/"), b
                            && (c += "search/" + b + "/"), this.get("url") + c
                },
                hasRadio : function() {
                    return this.has("radioKey")
                },
                getStation : function(a) {
                    if (!this.has("radioKey"))
                        return;
                    return {
                        type : a,
                        key : this.get("radioKey")
                    }
                }
            })
}(), function() {
    R.Models.LabelPage = R.Models.Label.extend({
                extras : ["albumCount", "artistCount", "hasIcon", "playCount"],
                getHeaderTabs : function() {
                    return [{
                                name : t("Albums"),
                                url : this.get("url")
                            }, {
                                name : t("Artists"),
                                url : this.getArtistsPageUrl()
                            }]
                }
            }), R.Models.LabelPageAlbumsModel =
            R.Models.MusicCollection.extend({
                        model : R.Models.Album,
                        method : "getAlbumsForLabel",
                        sortPreferenceName : "v_artist_albums_sort",
                        content : function(a) {
                            return _
                                    .extend(
                                            {
                                                label : this.options.label
                                            },
                                            R.Models.FilterableCollection.prototype.content
                                                    .call(this, a))
                        }
                    }), R.Models.PopularArtistsModel =
            R.Models.SparseCollection.extend({
                model : R.Models.Artist,
                method : "getArtistsForLabel",
                content : function(a) {
                    var b = {
                        label : this.options.label
                    };
                    return this.options.count && (b.count = this.options.count), _
                            .extend(b, a)
                }
            })
}(), function() {
    R.Models.Artist = R.Models.ObjectModel.extend({
        getAlbumsPageUrl : function(a, b) {
            var c = "";
            return a && (c += "sort/" + a + "/"), b
                    && (c += "search/" + b + "/"), this.get("url") + "albums/"
                    + c
        },
        getSongsPageUrl : function(a, b) {
            var c = "";
            return a && (c += "sort/" + a + "/"), b
                    && (c += "search/" + b + "/"), this.get("url") + "songs/"
                    + c
        },
        getBioPageUrl : function() {
            return this.get("url") + "biography/"
        },
        getRelatedArtistsUrl : function() {
            return this.get("url") + "related/"
        },
        getManageUrl : function() {
            return this.get("url") + "manage/"
        },
        hasRadio : function() {
            return this.has("radioKey")
        },
        getHeaderTabs : function() {
            return [{
                        name : t("Albums"),
                        url : this.getAlbumsPageUrl(),
                        visible : !!this.get("albumCount")
                    }, {
                        name : t("Songs"),
                        url : this.getSongsPageUrl(),
                        visible : !!this.get("length")
                    }, {
                        name : t("Biography"),
                        url : this.getBioPageUrl(),
                        visible : this.get("hasReview")
                    }, {
                        name : t("Related Artists"),
                        url : this.getRelatedArtistsUrl(),
                        visible : this.hasRelatedArtists()
                    }]
        },
        getStation : function(a) {
            var b = this.get("stations");
            if (!b)
                return;
            return b[a]
        },
        hasRelatedArtists : function() {
            return this.get("hasRelatedArtists")
                    || this.get("hasInfluentialArtists")
                    || this.get("hasInfluencedArtists")
        },
        canShare : function() {
            return !0
        },
        getHeaderModel : function() {
            return new Backbone.Model({
                        name : t("[artistName] - Artist Program Dashboard", {
                                    artistName : this.get("name")
                                })
                    })
        },
        getArtistProgramUrl : function(a) {
            var b = Backbone.history.getFragment(),
                c = "manage/",
                d = "/" + b.substring(0, b.lastIndexOf(c) + c.length);
            return d + a
        },
        getArtistProgramTabs : function() {
            var a = [{
                url : "http://help.rdio.com/customer/portal/topics/279717-artist-program/articles",
                name : t("Help"),
                type : "right",
                className : "help"
            }, {
                url : this.getArtistProgramUrl(""),
                name : t("Statistics")
            }, {
                url : this.getArtistProgramUrl("links"),
                name : t("Referral Links")
            }];
            return this.hasPermission("manageusers") && a.push({
                        url : this.getArtistProgramUrl("photo"),
                        name : t("Cover Photo")
                    }), a
        },
        hasPermission : function(a) {
            var b = this.get("account");
            return _.isObject(b) ? _.include(b.permissions, a) : !1
        }
    }, {
        VARIOUS_ARTIST_KEY : R.serverInfo.get("various_artist_key"),
        catalogFields : ["albumCount", "hasIcon", "hasReview",
                "hasRelatedArtists", "hasInfluentialArtists",
                "hasInfluencedArtists", "playCount", "stations",
                "coverPhotoUrl", "bandMembers", "inProgram",
                "bannerBackgroundColor", "type", "bannerAlignment",
                "User.followerCount"],
        artistProgramFields : ["account", "affiliateLinks", "bandMembers",
                "coverPhotoUrl", "bannerBackgroundColor", "bannerAlignment",
                "User.followerCount"]
    })
}(), function() {
    R.Models.Comment = R.Model.extend({
        overrides : {
            commenter : "commenter",
            dateLastEdited : "dateLastEdited",
            commentedItem : "commentedItem"
        },
        method : {
            create : "createComment",
            update : "editComment",
            "delete" : "deleteComment"
        },
        content : {
            create : function() {
                return {
                    object : this.get("commentedItem").get("key"),
                    text : this.get("comment")
                }
            },
            update : function() {
                return {
                    comment : this.get("key"),
                    text : this.get("comment")
                }
            },
            "delete" : function() {
                return {
                    comment : this.get("key")
                }
            }
        },
        commenter : function() {
            return this._commenter
                    || (this.attributes.commenter
                            ? this._commenter =
                                    new R.Models.User(this.attributes.commenter)
                            : this.attributes.owner
                                    && (this._commenter =
                                            new R.Models.User(this.attributes.owner))), this._commenter
        },
        commentedItem : function() {
            return this._commentedItem
                    || (this.attributes.commentedItem
                            ? this._commentedItem =
                                    R.Utils
                                            .convertToModel(this.attributes.commentedItem)
                            : this.attributes.reviewed_item
                                    && (this._commentedItem =
                                            R.Utils
                                                    .convertToModel(this.attributes.reviewed_item))), this._commentedItem
        },
        dateLastEdited : function() {
            if (this.attributes.dateLastEdited)
                return this.attributes.dateLastEdited;
            if (this.attributes.date)
                return this.attributes.date
        },
        isOwner : function() {
            var a = this.get("commenter");
            return a && a.get("key") == R.currentUser.get("key")
        }
    })
}(), function() {
    R.Models.ArtistPageAlbumModel = R.Models.MusicCollection.extend({
                model : R.Models.Album,
                method : "getAlbumsForArtist",
                sortPreferenceName : "v_artist_albums_sort",
                content : function(a) {
                    return _.extend({
                                artist : this.options.artist.get("key"),
                                count : 6
                            }, R.Models.FilterableCollection.prototype.content
                                    .call(this, a))
                }
            }), R.Models.ArtistSongsModel = R.Models.MusicCollection.extend({
                model : R.Models.Track,
                method : "getTracksForArtist",
                sortPreferenceName : "v_artist_songs_sort",
                content : function(a) {
                    return _.extend({
                                artist : this.options.artist.get("key"),
                                count : 10
                            }, R.Models.FilterableCollection.prototype.content
                                    .call(this, a))
                }
            }), R.Models.SimilarArtistsModel =
            R.Models.SparseCollection.extend({
                        model : R.Models.Artist,
                        method : "getRelatedArtists",
                        content : function(a) {
                            return _.extend({
                                        artist : this.options.key,
                                        extras : ["stations"]
                                    }, a)
                        }
                    })
}(), function() {
    R.Models.Station = R.Models.ObjectModel.extend({
                isArtistStation : function() {
                    if (_.include(["tr", "rr"], this.get("type")))
                        return !0
                }
            })
}(), function() {
    R.Models.Subscription = Backbone.Model.extend({
        initialize : function() {
            var a = this.get("type"),
                b = R.serverInfo.get("prices"),
                c = {
                    cost : b[a]
                };
            this.isFamilyPlan()
                    && (c.plusOne = b.familyPlusOne, c.subaccount =
                            b.familySubaccount), this.set(c, {
                        silent : !0
                    })
        },
        getPurchaseMessage : function() {
            return this.isFamilyPlan()
                    && this.has("familySlots")
                    && this.get("familySlots") > R.Models.Subscription.INITIAL_FAMILY_SLOTS
                    ? t("You're about to add a subscription to your family plan.")
                    : t("You're about to purchase a subscription to [product_name].")
        },
        isFamilyPlan : function() {
            return this.get("type") == "family"
        },
        familySubaccountPercentDiscount : function(a) {
            if (!this.isFamilyPlan() || !a)
                return "0%";
            var b = R.serverInfo.get("prices").unlimited,
                c = 0;
            return a == 2 && (c = this.get("cost") - b), a == 3
                    && (c = this.get("plusOne") - this.get("cost")), I18n
                    .percent(1 - c / b)
        },
        purchase : function(a, b) {
            R.Api.request({
                        method : "purchaseSubscription",
                        content : {
                            paymentId : a,
                            subscriptionObject : JSON
                                    .stringify(this.attributes)
                        },
                        success : function(a) {
                            R.Payment.purchaseSuccess(a, b)
                        },
                        error : function(a) {
                            R.Payment.purchaseError(a, b)
                        }
                    })
        }
    }, {
        INITIAL_FAMILY_SLOTS : 1
    })
}(), function() {
    R.Models.NotificationItem = R.Model.extend({
                overrides : {
                    user : R.Models.User,
                    notifier : R.Models.User,
                    item : "item",
                    playlist : R.Models.Playlist,
                    comment : R.Models.Comment,
                    track : R.Models.Track
                },
                item : function(a) {
                    return R.Utils.convertToModel(this.attributes[a])
                }
            }), R.Models.UserNotification = R.Model.extend({
                overrides : {
                    data : "data"
                },
                data : function() {
                    return new (R.Models.ModelFieldCollection.extend({
                                model : R.Models.NotificationItem
                            }))(_.map(this.attributes.data.models, function(a) {
                                        return a.toJSON()
                                    }), {
                                parentModel : this,
                                parentProperty : "data"
                            })
                }
            }), R.Models.UserNotifications = R.Models.SparseCollection.extend({
        appendOnly : !0,
        model : R.Models.UserNotification,
        method : "getNotifications",
        content : function(a) {
            return _.extend({
                        extras : ["Playlist.description"]
                    }, a)
        },
        hasFetchedToEnd : function() {
            return !this.lastId
        },
        parse : function(a) {
            return this.lastId = a.lastSeenId, R.Models.SparseCollection.prototype.parse
                    .apply(this, arguments)
        },
        reset : function() {
            this.lastId = null, R.Models.SparseCollection.prototype.reset
                    .apply(this, arguments)
        }
    })
}(), function() {
    R.Models.GiftCertificate = R.Models.ObjectModel.extend({
        getPurchaseMessage : function() {
            return t(
                    "You're about to purchase a [amount] Rdio Gift Certificate. Your credit card will be charged and your gift will be emailed to the recipient.",
                    {
                        amount : I18n.currency(this.get("amount"), this
                                        .get("currency"))
                    })
        },
        purchase : function(a, b) {
            R.Api.request({
                        method : "purchaseGiftcard",
                        content : {
                            paymentProfile : a,
                            amount : this.get("amount"),
                            currency : this.get("currency"),
                            email : this.get("recipient_email"),
                            sendersName : this.get("sender_name"),
                            message : this.get("message")
                        },
                        success : function(a) {
                            R.Payment.purchaseSuccess(a, b)
                        },
                        error : function(a) {
                            R.Payment.purchaseError(a, b)
                        }
                    })
        },
        validate : function(a) {
            var b =
                    ["sender_name", "recipient_email", "verify_email",
                            "currency", "amount"],
                c = {};
            return _.each(b, function(b) {
                        a[b] || (c[b] = [t("Field can't be empty")])
                    }), !c.recipient_email
                    && !R.Utils.isValidEmail(a.recipient_email)
                    && (c.recipient_email = [t("Invalid email")]), a["recipient_email"] != a["verify_email"]
                    && (c.verify_email = [t("Emails do not match")]), !c.amount
                    && a["amount"] == "other"
                    && (a.other_amount
                            ? a.other_amount.match(/^\d+(\.\d{1,2})?$/)
                                    || (c.other_amount =
                                            [t("Amount must be a number")])
                            : c.other_amount = [t("Must specify an amount")]), _
                    .isEmpty(c) ? null : c
        }
    })
}(), function() {
    R.Models.RecentConsumersModel = R.Models.SparseCollection.extend({
                model : R.Models.User,
                method : "getRecentConsumers",
                content : function(a) {
                    return _.extend({
                                key : this.options.key,
                                count : this.options.count,
                                preferNetwork : !0
                            }, a)
                }
            })
}(), function() {
    R.Models.DeveloperAppInfo = Backbone.Model.extend({
                method : "getApplicationInfo",
                content : function(a) {
                    return _.extend({
                                client_id : this.get("client_id")
                            }, a)
                }
            })
}(), function() {
    var a = R.Models.CollectionsBaseModel.extend({
                model : R.Models.Playlist,
                method : "getPlaylists",
                _requiredFields : ["-*", "type", "key", "name", "lastUpdated",
                        "url", "isCollaborating", "isSubscribed", "owner",
                        "shortUrl", "length"],
                pubSubTopicName : "playlists",
                content : function() {
                    var a =
                            R.Models.CollectionsBaseModel.prototype.content
                                    .apply(this, arguments);
                    return _.extend(a, {
                                ordered_list : !0
                            })
                },
                parse : function(a) {
                    return a.items = _.uniq(a.items, !1, function(a) {
                                return a.key
                            }), R.Models.SimpleCollection.prototype.parse.call(
                            this, a)
                }
            });
    R.Models.SubscriptionInfo = R.Model.extend({
        overrides : {
            familyMembers : R.Models.ModelFieldCollection.extend({
                        model : R.Models.User
                    }),
            familyInvited : R.Models.ModelFieldCollection,
            paymentProfile : R.Models.PaymentProfile
        },
        checkExpirationStatus : function() {
            var a = this.get("paymentProfile"),
                b = "/settings/subscription/", c;
            R.notifications.clear({
                        namespace : "cc-notices"
                    }), a.isExpired()
                    ? (R.currentUser.get("hasSubscriptionFailure")
                            ? c =
                                    t(
                                            "Your credit card has expired. [product_name] will only play 30-second clips until you [[ update your payment details ]](paymentUrl).",
                                            {
                                                paymentUrl : b
                                            })
                            : c =
                                    t(
                                            "Your credit card has expired, so your subscription can't be renewed. [[ Update payment details ]](paymentUrl) to keep your subscription.",
                                            {
                                                paymentUrl : b
                                            }), R.notifications.notify("alert",
                            {
                                notificationType : "error",
                                priority : R.notifications.PRIORITY.HIGH,
                                namespace : "cc-notices",
                                showClose : !1,
                                content : c
                            }))
                    : a.isExpiring() && R.notifications.notify("alert", {
                        notificationType : "alert",
                        namespace : "cc-notices",
                        showClose : !0,
                        content : t(
                                "Your credit card expires soon. Please [[ update your payment details ]](paymentUrl)",
                                {
                                    paymentUrl : b
                                })
                    })
        }
    }), R.Models.CurrentUser.Rdio = R.Models.CurrentUser.Racoon.extend({
        extras : function() {
            return R.Models.CurrentUser.Racoon.prototype.extras.apply(this,
                    arguments).concat(["compSubscriptionType", "compEndDate",
                    "subscriptionInfo", "hasSubscriptionFailure", "isFree",
                    "isFreeExpired", "freeRemaining", "freeRefreshDate",
                    "isTrial", "trialEndDate", "hasOutstandingPurchase",
                    "artistAccountArtists"])
        },
        initialize : function() {
            _.bindAll(this, "checkSubscriptionStatus", "checkExpirationStatus"), _
                    .extend(this.overrides, {
                                playlists : a,
                                artistAccountArtists : R.Models.ModelFieldCollection,
                                accountType : "accountType",
                                offlineEnabled : "offlineEnabled",
                                availableSubscriptions : "availableSubscriptions",
                                subscriptionInfo : R.Models.SubscriptionInfo
                            }), R.Models.CurrentUser.Racoon.prototype.initialize
                    .apply(this, arguments);
            var b = this;
            R.Services.ready("PubSub", function() {
                        b.trackField(["isFree", "isFreeExpired",
                                "freeRemaining", "freeRefreshDate"]), b
                                .trackField(["hasSubscriptionFailure",
                                        "subscriptionInfo"])
                    }), this.collection = new R.Models.LibraryCollection(this), this
                    .checkSubscriptionStatus(), this.on(
                    "change:subscriptionInfo change:hasSubscriptionFailure",
                    this.checkSubscriptionStatus), _.defer(_.bind(
                    this._updateCanStreamHere, this)), this
                    .on(
                            "change:isFree change:freeRemaining change:subscriptionType change:isTrial change:trialEndDate",
                            this._updateCanStreamHere, this)
        },
        getTOSAgreed : function() {
            var a = this.get("prefs");
            return a.has("rdioTermsAgreed") ? a.get("rdioTermsAgreed") : !0
        },
        availableSubscriptions : function() {
            if (!this._availableSubscriptions) {
                var a = R.serverInfo.get("availableSubscriptionTypes"),
                    b = _.map(a, function(a) {
                                return new R.Models.Subscription(a)
                            });
                this._availableSubscriptions = new Backbone.Collection(b)
            }
            return this._availableSubscriptions
        },
        compareSub : function(a, b) {
            var c = this.availableSubscriptions().pluck("type"),
                d = _.indexOf(c, a) - _.indexOf(c, b);
            return d === 0 ? 0 : d < 0 ? -1 : 1
        },
        getSubscription : function(a) {
            return this.availableSubscriptions().find(function(b) {
                        return b.get("type") == a
                    })
        },
        isInComp : function() {
            if (!this.get("compSubscriptionType"))
                return !1;
            var a = this.get("compEndDate");
            if (!a)
                return !0;
            var b = Bujagali.Utils.date(a),
                c = new Date;
            return b > c
        },
        isInLimitedComp : function() {
            return this.isInComp() && !!this.get("compEndDate")
        },
        compedAccountType : function() {
            return this.isInComp() ? R.Utils.subNameForSubType(this
                    .get("compSubscriptionType")) : null
        },
        isFree : function() {
            return this.get("isFree")
        },
        isFreeExpired : function() {
            return this.get("isFreeExpired") ? !0 : !1
        },
        isFreeEmpty : function() {
            return this.isFree() && this.get("freeRemaining") === 0
        },
        isInTrial : function() {
            if (!this.get("isTrial") || this.isSubscribed())
                return !1;
            var a = this.getTrialEndDate();
            return a ? a > new Date : !0
        },
        hasExpiredTrial : function() {
            if (!this.get("trialEndDate"))
                return !1;
            var a = Bujagali.Utils.date(this.get("trialEndDate"));
            return a ? new Date(a) < new Date : !1
        },
        accountType : function() {
            if (this.isAnonymous())
                return "anonymous";
            if (this.isFree())
                return "freeLimited";
            if (this.isInTrial())
                return "trial";
            if (this.isInFamilyPlan())
                return "familyMember";
            var a = null;
            return this.isInComp() ? a = this.compedAccountType() : this
                    .isSubscribed()
                    && (a = this.subscribedAccountType()), a == "family"
                    && (a = "familyMaster"), a ? a : "expired"
        },
        upgradeAvailable : function(a) {
            var b = this.get("availableSubscriptions").pluck("type");
            return !!b[_.indexOf(b, a) + 1]
        },
        offlineEnabled : function() {
            return _.contains(["unlimited", "trial", "familyMaster",
                            "familyMember"], this.get("accountType"))
        },
        getCurrentSubscriptionModel : function() {
            var a = R.currentUser.getSubscription(this.subscribedAccountType());
            return a.get("type") == "family"
                    && a.set("familySlots", this.get("subscriptionInfo")
                                    .get("familySlots")), a
        },
        isSubscribed : function() {
            var a = this.get("subscriptionInfo");
            return a ? a.has("subscriptionType")
                    && a.get("subscriptionType") > 0 : !1
        },
        isPayingForSubscription : function() {
            return this.isSubscribed() && !this.isInComp()
        },
        getTrialEndDate : function() {
            return Bujagali.Utils.date(this.get("trialEndDate"))
        },
        getNextSubscriptionBillDate : function() {
            var a = this.get("subscriptionInfo");
            return !a || !a.get("nextBillDate") ? null : Bujagali.Utils.date(a
                    .get("nextBillDate"))
        },
        isInFamilyPlan : function() {
            var a = this.get("subscriptionInfo");
            return a ? a.get("isInFamilyPlan") : !1
        },
        canCancelSubscription : function() {
            var a = this.get("subscriptionInfo");
            return a ? this.isSubscribed() && a.has("cancelSubscription")
                    && !a.get("cancelSubscription") : !1
        },
        isSubscriptionCancelled : function() {
            var a = this.get("subscriptionInfo");
            return a ? this.isSubscribed() && a.has("cancelSubscription")
                    && a.get("cancelSubscription") : !1
        },
        isSubscriptionLocked : function() {
            var a = this.get("subscriptionInfo");
            return a ? a.get("isLocked") : !1
        },
        subscribedAccountType : function() {
            if (!this.has("subscriptionInfo"))
                return null;
            var a = this.get("subscriptionInfo"),
                b = a.get("subscriptionType"),
                c = a.get("provider");
            if (b)
                return c && c == "familyplan" ? "familyMember" : R.Utils
                        .subNameForSubType(b)
        },
        isUpgrade : function(a) {
            return R.currentUser.compareSub(this.subscribedAccountType(), a) === -1
        },
        isDowngrade : function(a) {
            return R.currentUser.compareSub(this.subscribedAccountType(), a) === 1
        },
        canDowngradeToSubscription : function(a) {
            return this.isDowngrade(a)
                    ? this.subscribedAccountType() == "family"
                            ? this.get("subscriptionInfo").get("familySlots") == R.Models.Subscription.INITIAL_FAMILY_SLOTS
                            : !0
                    : !1
        },
        canAddFamilyMembers : function() {
            return this.subscribedAccountType() == "family"
                    && !this.isSubscriptionCancelled()
        },
        usedSlots : function() {
            var a = this.get("subscriptionInfo");
            if (!a)
                return null;
            if (!a.has("familyInvited") || !a.has("familyMembers"))
                throw new Error('Tried calling SubscriptionInfo.usedSlots without "familyInvited" and "familyMembers" fields present.');
            return a.get("familyMembers").length()
                    + a.get("familyInvited").length()
        },
        freeSlots : function() {
            var a = this.get("subscriptionInfo");
            if (!a)
                return null;
            if (!a.has("familySlots") || !a.has("familyInvited")
                    || !a.has("familyMembers"))
                throw new Error('Tried calling SubscriptionInfo.freeSlots without "familyInvited", "familyMembers", and "familySlots" fields present.');
            return a.get("familySlots") - a.get("familyMembers").length()
                    - a.get("familyInvited").length()
        },
        resendInvite : function(a) {
            R.Api.request({
                        method : "resendFamilyPlanInvite",
                        content : {
                            email : a
                        }
                    })
        },
        removeInvited : function(a) {
            var b = this;
            R.Api.request({
                        method : "removeInvitedFamilyPlanMember",
                        content : {
                            email : a,
                            extras : ["subscriptionInfo"]
                        },
                        success : function(a) {
                            b.set(a.result)
                        }
                    })
        },
        removeMember : function(a) {
            var b = this;
            R.Api.request({
                        method : "removeFamilyPlanMember",
                        content : {
                            user : a,
                            extras : ["subscriptionInfo"]
                        },
                        success : function(a) {
                            b.set(a.result)
                        }
                    })
        },
        cancelSubscription : function(a, b) {
            R.Api.request({
                        method : "cancelSubscription",
                        content : {
                            reasons : a
                        },
                        success : function() {
                            b && b()
                        }
                    })
        },
        checkSubscriptionStatus : function() {
            clearInterval(this._pollerId), this.isPayingForSubscription()
                    && (this.checkExpirationStatus(), this._pollerId =
                            setInterval(this.checkExpirationStatus, 36e5))
        },
        checkExpirationStatus : function() {
            var a = this;
            R.Services.ready("Notifications", function() {
                        a.get("subscriptionInfo").checkExpirationStatus()
                    })
        },
        getArtistAccountArtist : function(a) {
            if (this.has("artistAccountArtists")) {
                var b = this.get("artistAccountArtists").find(function(b) {
                            return b.get("url") === "/artist/" + a + "/"
                        });
                if (b)
                    return b.addFields(R.Models.Artist.artistProgramFields), b
            }
            return !1
        },
        _updateCanStreamHere : function() {
            var a = this.get("subscriptionType");
            this.isFreeEmpty() ? a = 0 : this.isInTrial() && (a = 2), this.set(
                    {
                        canStreamHere : a >= 2
                                || !R.playerRequiresUnlimitedToStream()
                                && a === 1
                    })
        }
    })
}();
