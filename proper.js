//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://process.env.NAME:process.env.PWD@cluster0.kikvzek.mongodb.net/todolistDB');
  //  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

  const itemSchema = {
    name: String
  };

  const Item = mongoose.model("Item", itemSchema);
  const item1 = new Item({
    name: "Buy Food"
  });

  const item2 = new Item({
    name: "cook Food"
  });

  const item3 = new Item({
    name: "Eat Food"
  });
  const defaultItems = [item1, item2, item3];



  const listSchema = {
    name: String,
    items: [itemSchema]
  };
  const List = mongoose.model("List", listSchema);


  app.get("/", async function(req, res) {
    try {
      const items = await Item.find();

      if (items.length == 0) { //array lenght
        console.log("its zero");
        try {
          Item.insertMany(defaultItems);
        } catch {

        }

        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "today",
          newListItems: items
        });
      }
    } catch {

    }



  });



  app.post("/", async function(req, res) {

    const newItem = req.body.newItem; //text  user entered
    const listName = _.capitalize(req.body.list); //"/xyz(linkname or listTitle)"
    const item = new Item({
      name: newItem
    });

    if (listName == "today") {
      item.save();
      res.redirect("/");
    } else {
      try {
        const founditem = await List.findOne({
          name: listName
        });
        founditem.items.push(item)
        founditem.save();

      } catch {}
      res.redirect("/" + listName)
    }


  });


  app.post("/delete/:links", async function(req, res) {
    const checkedItem = req.body.checkbox;
    const link = req.params.links; //for other way
    const listName = req.body.listName;
    console.log(link);
    if (link == "today") {
      // await Item.deleteOne({_id:checkedItem})
      await Item.findByIdAndRemove(checkedItem); //same as above
      res.redirect("/")
    } else {
      await List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItem
          }
        }
      }) //two way
      // const founditem=await List.findOne({name:link});
      // founditem.items.pull(checkedItem);     for other way
      // founditem.save();
      res.redirect("/" + link);
    }

  });


  app.get("/:customListName", async function(req, res) {

    var customListName = _.capitalize(req.params.customListName);;
    try {
      const founditem = await List.findOne({
        name: customListName
      });
      if (!founditem) {
        const listone = new List({
          name: customListName,
          items: defaultItems
        });
        listone.save();
        res.redirect("/" + customListName);
      } else {
        res.render('list', {
          listTitle: founditem.name,
          newListItems: founditem.items
        });
      }

    } catch {}

  })



  app.get("/about", function(req, res) {
    res.render("about");
  });
}
app.listen(process.env.PORT || 3000, function() {
  console.log("server started at the port 3000");
})
