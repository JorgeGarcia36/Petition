const express = require('express')
const app = express()
const db = require('./db')
var bodyParser = require('body-parser')
const csurf = require('csurf');
const bcrypt = require("./bcrypt.js");
var cookieSession = require('cookie-session'); // cookie-session to avoid re-sign the petition
var hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
app.use(express.static("./public"));
// cookie-session to avoid re-sign the petition
app.use(cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);

app.use(csurf());
app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});


// redirect to Petition
app.get("/", (req, res) => {
    res.redirect("/register");
});

// GET PETITION`
app.get("/petition", (req, res) => {
    res.render('petition', {
        layout: "main",
    });
});


//POST with the data of the user
app.post("/petition", (req, res) => {
    // console.log("firstname: ", req.body.firstname);
    return db
        .addDetails(req.body.signature, req.session.userid)
        .then(data => {
            req.session.signatureid = data.rows[0].id; //Setting the cookie assign to the lastname

            console.log("data:", data);
            res.redirect("/thankyou");
        })
        .catch(error => {
            console.log(error);
            res.render("petition", {
                layout: "main",
                error: "error"
            });
        });
});

//THANKS ROUTE

app.get("/thankyou", (req, res) => {
    console.log('err results : ', req.session.userid);
    db.getSignatureID(req.session.signatureid, req.session.id, req.session.userId).then(result =>{
        req.session.userid == true;
        // console.log('err results 2 : ', result.rows[0].signature);

        res.render("thankyou", {
            layout: "main",
            canvasSign: result.rows[0].signature

        });
    });
});

app.get("/register", (req, res) => {
    res.render('register', {
        layout: "main",
    });
});


app.post("/register", (req, res) => {
    if (
        req.body.firstname != "" &&
        req.body.lastname != "" &&
        req.body.email != "" &&
        req.body.password != ""
    ) {
        var bcrypt = require("./bcrypt.js");
        bcrypt.hashPassword(req.body.password).then(hash => {
            return db
                .getUsersTable(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hash
                )
                .then(data => {
                    req.session.userid = data.rows[0].id;
                    res.redirect("/profile");
                })
                .catch(error => {
                    console.log("ERROR ", error);
                });
        });
    } else {
        res.render("register", {
            layout: "main",
            error: "error"
        });
    }
});


//OLD GET SIGNERS ROUTE
app.get("/signers", (req, res) => {
    return db.listSigners().then(function(results) {
        // console.log("DATA  :", results);
        res.render("signers", {
            layout: "main",
            signedlist: results.rows
        });
    });
});


app.get("/signers/:city", (req, res) => {
    console.log("Test");
    return db.getSignersByCity(req.params.city).then(results => {
        console.log(results);
        res.render("signers", {
            layout: "main",
            signedlist: results.rows
        });
    });
});



app.get("/profile", (req, res) => {
    res.render('profile', {
        layout: "main",
    });
});



//. GET /register
app.get("/registration", (req, res) => {
    res.render('./registration', {
        layout: "main",
    });
});

// POST /register. PENDING


// GET /login
app.get("/login", (req, res) => {
    res.render('login', {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    db.checkEmail(req.body.email, req.body.id).then(check => {
        console.log(req.body.email);
        bcrypt
            .checkPassword(req.body.password, check.rows[0].password)
            .then(yes => {

                if (yes) {
                    req.session.id = check.rows[0].id; //cookie
                    res.redirect("/thankyou");
                } else {
                    res.render("login", {
                        layout: "main",
                        error: "error"
                    });
                }
            })
            .catch(error => {
                console.log("error: ", error);
                res.render("thankyou", {
                    layout: "main",
                    error: "error"
                });
            });
    });
});


app.get("/profile", (req, res) => {
    res.render('profile', {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    console.log("Data 1: ", req.body.age, req.session.city, req.session.url);
    console.log("Data FLOW: ", req.session.userid);
    return db
        .addUsersProfiles(req.body.age, req.body.city, req.body.url, req.session.userid)
        .then(data => {
            req.session.id = data.rows[0].id; //Setting the cookie assign to the userid
            console.log("data 3:", data);
            res.redirect("/petition");
        })
        .catch(error => {
            console.log(error);
            res.render("profile", {
                layout: "main",
                error: "error"
            });
        });
});

// EDIT PROFILE VIERNES NOCHE
app.get("/editprofile", (req, res) => {
    return db.usersProfileData(req.session.id, req.session.userid, req.session.userId).then(function(results) {
        console.log("Data 1", req.session.id, req.session.userid, req.session.userId);
        res.render("editprofile", {
            layout: "main",
            firstname: results.rows[0].firstname,
            lastname: results.rows[0].lastname,
            email: results.rows[0].email,
            age: results.rows[0].age,
            city: results.rows[0].city,
            url: results.rows[0].url
        }).catch(function(err) {
            console.log("Data 2 ERROR ", err);
            res.render("editprofile", {
                layout: "main",
                firstname: results.rows[0].firstname,
                lastname: results.rows[0].lastname,
                email: results.rows[0].email,
                age: results.rows[0].age,
                city: results.rows[0].city,
                url: results.rows[0].url
            });
        });
    });
});


app.post("/editprofile", (req, res) => {
    if (req.body.password) {
        bcrypt.hashPassword(req.body.password).then(hashPassword => {
            db
                .editPassword(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hashPassword,
                    req.session.userId,
                )
                .then(results => {
                    return;
                    db.updateProfile(
                        req.body.age,
                        req.body.city,
                        req.body.url,
                        req.session.userId,
                    );
                })
                .then(results => {
                    res.redirect('/thankyou');
                })
                .catch(error => {
                    console.log('error:', error);
                    res.render('update', {
                        layout: 'main',
                        error: 'error',
                    });
                });
        });
    } else {
        db
            .editNoPassword(
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                req.session.userId,
            )
            .then(results => {
                db.updateProfile(
                    req.body.age,
                    req.body.city,
                    req.body.url,
                    req.session.userId,
                );
            })
            .then(results => {
                res.redirect('/thankyou');
            })
            .catch(error => {
                console.log('error:', error);
                res.render('editprofile', {
                    layout: 'main',
                    error: 'error',
                });
            });
    }
});


app.listen(process.env.PORT || 8080, () => console.log('Petition listening!'))
