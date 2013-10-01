/// <reference path="references.ts

interface KnockoutStatic {
    dirtyFlag: (data: any, initiallyDirty?: boolean) => Knockout.DirtyFlag;
}

interface IKnockoutDirtyFlag {
    isDirty: KnockoutComputed<boolean>;
    reset(): void;
}

module Knockout {
    export class DirtyFlag implements IKnockoutDirtyFlag {
        data: any;
        initialState: KnockoutObservable<string>;
        isInitiallyDirty: KnockoutObservable<boolean>;
        isDirty: KnockoutComputed<boolean>;

        reset(): void {
            this.initialState(ko.toJSON(this.data));
            this.isInitiallyDirty(false);
        }

        // Constructor
        constructor(data: any, initiallyDirty?: boolean) {
            initiallyDirty = initiallyDirty || false;
            this.data = data;
            this.initialState = ko.observable(ko.toJSON(data));
            this.isInitiallyDirty = ko.observable(initiallyDirty);
            this.isDirty = ko.computed({
                owner: this,
                read: () => {
                    return this.isInitiallyDirty() || this.initialState() !== ko.toJSON(data);
                }
            });
        }
    }

    export function dirtyFlag(data: any, dirty?: boolean) {
        return new DirtyFlag(data, dirty);
    }

    if (ko.dirtyFlag === undefined) {
        ko.dirtyFlag = dirtyFlag;
    }
}
