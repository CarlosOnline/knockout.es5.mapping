/// <reference path="references.ts
var Knockout;
(function (Knockout) {
    var DirtyFlag = (function () {
        // Constructor
        function DirtyFlag(data, initiallyDirty) {
            var _this = this;
            initiallyDirty = initiallyDirty || false;
            this.data = data;
            this.initialState = ko.observable(ko.toJSON(data));
            this.isInitiallyDirty = ko.observable(initiallyDirty);
            this.isDirty = ko.computed({
                owner: this,
                read: function () {
                    return _this.isInitiallyDirty() || _this.initialState() !== ko.toJSON(data);
                }
            });
        }
        DirtyFlag.prototype.reset = function () {
            this.initialState(ko.toJSON(this.data));
            this.isInitiallyDirty(false);
        };
        return DirtyFlag;
    })();
    Knockout.DirtyFlag = DirtyFlag;

    function dirtyFlag(data, dirty) {
        return new DirtyFlag(data, dirty);
    }
    Knockout.dirtyFlag = dirtyFlag;

    if (ko.dirtyFlag === undefined) {
        ko.dirtyFlag = dirtyFlag;
    }
})(Knockout || (Knockout = {}));
//# sourceMappingURL=knockout.dirtyFlag.js.map
