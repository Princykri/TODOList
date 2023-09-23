import express from "express";
import bodyparser from "body-parser";
const app =express();
import mongoose from "mongoose";
import _ from "lodash";
import dotenv from "dotenv"

dotenv.config()

const port= process.env.PORT
app.use(express.static("public"));
app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extended:true}))
const mongodb=`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.y4nrtd9.mongodb.net/TodoistDB`;

mongoose
   .connect(mongodb)
   .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const listSchema=new mongoose.Schema({name:
    {type:String,
     required:true   
    }
})
const Item=mongoose.model("Item",listSchema)

const item1=new Item({
    name:"Welcome to the list"
})

const item2=new Item({
    name:"Hit'+'button to add "
})
const item3=new Item({
    name:"<---- hit to delete "
})

const defaultItem=[item1,item2,item3];

const NewlistSchema=new mongoose.Schema({
  name:String,
  items:[listSchema]
})

const List=mongoose.model("List",NewlistSchema);

app.get("/",(req,res)=>{
    res.render("home")
    
})

app.get("/:customListName",(req,res)=>{
    const customListName=_.upperCase(req.params.customListName);
    List.findOne({name:customListName})
    .then(function(foundList){
         if(!foundList){
          // cretaing new list in NewList collection
          const list =new List({
            name:customListName ,
            items:defaultItem,
          })
          list.save();
          res.redirect("/"+customListName);
         }else{
          // show the existing list 
          res.render("index",{heading:foundList.name , data:foundList.items})
         }
    })
    .catch((err)=> {
      console.log(err);
    })
    
})

app.post("/add",(req,res)=>{
    const ReqItem=req.body.newItem;
    const Reqlist=req.body.list;

    const newItem=new Item({
      name:ReqItem
    })
    List.findOne({name:Reqlist})
    .then(function(foundlist){
        console.log("Successfully saved new Item to newList")
         foundlist.items.push(newItem)
         foundlist.save();
         res.redirect("/"+Reqlist)
      })
    .catch((err)=>{
        console.log(err);
    })
    
   
})

app.post("/del",(req,res)=>{
    const checkId=req.body.checkbox;
    const Reqlist=req.body.listName;
    
      List.findOneAndUpdate({name:Reqlist},{$pull:{items:{_id:checkId}}})
      .then(()=>{
         res.redirect("/"+Reqlist);
      })
      .catch((err)=>{
        console.log(err);
       })
})










app.listen(3000,()=>{
    console.log("server is Running")
})