/// <reference path="references.ts
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
            function Track(root) {
                this.root = root;
                this.mapped = [];
                this.track(root);
                //this.clearAllMapped();
            }
            Track.prototype.track = function (source, name, indent) {
                if (typeof name === "undefined") { name = null; }
                if (typeof indent === "undefined") { indent = ""; }
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
                                console.log(indent, "x> " + name + "." + key, type, this.name(value));
                                continue;
                            }

                            if (value == null || this.isMapped(value) || !this.isTrackable(value)) {
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
                        //console.log(key, value);
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
                if (value == null || value.__proto__ === undefined)
                    return true;
                var xtor = value.__proto__.constructor;
                return xtor.name === "Object";
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
                this.mapped.unshift();
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
                    //console.log("Error. Function missing name", fn);
                    return;
                }
                try  {
                    var rootThis = this.root;
                    var rootedFn = function () {
                        return fn.bind(rootThis)();
                    };
                    ko.defineProperty(container, name, rootedFn);
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
                    //console.log("Error. Function missing name", fn);
                    return;
                }
                try  {
                    var prop = Object.defineProperty(container, name, value);
                    container[name] = prop;
                } catch (ex) {
                    //console.log(name, ex);
                }
                delete value["__ko_es5_property__"];
            };
            return Track;
        })();
        mapping.Track = Track;

        function track(root, name, fields) {
            // TODO: handle name & fields
            new Track(root);
            return root;
        }
        mapping.track = track;

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
                track: Knockout.mapping.track
            }
        };
    }
})(Knockout || (Knockout = {}));
//# sourceMappingURL=knockout.es5.mapping.js.map
