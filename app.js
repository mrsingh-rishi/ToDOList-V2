//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rishi:rs%4012%402002@cluster0.8segm.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name:"Welcome To your ToDoList!"});

const item2 = new Item({name:"Hit + to Add New Item."});

const item3 = new Item({name:"<-- Hit this to Delete an Item"});

const defaultItems = [ item1,item2,item3];


const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully Add deafult items");
      }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({name:itemName});
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove({_id: checkedItemId},function(err){
      if(!err){
        res.redirect("/");
      }
    });
    
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});



app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if(port== null || port == "" || port == undefined){
  port == 8000;
}
app.listen(4000, function() {
  console.log("Server started on port 4000");
});
