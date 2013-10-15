/// <reference path="references.ts

module Knockout.es5.mapping {
    export class TrackOptions {
        name = "";
        fields: Array<string> = [];
        referenceFields: Array<string> = [];
    }
}

interface KnockoutStatic {
    es5: {
        mapping: {
            computed<T>(fn: Function, name?: string): T;
            property<T>(getCallback?: () => T, setCallback?: (value: T) => void): T;
            track<T>(root: T, name?: string, fields?: Array<string>, referenceFields?: Array<string>): T;
            trackOptions<T>(root: T, options: Knockout.es5.mapping.TrackOptions): T;
        }
    };
}

module Knockout {
    export module mapping {
        function getType(x) {
            if ((x) && (typeof (x) === "object")) {
                if (x.constructor === Date) return "date";
                if (x.constructor === Array) return "array";
            }
            return typeof x;
        }

        export class Track<T> {
            mapped = [];

            constructor(private root: any, name: string, fields: Array<string> = [], referenceFields: Array<string> = []) {
                this.track(root, name, "", fields, referenceFields);
                this.clearAllMapped();
            }

            track<T>(source: T, name: string = null, indent= "", fields: Array<string> = [], referenceFields: Array<string> = []) {
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
                        //console.log(indent, "skipping: " + name + "." + key, type);
                        continue;
                    }

                    // automatically add referenceFields - no traversal
                    if (-1 != referenceFields.indexOf(key)) {
                        keys.push(key);
                        continue;
                    }

                    // only do the specified fields if specified
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
                                //console.log(indent, "x> " + name + "." + key, type, this.name(value));
                                continue;
                            }

                            //console.log(indent, name + "." + key, type);
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
                            //console.log(indent, "unknown " + name + "." + key, type);
                            break;
                    }
                }

                if (keys.length > 0) {
                    try {
                        ko.track(source, keys);
                    } catch (ex) {
                        //console.log(key, value);
                    }
                }

                if (computed.length > 0) {
                    computed.forEach((item) => {
                        this.makeComputed(source, item.name, item.fn);
                    });
                }
            }

            private name(value) {
                if (value == null || value.__proto__ === undefined)
                    return "";
                var xtor = value.__proto__.constructor;
                return xtor !== undefined && xtor.name != undefined ? xtor.name : "";
            }

            private isTrackable(value) {
                if (value == null || value.__proto__ === undefined)
                    return true;
                var xtor = value.__proto__.constructor;
                return xtor.name === "Object";
            }

            private isTrackableField(key: string) {
                return key != "__ko_mapping__" && key != "__tracked__";
            }

            private isMapped(value: any) {
                return (value != null && value.__tracked__ === true);
            }

            private setMapped(value: any) {
                if (value == null || this.isMapped(value))
                    return;
                value.__tracked__ = true;
                this.mapped.push(value);
            }

            private clearAllMapped() {
                this.mapped.forEach((value) => {
                    delete value["__tracked__"];
                });
                this.mapped = [];
            }

            private isComputed(value: Function) {
                return (value != null && value["__ko_es5_computed__"] === true);
            }

            private isProperty(value: any) {
                return (value != null && value["__ko_es5_property___"] === true);
            }

            private makeComputed(container: any, name: string, fn: Function) {
                var nameOverride = fn["__ko_es5_computed_name__"];
                if (nameOverride !== undefined && nameOverride !== "") {
                    name = nameOverride;
                    delete fn["__ko_es5_computed_name__"];
                }

                if (name === undefined || name == "") {
                    console.log("Error. Function missing name", fn);
                    return;
                }
                try {
                    var callback = fn;
                    if (container !== this.root) {
                        var rootThis = this.root;
                        callback = function () { return fn.bind(rootThis)(); };
                    }
                    ko.defineProperty(container, name, callback);
                } catch (ex) {
                    //console.log(name, ex);
                }
                delete fn["__ko_es5_computed__"];
            }

            private makeProperty(container: any, name: string, value: any) {
                var nameOverride = value["__ko_es5_computed_name__"];
                if (nameOverride !== undefined && nameOverride !== "") {
                    name = nameOverride;
                    delete value["__ko_es5_computed_name__"];
                }

                if (name === undefined || name == "") {
                    console.log("Error. Function missing name", value);
                    return;
                }
                try {
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
            }
        }

        export function track(root: any, name?: string, fields?: Array<string>, referenceFields?: Array<string>) {
            new Track(root, name, fields, referenceFields);
            return root;
        }

        export function trackOptions(root: any, options: Knockout.es5.mapping.TrackOptions) {
            options = options || new Knockout.es5.mapping.TrackOptions();
            new Track(root, options.name, options.fields, options.referenceFields);
            return root;
        }

        export function computed<T>(fn: () => T, name: string = null) {
            fn["__ko_es5_computed__"] = true;
            if (name || false) {
                fn["__ko_es5_computed_name__"] = true;
            }
            return fn;
        }

        export function property<T>(getCallback?: () => T, setCallback?: (value: T) => void) {
            return {
                get: getCallback || function () {
                    //throw Error("property get not implemented");
                },
                set: setCallback || function (value: T) {
                    //throw Error("property set not implemented");
                    //return <T> null;
                },
                __ko_es5_property___: true,
            };
        }
    }

    if (ko.es5 == undefined) {
        ko.es5 = {
            mapping: {
                computed: Knockout.mapping.computed,
                property: Knockout.mapping.property,
                track: Knockout.mapping.track,
                trackOptions: Knockout.mapping.trackOptions,
            },
        };
    }
}
