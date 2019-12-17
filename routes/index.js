var express = require('express');
var router = express.Router();
var Airtable = require('airtable');
var base = new Airtable({apiKey: 'key4Lm0uKfGgg5f7m'}).base('appdqzfZoeTcXC7VD');
const Menu = require("../Class/Menu");
const Action = require("../Class/Action");
const  Subm = require("../Class/Subm");
var async = require("async");

let uniqueItems = [];


/* GET MainMenus. */
router.get('/', function(req, res, next) {
    const myFilter = 'Design';
    let Main = [];
    let uniqueItems = [];
    base('Config').select({
        filterByFormula: `SEARCH("${myFilter}", MainMenu) >= 0`,
        view: 'MENU - Homework'
    }).firstPage(function(err, records) {
        if (err) { console.error(err); return; }
        records.forEach(function(record) {
            var value =  record.get('MainMenu');
            Main.push(value);
            console.log('Retrieved',value );

        });
        uniqueItems = Array.from(new Set(Main));
        // console.log(uniqueItems);
    });

    res.render('index3', { title: 'Express' });
});
router.get('/getMain',function (req,res) {
    let Main = [];

    base('Config').select({
        view: 'MENU - Homework'
    }).firstPage(function(err, records) {
        if (err) { console.error(err); return; }
        records.forEach(function(record) {
            var value =  record.get('Workflow Phase');
            Main.push(value);
            console.log('Retrieved',value);
        });
        uniqueItems = Array.from(new Set(Main));
        console.log(uniqueItems);
    })
    res.render('index3', { title: 'Express' });
    ;});
router.get('/getSub',function (req,res) {
    let Menus = [];
    let myFilter="";
    let actions = [];
    let uniqueSubm = [];
    let unique = [];
    let sums = [];
    async.each(uniqueItems,function(item,callback) {
        myFilter = item;
        let Main2 = [];

        base('Config').select({
            filterByFormula: `AND(MainMenu="${item}",Live=TRUE())`,
            view: 'MENU - Homework'
        }).firstPage(function(err, records) {
            if (err) { console.error(err); return; }
            records.forEach(function(record) {
                let value =  record.get('Sub-menu');
                let url = record.get('URL');
                let action = record.get('Actions');
                let acts = new Action(item,value,action,url);
                actions.push(acts);
                Main2.push(value);
            });
            uniqueSubm = Array.from(new Set(Main2));
            let menu = new Menu(item,uniqueSubm,actions);
            Menus.push(menu);
            unique.push(uniqueSubm);
            callback(err)
        });
    },function(err) {
console.log("ACTIONS",actions);
        for(let i = 0; i < unique.length; i++){
            (function(i){
                for(let j=0;j<unique[i].length;j++)
                {
                    let acts = [];
                    let flag = false;
                    for(let x=0;x<actions.length;x++)
                    {
                        if(unique[i][j]===actions[x].subm)
                        {
                            let act = actions[x].action;
                            if(act!==undefined)
                            {
                               // act = 'EMPTY';
                                let link = actions[x].link;
                                let main = actions[x].main;
                                let action_ = new Action(main,unique[i][j],act,link);
                                acts.push(action_);
                            }
                            else
                            {
                                if(!flag){
                                    let link = actions[x].link;
                                    let main = actions[x].main;
                                    let action_ = new Action(main,undefined,unique[i][j],link);
                                    acts.push(action_);
                                    flag = true;
                                }


                            }

                        }
                        if(x===actions.length-1)
                        {
                            let sc = new Subm(unique[i][j],acts);
                            //  if(!sums.includes(unique[i][j])) {
                            sums.push(sc);
                            //}
                        }
                    }

                }
                //  sums = Array.from(new Set(sums));

            }(i));
        }
        console.log("termino",sums);
        sums = Array.from(new Set(sums));
        res.render('index4', {
            title: 'Express',
            mainMenu: myFilter,
            sub: uniqueSubm,
            menu : Menus,
            sums: sums
        });
    })




})
module.exports = router;
