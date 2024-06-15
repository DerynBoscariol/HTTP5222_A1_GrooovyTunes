//Importing modules and libraries
const express = require("express");
const path = require("path");
const {MongoClient, ObjectId} = require("mongodb");
const dotenv = require("dotenv");
const { request } = require("http");
dotenv.config();

//Setting up Express and port
const app = express();
const port = process.env.PORT || "8888";

//Setting up mongodb
//const dbUrl = `mongodb://${process.env.DBUSER}:${process.env.DBPWD}@${process.env.DBHOST}/testdb?authSource=admin`;
const dbUrlAtlas = `mongodb+srv://${process.env.ADBUSER}:${process.env.ADBPWD}@cluster0.7usbbym.mongodb.net/`;

const client = new MongoClient(dbUrlAtlas); 

//Directing to static files in public folder
app.use(express.static(path.join(__dirname, "public")));

//Directing to views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//troubleshoot
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routing
app.get("/", (request, response) => {
   response.render("index", {title:"Home"});
});
 app.get("/about", (request, response) => {
    response.render("about", {title:"About Us"});
 });

 //vinyl page routing
 app.get("/records", async (request, response) => {
    let records = await getVinyl();
    response.render("records", {title:"Our Records", products: records });
 });

 //Admin page routing
 app.get("/admin", async (request, response) => {
   let records = await getVinyl();
   response.render("admin", {title: "Admin Home", products: records });
 });

 //Add record page routing
 app.get("/admin/add", async (request, response) => {
   response.render("add", {title: "Add a Record"});
 });
 //Processing add form
 app.post("/admin/add/submit", async (request, response) => {
   let title = request.body.titleName;
   let artist = request.body.artistName;
   let year = request.body.yearName;
   let genre = request.body.genreName;

   let newRecord = {
      title: title,
      artist: artist,
      year: parseInt(year),
      genre: genre
   };
   await addRecord(newRecord);
   response.redirect("/admin");
   
 });


//Rendering edit page
app.get("/admin/edit", async (request, response) => {
   if(request.query.recordId){
     let recordToEdit = await getOneVinyl(request.query.recordId);
     response.render("edit", {title: "Edit Record", editRecord: recordToEdit});
   } else {
     response.redirect("/admin");
   }
 });
 
 //Processing EDIT form
 app.post("/admin/edit/submit", async (request, response) => { // SOMETHING IS WRONG HERe
   let idFilter = {_id: new ObjectId(request.body.recordId)}; ////*****************************************/
     let record = {
     title: request.body.titleName,
     artist: request.body.artistName,
     year: request.body.yearName,
     genre: request.body.genreName
   };
   await editRecord(idFilter, record);
   response.redirect("/admin");
 });

 // Delete processing
 app.get("/admin/delete", async (request, response)=>{
   await deleteRecord(request.query.recordId);
   response.redirect("/admin");
 });
 
 ///FUNCTION TO UPDATE RECORDS
 async function editRecord(filter, record) {
   db = await connection();
   let updateVinyl = {
     $set: {
       title: record.title,
       artist: record.artist,
       year: record.year,
       genre: record.genre
     }
   }
   const result = await db.collection("vinyls").updateOne(filter, updateVinyl);
 } 

 //Function to add record
 async function addRecord(newVinylRecord){
   db = await connection();
   let status = await db.collection("vinyls").insertOne(newVinylRecord);
   console.log("record added" + status);
 }
 

 //Function to get one record
 async function getOneVinyl(id) {
   db = await connection();
   const editId = {_id: new ObjectId(id)};
   let result = await db.collection("vinyls").findOne(editId);
   return result;
 }

 //Function to delete record
 async function deleteRecord(id){
   let idFilter = {_id: new ObjectId(id)};
   db = await connection();
   let result = await db.collection("vinyls").deleteOne(idFilter);
   if (result.deletedCount == 1)
     console.log("record deleted")
 }
 

//Setting up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

//Mongodb connection functions
async function connection() {
    db = client.db("testdb");
    return db;
    }
//Function to return whole collection
async function getVinyl() {
    db = await connection();
    var results = db.collection("vinyls").find({});
    let vinylArray = await results.toArray();
    return vinylArray;
    }
