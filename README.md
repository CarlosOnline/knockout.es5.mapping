knockout.es5.mapping
------------------------------------------
Solves the problem of ko.track not traversing into nested objects.

Examples:

// Javascript example

var Basket = (function () {

    function Basket(viewModel) {
    
        var _this = this;
        this.data = {
            id: 0,
            name: "data"
        };
        this.fruits = [];
        this.loaded = false;
        this.id = "";
        this.purchased = [];
        this.viewModel = null;
        this.selected = ko.es5.mapping.computed(function () {
            return _this.data.id == _this.viewModel.selected.id;
        });
        this.viewModel = viewModel;
        ko.es5.mapping.track(this);
    }
    return Basket;
})();

// TypeScript example

class Basket {

    data = {
        id: 0,
        name: "data"
    };
    fruits: Array<Fruit> = [];
    loaded = false;
    id = "";
    purchased: Array<Item> = [];
    viewModel: ViewModel = null;

    selected = ko.es5.mapping.computed<boolean>(() => {
        return this.data.id == this.viewModel.selected.id;
    });

    constructor(viewModel: ViewModel) {
        this.viewModel = viewModel;
        ko.es5.mapping.track(this);
    }
}

INFO:
    Knockout ES5 track nested objects
    Calls ko.track on nested objects: allowing tracking of strings, numbers, arrays, ....
    Use ko.es5.mapping.computed(function() ...) to mark computed functions.  ko.track will call ko.defineProperty on these marked functions, after calling ko.track on the primitive members.
    Excludes nested functions/objects with named constructors.  Idea is that functions & TypeScript classes with constructors can call ko.es5.mapping.track themselves.  This exclusion can be removed.
    Does not yet handle properties.
    
    Minified version soon to come.
    
    Contributions welcome.
