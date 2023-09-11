import express from "express";
import pgPromise from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "flash-express";
import restaurant from './services/restaurant.js';




const app = express();

app.use(express.static('public'));
app.use(flash());


// Create Database Connection
const pgp = pgPromise();
const connectionString = "postgres://restuarant_bookings_user:XES7yGRAmOWAaLxSXk9FOME5sbi15cVL@dpg-cjvc2p95mpss73fbtdr0-a.oregon-postgres.render.com/restuarant_bookings";
const db = pgp(connectionString);

let restaurantObject = restaurant(db);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.use(express.static('public'));

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

app.get("/", (req, res) => {
//Show tables that can be booked and allow client to book a tablle that is not already booked. Hide the radio button for table that are already booked.
    res.render('index', { 
        available: restaurantObject.getTables(),
        //tables : [{}, {}, {booked : true}, {}, {}, {}]
    })
});
app.post('/book',(req,res)=>{
    
    res.redirect('/')
}
);


app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});


var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('App starting on port', portNumber);
});