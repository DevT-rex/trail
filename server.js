const express = require('express');
const bodyparser = require('body-parser');
const knex = require('knex');
const path = require("path");
const cors= require("cors");
const bcrypt= require("bcrypt-nodejs");
const ejs = require("ejs");

//const pg = require("pg").Pool;

/*const pool= new pg({
	host : 'localhost',
	user : 'postgres',
	port: 5432,
	password : 'p0stm0d1',
	database : 'login'
});*/

const db = knex({
  client: 'pg',
  connection: {
    host : 'localhost',
	user : 'postgres',
	port: '5432',
    password : 'Aabb11@@',
    database : 'login'
  }
});

let backrollno;
let temp = "hello";

const app = express();
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
//app.use(express.static(path.join(__dirname, 'web')));
app.use(express.static('public'));
app.use(cors());

app.get('/',(req,res) => {
	res.render("start");
	//res.sendFile(__dirname + "/web/index.html");
});
app.get('/home',(req,res) => {
	res.render("home",{temp:temp});
	//res.sendFile(__dirname + "/web/index.html");
});
app.get("/signin",(req,res,next) => {
	res.render("login");
	next();
});
app.get("/profile/addbook",(req,res) =>{
     res.render("addbook");
});
app.get("/search",(req,res)=>{
   res.render("viewbook");
});

app.post('/signin',async(req,res,next) => {
	/*	const med =await pool.query("SELECT * FROM login WHERE ROLLno= $9",[req.body.Rollno]);
		if (bcrypt.compareSync(req.body.password,med[0].hash)){
		res.render("home"); }*/
	  await db.select('*').from('login')
	.where('Rollno', '=' ,req.body.Rollno)
	.then(data =>{
		if (bcrypt.compareSync(req.body.password,data[0].hash))
		 { 
			 temp = req.body.Rollno;
			 backrollno =  req.body.Rollno;
				res.redirect('/home');
		 }
		 else
		 {  res.redirect('/signin');
		 	res.status(400).json("wrong Rollno or password");
		 }
	})
	.catch(err =>req.status(404).json("wrong Rollno or password"));
	})

app.get('/profile/:roll',async(req,res) => {
	await db.select('*').from('user')
	.where('Rollno', '=' ,backrollno)
	.then(data =>{
		temp = data[0];
		console.log(temp)
		res.render("profile",{FirstName:temp.FirstName,
							  LastName:temp.LastName,
							  Rollno:temp.Rollno,
							  email:temp.email,
							  mobileno:temp.mobileno,
							  });
	})

})

app.post('/profile/addbook',async(req,res) =>{
	const {Url1,Url2,Url3,name,cost,edition,contact_no} = req.body
	await db('books')
	.insert({
		Url1:Url1,
		Url2:Url2,
		Url3:Url3,
		name:name,
		cost:cost,
		edition:edition,
		contact_no:contact_no,
		Rollno:backrollno
	})
	.then(response => {
		res.json(response[0]);//don't have page to show
		//solved
		res.render("home");
		window.alert("Book added sucessfully");
	 })
	.catch(err => res.status(404).json("unable to connection"))
})


app.get('/getbooks/:name',async(res,req) =>{
	var name  = req.params;
	await db.select('*').from('books')
	.where("name","=",name)
	.then(response => {
		res.json(response);
		temp = response; 
        res.render("booksview",{temp:temp});
		//you can access only urls by db.select('url1','url2','url3').from('books') but then you'll not have name etc.

		// I don't know how to access database coloums using knex so make it access all urls 
	    // related to the name and then in the books view page I will display it in the results page 
	})
	.catch( err => res.status(202).json("no books available with name \" "+name+" \"" ));
})

/*if (bcrypt.compareSync(req.body.password,data[0].hash))*/
app.get('/signup',(req,res) => {
    res.render("signup");
});

app.post('/signup',async(req,res,next) => {
	const {FirstName,LastName,Rollno,email,password,mobileno} = req.body;
		var hash = bcrypt.hashSync(password);
	/*const FirstName= req.body.FirstName,
		LastName= req.body.LastName,
		Rollno= req.body.Rollno,
		email= req.body.email,
		mobileno= req.body.mobileno,
		password = req.body.password;
		var hash = bcrypt.hashSync(password);
		console.log(req.body);
	const values = await pool.query ("INSERT INTO users (FirstName,LastName,Rollno,email,mobileno,password) 
	       VALUES($1::VARCHAR,$2::VARCHAR,$3::VARCHAR,$4::VARCHAR,$5::BIGINT,$6::VARCHAR) RETURNING Rollno",
	  [FirstName,LastName,Rollno,email,mobileno,hash]
	);
	 await pool.query("INSERT INTO login (Rollno,hash) VALUES($7,$8)",
	  [values,hash]
	 );
	 res.redirect("login");*/
	 await db.transaction(trx => {
		trx.insert({
		rollno: Rollno,
		hash: hash
		})
		.into('login')
		.returning('Rollno')
		.then(newRollno =>{
		await db('user')
			.returning('*')
			.insert({
				FirstName:FirstName,
				LastName:LastName,
				Rollno:newRollno[0],
				email:email,
				mobileno:mobileno,
				password:hash
			})
			.then(response => {
			temp=response[0].FirstName;
			res.json(temp);
			
			})
		.catch(err => res.status(404).json("unable to connection"))
		})
	.then(trx.commit)
	.catch(trx.rollback)
	})
	// res.render("home");	
	res.redirect('/home');
})
app.listen(3000, () => {
	console.log('app is running');
});
// you need to make 2 data bases
//1)login- rollno-text,hash-text
//2)user- rollno-text,password-text,email-text,First Name:   ,Last Name:,mobile no