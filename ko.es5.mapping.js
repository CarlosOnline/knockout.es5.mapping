var koES5;
(function (koES5) {
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
        function Track(rootObject) {
            this.rootObject = rootObject;
            this.mapped = [];
            this.track(rootObject);
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
            console.log(indent, "track: " + name + "--------------------------------");
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
                        console.log(indent, name + "." + key, type);
                        keys.push(key);
                        break;

                    case "function":
                        if (this.isComputed(value)) {
                            console.log(indent, "f> " + name + "." + key, type);
                            computed.push({
                                name: key,
                                fn: value
                            });
                        }
                        break;

                    case "object":
                        if (value == null || this.isMapped(value) || !this.isTrackable(value)) {
                            // track the variable as a pointer to underlying data
                            console.log(indent, "p> " + name + "." + key, type, this.name(value));
                            keys.push(key);
                            continue;
                        }

                        // nested tracking
                        console.log(indent, "o> " + name + "." + key, type, this.name(value));
                        this.track(value, key, indent += "   ");
                        break;

                    default:
                        console.log(indent, "unknown " + name + "." + key, type);
                        break;
                }
            }

            if (keys.length > 0) {
                try  {
                    ko.track(source, keys);
                } catch (ex) {
                    console.log(key, value);
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
                ko.defineProperty(container, name, fn);
            } catch (ex) {
                console.log(name, ex);
            }
            delete fn["__ko_es5_computed__"];
        };
        return Track;
    })();
    koES5.Track = Track;

    function track(root) {
        new Track(root);
        return root;
    }
    koES5.track = track;

    function computed(fn, name) {
        if (typeof name === "undefined") { name = null; }
        fn["__ko_es5_computed__"] = true;
        if (name || false) {
            fn["__ko_es5_computed_name__"] = true;
        }
        return fn;
    }
    koES5.computed = computed;

    ko.es5 = {
        computed: koES5.computed,
        track: koES5.track,
        dirtyFlag: null
    };

    (function (UnitTest1) {
        var Test1 = (function () {
            function Test1() {
                var _this = this;
                this.num1 = 0;
                this.num2 = 2;
                this.numNull = null;
                this._num1 = ko.es5.computed(function () {
                    return _this.num1;
                });
                this._num2 = ko.es5.computed(function () {
                    return _this.num2;
                });
                this._numNull = ko.es5.computed(function () {
                    return _this.numNull;
                });
                this.str1 = "1";
                this.str2 = "2";
                this.str3 = "3";
                this.strNull = null;
                this.bool1 = true;
                this.bool2 = false;
                this.boolNull = null;
                this.arr1 = [1, 2, 3];
                this.arr2 = [4, 5, 6];
                this.arrNull = null;
                this.obj1 = {
                    num1: 0,
                    num2: 2,
                    numNull: null,
                    str1: "1",
                    str2: "2",
                    str3: "3",
                    strNull: null,
                    bool1: true,
                    bool2: false,
                    boolNull: null,
                    arr1: [1, 2, 3],
                    arr2: [1, 2, 3],
                    arr3: []
                };
                this.top = {
                    num1: 0,
                    num2: 2,
                    numNull: null,
                    str1: "1",
                    str2: "2",
                    str3: "3",
                    strNull: null,
                    bool1: true,
                    bool2: false,
                    boolNull: null,
                    arr1: [1, 2, 3],
                    arr2: [1, 2, 3],
                    arr3: [],
                    middle: {
                        num1: 0,
                        num2: 2,
                        numNull: null,
                        str1: "1",
                        str2: "2",
                        str3: "3",
                        strNull: null,
                        bool1: true,
                        bool2: false,
                        boolNull: null,
                        arr1: [1, 2, 3],
                        arr2: [1, 2, 3],
                        arr3: [],
                        bottom: {
                            num1: 0,
                            num2: 2,
                            numNull: null,
                            str1: "1",
                            str2: "2",
                            str3: "3",
                            strNull: null,
                            bool1: true,
                            bool2: false,
                            boolNull: null,
                            arr1: [1, 2, 3],
                            arr2: [1, 2, 3],
                            arr3: []
                        }
                    }
                };
                ko.es5.track(this);
            }
            return Test1;
        })();
        UnitTest1.Test1 = Test1;
    })(koES5.UnitTest1 || (koES5.UnitTest1 = {}));
    var UnitTest1 = koES5.UnitTest1;
    function unitTest1() {
        var test1 = new UnitTest1.Test1();
        var expected = 1001;
        test1.num1 = 1001;
        console.assert(test1.num1 == 1001 && test1._num1 == 1001);
        console.log("success");

        var updated = false;
        expected = 1002;
        ko.getObservable(test1, "num1").subscribe(function (newValue) {
            updated = true;
            console.assert(newValue == expected);
        });
        test1.num1 = expected;
        console.assert(updated);
    }
    koES5.unitTest1 = unitTest1;
})(koES5 || (koES5 = {}));
//# sourceMappingURL=ko.es5.js.map
