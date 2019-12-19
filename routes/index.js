const express = require('express');
const router = express.Router();
const Air_table = require('airtable');
const base = new Air_table({apiKey: 'key4Lm0uKfGgg5f7m'}).base('appdqzfZoeTcXC7VD');
const Menu = require("../Class/Menu");
const Action = require("../Class/Action");
const  Sub_menu = require("../Class/Subm");
const async = require("async");

router.get('/',function (req,res) {
    let Main = [];
    let uniqueItems = [];
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
        let Menus = [];
        let actions = [];
        let uniqueSubm = [];
        let sums = [];
        async.each(uniqueItems,function(item,callback) {
            let Main_aux = [];
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
                    Main_aux.push(value);
                });
                uniqueSubm = Array.from(new Set(Main_aux));
                let menu = new Menu(item,uniqueSubm);
                Menus.push(menu);
                callback(err)
            });
        },function(err) {
            if (err) { console.error(err); return; }
            for(let i = 0; i < Menus.length; i++){
                (function(i){

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
                                let sc = new Sub_menu(Menus[i].menu,Menus[i].sub[x],acts);
                                //  if(!sums.includes(unique[i][j])) {
                                sums.push(sc);
                                //}
                            }
                        }
                    }



                }(i));
            }
            console.log(sums);
            res.render('index4', {
                title: 'Express',
                sub: uniqueSubm,
                menu : Menus,
                sums: sums
            });
        })
    });
    });
module.exports = router;
