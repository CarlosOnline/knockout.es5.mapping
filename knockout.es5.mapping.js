var Knockout;
(function (Knockout) {
    (function (es5) {
        /// <reference path="references.ts
        (function (mapping) {
            var TrackOptions = (function () {
                function TrackOptions() {
                    this.name = "";
                    this.fields = [];
                    this.referenceFields = [];
                }
                return TrackOptions;
            })();
            mapping.TrackOptions = TrackOptions;
        })(es5.mapping || (es5.mapping = {}));
        var mapping = es5.mapping;
    })(Knockout.es5 || (Knockout.es5 = {}));
    var es5 = Knockout.es5;
})(Knockout || (Knockout = {}));

var Knockout;
(function (Knockout) {
    (function (mapping) {
        function getType(x) {
            if ((x) && (typeof (x) === "object")) {
                if (x.constructor === Date)
                    return "date";
                if (x.constructor === Array)
                    return "array";
            }
            return typeof x;
        }

        var Track = (function () {
            function Track(root, name, fields, referenceFields) {
                if (typeof fields === "undefined") { fields = []; }
                if (typeof referenceFields === "undefined") { referenceFields = []; }
                this.root = root;
                this.mapped = [];
                this.track(root, name, "", fields, referenceFields);
                this.clearAllMapped();
            }
            Track.prototype.track = function (source, name, indent, fields, referenceFields) {
                if (typeof name === "undefined") { name = null; }
                if (typeof indent === "undefined") { indent = ""; }
                if (typeof fields === "undefined") { fields = []; }
                if (typeof referenceFields === "undefined") { referenceFields = []; }
                var _this = this;
                if (source == null || this.isMapped(source))
                    return;
                if (name == null)
                    name = this.name(source);

                //console.log(indent, "track: " + name + "--------------------------------");
                indent += "   ";
                var keys = [];
                var computed = [];
                this.setMapped(source);

                for (var key in source) {
                    if (!this.isTrackableField(key)) {
                        continue;
                    }

                    if (-1 != referenceFields.indexOf(key)) {
                        keys.push(key);
                        continue;
                    }

                    if (fields.length > 0) {
                        if (-1 != fields.indexOf(key)) {
                            keys.push(key);
                        }
                        continue;
                    }

                    var value = source[key];
                    var type = getType(value);

                    switch (type) {
                        case "array":
                        case "string":
                        case "number":
                        case "boolean":
                            //console.log(indent, name + "." + key, type);
                            keys.push(key);
                            break;

                        case "function":
                            if (this.isComputed(value)) {
                                //console.log(indent, "f> " + name + "." + key, type);
                                computed.push({
                                    name: key,
                                    fn: value
                                });
                            }
                            break;

                        case "object":
                            if (this.isProperty(value)) {
                                this.makeProperty(source, key, value);

                                continue;
                            }

                            if (value == null || this.isMapped(value) || !isTrackableObject(value)) {
                                // track the variable as a pointer to underlying data
                                //console.log(indent, "p> " + name + "." + key, type, this.name(value));
                                keys.push(key);
                                continue;
                            }

                            // nested tracking
                            //console.log(indent, "o> " + name + "." + key, type, this.name(value));
                            this.track(value, key, indent += "   ");
                            break;

                        default:
                            break;
                    }
                }

                if (keys.length > 0) {
                    try  {
                        ko.track(source, keys);
                    } catch (ex) {
                        console.log("ko.track ex", key, value);
                    }
                }

                if (computed.length > 0) {
                    computed.forEach(function (item) {
                        _this.makeComputed(source, item.name, item.fn);
                    });
                }
            };

            Track.prototype.name = function (value) {
                if (value == null || value.__proto__ === undefined)
                    return "";
                var xtor = value.__proto__.constructor;
                return xtor !== undefined && xtor.name != undefined ? xtor.name : "";
            };

            Track.prototype.isTrackable = function (value) {
                if (value == null)
                    return true;
                var proto = Object.getPrototypeOf(value);
                if (proto == null || proto.constructor == undefined)
                    return false;
                var xtor = proto.constructor;
                return xtor.name === undefined || xtor.name === "Object";
            };

            Track.prototype.isTrackableField = function (key) {
                return key != "__ko_mapping__" && key != "__tracked__";
            };

            Track.prototype.isMapped = function (value) {
                return (value != null && value.__tracked__ === true);
            };

            Track.prototype.setMapped = function (value) {
                if (value == null || this.isMapped(value))
                    return;
                value.__tracked__ = true;
                this.mapped.push(value);
            };

            Track.prototype.clearAllMapped = function () {
                this.mapped.forEach(function (value) {
                    delete value["__tracked__"];
                });
                this.mapped = [];
            };

            Track.prototype.isComputed = function (value) {
                return (value != null && value["__ko_es5_computed__"] === true);
            };

            Track.prototype.isProperty = function (value) {
                return (value != null && value["__ko_es5_property___"] === true);
            };

            Track.prototype.makeComputed = function (container, name, fn) {
                var nameOverride = fn["__ko_es5_computed_name__"];
                if (nameOverride !== undefined && nameOverride !== "") {
                    name = nameOverride;
                    delete fn["__ko_es5_computed_name__"];
                }

                if (name === undefined || name == "") {
                    console.log("Error. Function missing name", fn);
                    return;
                }
                try  {
                    var callback = fn;
                    if (container !== this.root) {
                        var rootThis = this.root;
                        callback = function () {
                            return fn.bind(rootThis)();
                        };
                    }
                    ko.defineProperty(container, name, callback);
                } catch (ex) {
                    //console.log(name, ex);
                }
                delete fn["__ko_es5_computed__"];
            };

            Track.prototype.makeProperty = function (container, name, value) {
                var nameOverride = value["__ko_es5_computed_name__"];
                if (nameOverride !== undefined && nameOverride !== "") {
                    name = nameOverride;
                    delete value["__ko_es5_computed_name__"];
                }

                if (name === undefined || name == "") {
                    console.log("Error. Function missing name", value);
                    return;
                }
                try  {
                    // TODO: Use this override
                    /*
                    var callback = fn;
                    if (container !== this.root) {
                    var rootThis = this.root;
                    callback = function () { return fn.bind(rootThis)(); };
                    }
                    */
                    Object.defineProperty(container, name, value);
                } catch (ex) {
                    //console.log(name, ex);
                }
                delete value["__ko_es5_property__"];
            };
            return Track;
        })();
        mapping.Track = Track;

        function isTrackableObject(value) {
            var proto = Object.getPrototypeOf(value);
            if (proto == null)
                return true;
            var xtor = proto.constructor;
            if (xtor == undefined)
                return true;
            if (xtor.name != undefined)
                return xtor.name == "Object";
            var func = xtor.toString();
            return (-1 != func.toString().indexOf("function Object("));
        }
        mapping.isTrackableObject = isTrackableObject;

        function track(root, name, fields, referenceFields) {
            new Track(root, name, fields, referenceFields);
            return root;
        }
        mapping.track = track;

        function trackOptions(root, options) {
            options = options || new Knockout.es5.mapping.TrackOptions();
            new Track(root, options.name, options.fields, options.referenceFields);
            return root;
        }
        mapping.trackOptions = trackOptions;

        function getObservable(root, name) {
            var observable = ko.getObservable(root, name);
            if (observable != null)
                return observable;
            observable = Object.getOwnPropertyDescriptor(root, name).get;
            return observable || null;
        }
        mapping.getObservable = getObservable;

        function computed(fn, name) {
            if (typeof name === "undefined") { name = null; }
            fn["__ko_es5_computed__"] = true;
            if (name || false) {
                fn["__ko_es5_computed_name__"] = true;
            }
            return fn;
        }
        mapping.computed = computed;

        function property(getCallback, setCallback) {
            return {
                get: getCallback || function () {
                    //throw Error("property get not implemented");
                },
                set: setCallback || function (value) {
                    //throw Error("property set not implemented");
                    //return <T> null;
                },
                __ko_es5_property___: true
            };
        }
        mapping.property = property;
    })(Knockout.mapping || (Knockout.mapping = {}));
    var mapping = Knockout.mapping;

    if (ko.es5 == undefined) {
        ko.es5 = {
            mapping: {
                computed: Knockout.mapping.computed,
                property: Knockout.mapping.property,
                track: Knockout.mapping.track,
                trackOptions: Knockout.mapping.trackOptions,
                getObservable: Knockout.mapping.getObservable,
                isTrackableObject: Knockout.mapping.isTrackableObject
            }
        };
    }
})(Knockout || (Knockout = {}));
//# sourceMappingURL=knockout.es5.mapping.js.map
