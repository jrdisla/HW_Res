var express = require('express');
var router = express.Router();
var Airtable = require('airtable');
var base = new Airtable({apiKey: 'key4Lm0uKfGgg5f7m'}).base('appdqzfZoeTcXC7VD');
const Menu = require("../Class/Menu");
const Action = require("../Class/Action");
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
  let uniqueLink = [];
  async.each(uniqueItems,function(item,callback) {
    myFilter = item;
    //const myFilter = "Design";

    console.log("MAIN:",myFilter);
    let Main2 = [];

    base('Config').select({
      //     filterByFormula: `SEARCH("${myFilter}", MainMenu) >= 0`,
      filterByFormula: `AND(MainMenu="${item}",Live=TRUE())`,
      view: 'MENU - Homework'
    }).firstPage(function(err, records) {
      if (err) { console.error(err); return; }
      records.forEach(function(record) {
         let value =  record.get('Sub-menu');
         let url = record.get('URL');
         let action = record.get('Actions');
         let acts = new Action(value,action,url);
         actions.push(acts);
         Main2.push(value);
        //  console.log('Retrieved',value );

      });
      uniqueSubm = Array.from(new Set(Main2));
      //uniqueLink = Array.from(new Set(link));
      var menu = new Menu(item,uniqueSubm,actions);
      console.log("Actions",actions);
      Menus.push(menu);
      console.log('Sub menus: '+myFilter+" ",uniqueSubm);


      callback(err)
    });
  },function(err) {
    console.log("menus top",Menus);
    res.render('index2', {
      title: 'Express',
      mainMenu: myFilter,
      sub: uniqueSubm,
      menu : Menus
    });
  })


  

})
module.exports = router;
