'use strict';

function nullObj (obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            obj[prop] = null;
        }
    }
    obj = null;
}

var ArrayExecuter = function (scope, id = Math.random()) {
    var task_arr = [];

    return {
        execute: function (arr) {
            if (arr.length === 0) return;
            this.addNext(arr);
            this.runStep('');
        },
        addNext: function (arr) {
            if (typeof arr === 'function') {
                // add single function
                task_arr.unshift({fn: arr, vars: null});
            } else {
                task_arr = [...arr, ...task_arr];
            }
        },
        tackOn: function (arr) {
            task_arr = [...task_arr, ...arr];
            this.runStep('');
        },
        next: function () {
            console.log('NEXT');
            this.runStep();
        },
        runStep: function (vars) {
            if (task_arr.length == 0)return;

            var step = task_arr.shift();
            var funct = step.fn;
            step.vars = step.vars || [];

            if (vars) step.vars = step.vars.concat(vars);

            var scope = step.scope || this;

            var promise = new Promise( function (resolve, reject) {
                funct.apply(scope, [...step.vars, resolve, reject]);
            });

            promise.then((vars) => {
                this.runStep(vars);
            }).catch(
                // Log the rejection reason
                (cont) => {
                    if (cont === true) {
                        this.next();
                    } else {
                        console.log(funct);
                        throw 'ARRAY EXECUTER ERROR ' + cont;
                    }
                }
            );

            nullObj(step);
        },
        clearArrayExecuter: function () {
            task_arr = [];
        },
        destroy: function () {
            for (var i = 0; i < task_arr.length; i++) {
                nullObj(task_arr[i]);
            };
            task_arr = [];
        }
    }
}

export { ArrayExecuter }