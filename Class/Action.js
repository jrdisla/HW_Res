class Action {

    constructor(main,subm,action,link) {
        this.main = main;
        if(subm!==undefined) {
            this.subm = subm;
        }
        this.action = action;
        this.link = link;
    }
}
module.exports = Action;
