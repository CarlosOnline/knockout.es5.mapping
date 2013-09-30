interface KnockoutStatic {
    es5: {
        computed<T>(fn: Function, name?: string): T;
        track<T>(root: T, name?: string): T;
        dirtyFlag: KO.KnockoutDirtyFlag;
    };
}

module koES5 {
    function getType(x) {
        if ((x) && (typeof (x) === "object")) {
            if (x.constructor === Date) return "date";
            if (x.constructor === Array) return "array";
        }
        return typeof x;
    }

    export class Track<T> {
        mapped = [];

        constructor(private rootObject: any) {
            this.track(rootObject);
            //this.clearAllMapped();
        }

        track<T>(source: T, name: string = null, indent="") {
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
                    //console.log(indent, "skipping: " + name + "." + key, type);
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
                        //console.log(indent, name + "." + key, type);
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
                try {
                    ko.track(source, keys);
                } catch (ex) {
                    console.log(key, value);
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
            this.mapped.unshift();
        }

        private isComputed(value: Function) {
            return (value != null && value["__ko_es5_computed__"] === true);
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
                ko.defineProperty(container, name, fn);
            } catch (ex) {
                console.log(name, ex);
            }
            delete fn["__ko_es5_computed__"];
        }
    }

    export function track(root: any) {
        new Track(root);
        return root;
    }

    export function computed(fn: Function, name: string = null) {
        fn["__ko_es5_computed__"] = true;
        if (name || false) {
            fn["__ko_es5_computed_name__"] = true;
        }
        return fn;
    }

    ko.es5 = {
        computed: koES5.computed,
        track: koES5.track,
        dirtyFlag: null,
    };

    export module UnitTest1 {
        export class Test1 {
            num1 = 0;
            num2 = 2;
            numNull: number = null;

            _num1 = ko.es5.computed(() => { return this.num1; });
            _num2 = ko.es5.computed(() => { return this.num2; });
            _numNull = ko.es5.computed(() => { return this.numNull; });

            str1 = "1";
            str2 = "2";
            str3 = "3";
            strNull: string = null;

            bool1 = true;
            bool2 = false;
            boolNull: boolean = null;

            arr1 = [1,2,3];
            arr2 = [4,5,6];
            arrNull: Array<number> = null;

            obj1 = {
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
            };

            top = {
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
                        arr3: [],
                    }
                }
            };

            constructor() {
                ko.es5.track(this);
            }
        }
    }
    export function unitTest1() {

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
}