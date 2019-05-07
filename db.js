var spicedPg = require('spiced-pg');

var db = spicedPg(
    process.env.DATABASE_URL ||'postgres:postgres:postgres@localhost:5432/wintergreen-petition');


module.exports.addDetails = function addDetails(
    signature,
    userId
) {
    if (signature == 1) {
        signature = null;
    }

    return db.query("INSERT INTO signatures (signature, userId) VALUES ($1, $2) returning id", [
        signature,
        userId
    ]);
};

//queries for /signers

module.exports.listSigners = function listSigners() {
    return db.query(
        `SELECT firstname, lastname, age,
        city, url
        FROM usersTable
        LEFT JOIN usersProfiles
        ON usersTable.id = usersProfiles.userId`
    );
};

module.exports.getSignersByCity = function getSignersByCity(city) {
    return db.query(
        `SELECT
        usersTable.firstname,
        usersTable.lastname,
        usersProfiles.city
        FROM usersProfiles
        LEFT JOIN usersTable
        ON usersTable.id = usersProfiles.userId
        WHERE city=$1`,
        [city]
    );
};


module.exports.numSigners = function numSigners() {
    db.query("SELECT COUNT(*) from signatures");
};

//Get signature from the user with the cookie
module.exports.getSignatureID = function getSignatureID(userID) {
    return db.query("SELECT signature FROM signatures WHERE id= $1", [userID]);
};

// Insert for usersTable query

module.exports.dataProfile = function dataProfile(id) {
    (`SELECT usersTable.firstname, usersTable.lastname, usersTable.email, usersProfiles.age, usersProfiles.city, usersProfiles.url
    FROM usersTable
    LEFT JOIN usersProfiles
    ON usersProfiles.userId = usersTable.id
    WHERE usersTable.id = $1`,
    [id]);
};

module.exports.getUsersTable = function getUsersTable(
    firstname,
    lastname,
    email,
    password
) {
    return db.query("INSERT INTO usersTable (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) returning id", [
        firstname || null,
        lastname || null,
        email || null,
        password || null
    ]);
};

// Select from usersTable app.post("/login",
module.exports.checkEmail = function checkEmail(email) {
    return db.query(`SELECT password, id FROM usersTable WHERE email = $1`, [
        email
    ]);
};

module.exports.checkPassword = function checkPassword(password) {
    return db.query(`SELECT email, id FROM usersTable WHERE password = $1`, [
        password
    ]);
};

module.exports.addUsersProfiles = function addUsersProfiles(
    age,
    city,
    url,
    userId
) {
    return db.query("INSERT INTO usersProfiles (age, city, url, userId) VALUES ($1, $2, $3, $4) returning userId", [
        age,
        city,
        url,
        userId
    ]);
};

module.exports.usersProfileData = function usersProfileData(id) {
    return db.query(`SELECT
        usersTable.firstname,
        usersTable.lastname,
        usersTable.email,
        usersProfiles.age,
        usersProfiles.city,
        usersProfiles.url
    FROM usersTable
    LEFT JOIN usersProfiles
    ON usersProfiles.userId = usersTable.id
    WHERE usersTable.id = $1`,
    [id]);
};

// update profe

module.exports.updateProfile = function updateProfile(age, city, url, userID) {
    return db.query(`INSERT INTO
        usersProfiles (age, city, url, userId)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (userId)
       DO UPDATE SET age = $1, city = $2, url = $3, userId=$4
       RETURNING id`, ), [age, city, url, userID];
   };


// With Password

module.exports.editPassword = function editPassword(
    firstname,
    lastname,
    email,
    password,
    userId,
) {
    return db.query(
        `UPDATE usersTable
        SET firstname = $1, lastname = $2, email = $3, password = $4
        WHERE id = $5`,
        [firstname, lastname, email, password, userId],
    );
};
module.exports.editNoPassword = function editNoPassword(
    firstname,
    lastname,
    email,
    userId,
) {
    return db.query(
        `UPDATE usersTable SET firstname =$1, lastname=$2, email=$3
        WHERE id=$4 `,
        [firstname, lastname, email, userId],
    );
};
