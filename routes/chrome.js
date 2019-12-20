let express = require('express');
let router = express.Router();
const Air_table = require('airtable');
const base = new Air_table({apiKey: 'key4Lm0uKfGgg5f7m'}).base('appdqzfZoeTcXC7VD');
const Menu = require("../Class/Menu");
const Action = require("../Class/Action");
const  Sub_menu = require("../Class/Subm");
const async = require("async");

router.get('/get',function (req,res) {
  let Main = [];
  let uniqueItems = [];
  base('Config').select({
    view: 'MENU - Homework'
  }).firstPage(function(error, records) {
    if (error) { console.error(error); return; }
    records.forEach(function(record) {
      let value =  record.get('Workflow Phase');
      Main.push(value);
    });
    uniqueItems = Array.from(new Set(Main));
    let Menus = [];
    let actions = [];
    let uniqueSubm = [];
    let sums = [];
    async.each(uniqueItems,function(item_main_m,callback) {
      let Main_aux = [];
      base('Config').select({
        filterByFormula: `AND(MainMenu="${item_main_m}",Live=TRUE())`,
        view: 'MENU - Homework'
      }).firstPage(function(err, records) {
        if (err) { console.error(err); return; }
        records.forEach(function(record) {
          let value =  record.get('Sub-menu');
          let url = record.get('URL');
          let action = record.get('Actions');
          let acts = new Action(item_main_m,value,action,url);
          actions.push(acts);
          Main_aux.push(value);
        });
        uniqueSubm = Array.from(new Set(Main_aux));
        let menu = new Menu(item_main_m,uniqueSubm);
        Menus.push(menu);
        callback(err)
      });
    },function(err) {
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
                sums.push(sc);
              }
            }
          }
        }(i));
      }
         let html ="";
      for(let i = 0; i < Menus.length; i++){
        (function(i){
          html +=`<li>
<a  href=\"http://example.com\" id=\"navbarDropdownMenuLink\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">
                    ${Menus[i].menu}
                </a>
<ul>`;

          for (let j = 0;j<Menus[i].sub.length;j++)
          {
            html += `<li><a>${Menus[i].sub[j]}</a>
<ul>`;
            for (let x = 0;x<sums.length;x++)
            {
              if(sums[x].subm === Menus[i].sub[j])
              {
                for(let z = 0;z<sums[x].action.length;z++)
                {
                  if(sums[x].action[z].main ===Menus[i].menu){
                    html+=`<li><a target=\"_blank\" href=\"${sums[x].action[z].link}\">${sums[x].action[z].action}</a></li>`;
                  }
                }
              }
            }
            html += `</ul></li>`;
          }
          html +=`</ul></li>`;

        }(i));
      }
//console.log(html);

      res.send(html);
    })
  });
});

module.exports = router;
