const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")
const app = express();
 

app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use(express.static("public")); 
 
app.set('view engine', 'ejs'); 
 

mongoose.connect("ADD YOUR MONGODB ATLAS LINK",{useNewUrlParser:true},{useUnifiedTopology:true});

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist"
});
const item2=new Item({
  name:"Hit + to add"
});
const item3=new Item({
  name:"Hit delete to delete"
});

const defaultitems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);
 
 
app.get("/", function(req, res) {
  Item.find({},function(err,founditems){

    if(founditems.length ===0){
      Item.insertMany(defaultitems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("success");
        }
      }); 
      res.redirect("/");  
    }else{
      res.render("list", { 
        listTitle: "Today",
        newListItems: founditems 
      });
    }
    
  });
 
});
 
 
 
app.post("/", function(req, res) {
  console.log(req.body);
  const itemname = req.body.newItem;
  const listname=req.body.list;

  const item=new Item({
    name:itemname
  });

  if(listname==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    });

  }

});
 
app.get("/:customlist",function(req,res){
  var customlistname=req.params.customlist;
  customlistname=_.capitalize(customlistname);
  List.findOne({name:customlistname},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list=new List({
          name:customlistname,
          items:defaultitems
        });
      
        list.save();
        res.redirect("/"+customlistname);
      }else{
        res.render("list", { 
          listTitle: foundlist.name,
          newListItems: foundlist.items 
        });
      }
    }

  });


 

});


app.get("/about", function(req, res) { 
    res.render("about");
});

app.post("/delete", function(req, res) {
  const itemid=(req.body.checkbox);
  const listname=req.body.listname;

  if(listname==="Today"){
    Item.findByIdAndRemove(itemid,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemid}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    });
  }

});

app.listen(process.env.PORT||3000, function() {
  console.log("3000 started");
});