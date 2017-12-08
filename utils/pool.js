var Pool = {
    init: function (createFn) {
        this.create = createFn;
    },
    add: function (obj) {
        this.objects.push(obj);
    },
    addNew: function (n) {
        while (n > 0) {
            n--;
            this.objects.push(this.create());
        }
    },
    get: function () {
        var obj = this.objects.pop();

        if (!obj) {
            obj = this.create();
        }

        return obj;
    },
    count: function () {
        return this.objects.length;
    }
}

export var pool = {
    create: function () {
        return Object.assign(Object.create(Pool), {objects: []});
    } 
}