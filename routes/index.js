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
            let menu = new Menu(item,uniqueSubm);
            Menus.push(menu);
            unique.push(uniqueSubm);
            callback(err)
        });
    },function(err) {
//console.log("ACTIONS",actions);
        console.log("ACTIONS",Menus);
        for(let i = 0; i < Menus.length; i++){
            (function(i){

                // for(let j=0;j<unique[i].length;j++)
                // {
                //
                //     let acts = [];
                //     let flag = false;
                //     let subMenu =unique[i][j];
                //     //console.log(subMenu);
                //     for(let x=0;x<actions.length;x++)
                //     {
                //         //console.log(actions[i].action)
                //         let main = '';
                //         if(subMenu===actions[x].subm)
                //         {
                //
                //             let act = actions[x].action;
                //           //  console.log("1ra: "+act);
                //             if(act!==undefined)
                //             {
                //                // act = 'EMPTY';
                //                 let link = actions[x].link;
                //                  main = actions[x].main;
                //                 let action_ = new Action(main,subMenu,act,link);
                //                 if(main !==''){
                //                     acts.push(action_);
                //                 }
                //             }
                //             else
                //             {
                //                 if(!flag){
                //                     let link = actions[x].link;
                //                     main = actions[x].main;
                //                      let action_ = new Action(main,undefined,subMenu,link);
                //                      if(main !==''){
                //                          acts.push(action_);
                //                      }
                //
                //                     flag = true;
                //                 }
                //
                //
                //             }
                //
                //         }
                //         if(x===actions.length-1)
                //         {
                //             let sc = new Subm(main,unique[i][j],acts);
                //             //  if(!sums.includes(unique[i][j])) {
                //             sums.push(sc);
                //             //}
                //         }
                //     }
                //
                // }
                //  sums = Array.from(new Set(sums));

                for(let x=0;x<Menus[i].sub.length;x++)
                {
                    let acts = [];
                    let flag = false;
                    for(let j=0;j<actions.length;j++){
                        if(actions[j].subm === Menus[i].sub[x] && actions[j].main === Menus[i].menu){

                            let act = actions[j].action;

                                if(act!==undefined)
                                {

                                    let link = actions[j].link;
                                    let action_ = new Action(Menus[i].menu,Menus[i].sub[x],act,link);
                                        acts.push(action_);
                                }
                                else
                                {
                                    if(!flag){
                                        let link = actions[j].link;
                                        let action_ = new Action(Menus[i].menu,undefined,Menus[i].sub[x],link);
                                        acts.push(action_);
                                        flag = true;
                                    }


                                }
                        }
                        if(j===actions.length-1)
                        {
                            let sc = new Subm(Menus[i].menu,Menus[i].sub[x],acts);
                            //  if(!sums.includes(unique[i][j])) {
                            sums.push(sc);
                            //}
                        }
                    }
                }



            }(i));
        }

//        sums = Array.from(new Set(sums));

        for(let i = 0; i < sums.length; i++){
            (function(i){

                    //if(sums[i].action[j].subm === 'Develop Bodies'){
                        console.log(sums[i]);

            }(i));
        }

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
