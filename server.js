const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const http = require('http');
var path = require('path');
var parseUrl = require('body-parser');
const app = express();

var mysql = require('mysql');
const { encode } = require('punycode');

let encodeUrl = parseUrl.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname, 'style')))

//session middleware
app.use(sessions({
    secret: "thisismysecrctekey",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));

app.use(cookieParser());

var con = mysql.createConnection({
    host: "localhost",
    user: "root", // my username
    password: "", // my password
    database: "testing"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/register.html');
})

app.post('/register', encodeUrl, (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var age = req.body.age;
    var gender = req.body.gender;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        // checking user already registered or no
        con.query(`SELECT * FROM sample_data WHERE first_name = '${firstName}' AND last_name  = '${lastName}'`, function(err, result){
            if(err){
                console.log(err);
            };
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/failReg.html');
            }else{
            //creating user page in userPage function
            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    firstname: firstName,
                    lastname: lastName,
                    age: age,
                    gender: gender 
                };

                res.sendFile(__dirname + '/login.html');
            }
                // inserting new user data
                var sql = `INSERT INTO sample_data (first_name, last_name, age, gender) VALUES ('${firstName}', '${lastName}', '${age}', '${gender}')`;
                con.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                    }else{
                        // using userPage function for creating user page
                        userPage();
                    };
                });

        }

        });
    });


});

app.get("/dashboard", (req, res)=>{
    res.sendFile(__dirname + "/login.html");
});


app.post('/login', encodeUrl, (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        // checking user already registered or no
        con.query(`SELECT * FROM sample_data WHERE first_name = '${firstName}' AND last_name  = '${lastName}'`, function(err, result){
            if(err){
                console.log(err);
            };

            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    firstname: result[0].firstName,
                    lastname: result[0].lastName,
                };

                res.sendFile(__dirname + '/login.html');
            }

            if(Object.keys(result).length > 0){
                if(result[0].gender == 'Male'){
                    res.sendFile(__dirname + '/sample_data.html');
                }
                else{
                    res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Login and register form with Node.js, Express.js and MySQL</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h3>Hi, ${firstName} ${lastName}</h3>
                    <a href="/">Log out</a>
                </div>
            </body>
            </html>
            `);
                }
                
            }else{
                userPage();
                };
           });

        });

        });









// app.post("/login", encodeUrl, (req, res)=>{
//     var firstName = req.body.firstName;
//     var lastName = req.body.lastName;


//         con.query(`SELECT * FROM sample_data WHERE first_name = '${firstName}' AND last_name = '${lastName}'`, function (err, result) {
//           if(err){
//             console.log(err);
//           };

//           function userPage(){
//             // We create a session for the dashboard (user page) page and save the user data to this session:
//             req.session.user = {
//                 firstName: result[0].firstname,
//                 lastName: result[0].last_Name,
//             };

//             res.sendFile(__dirname,'/sample_data.html')

//             // if(result[0].gender == 'Male'){
//             //     console.log(result[0].gender);
//             //     res.sendFile(__dirname,'/sample_data.html')
//             // }
//             // else{
//             //     res.send(`
//             // <!DOCTYPE html>
//             // <html lang="en">
//             // <head>
//             //     <title>Login and register form with Node.js, Express.js and MySQL</title>
//             //     <meta charset="UTF-8">
//             //     <meta name="viewport" content="width=device-width, initial-scale=1">
//             //     <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
//             // </head>
//             // <body>
//             //     <div class="container">
//             //         <h3>Hi, ${firstName} ${lastName}</h3>
//             //         <a href="/">Log out</a>
//             //     </div>
//             // </body>
//             // </html>
//             // `);
//             // }

            
//         }

//         if(Object.keys(result).length > 0){
//             userPage();
//         }else{
//             res.sendFile(__dirname + '/failLog.html');
//         }

//         });
//     });

app.listen(4000, ()=>{
    console.log("Server running on port 4000");
});

module.exports = con;