var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var ongoing = require("./model/ongoing.js");
var last = require("./model/last.js")

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/url", { useMongoClient: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function(req,res){
    console.log("index");
    res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req,res){
    username = req.body.username;
    last.findOne({username:username},function(err,data){
        if(err) throw err;
        res.json(data);
    })
})


app.post("/search", function(req,response){
    var data        = [];
    var location    = req.body.location;
    var username    = req.body.username;
// Save search value from user
    if(username) {
        last.findOneAndRemove({username:username},function(err){
            if (err) throw err;
            var newLast = new last({
                username: username,
                last: location,
            }) 
            newLast.save(function(err){
                if(err) throw err;
            })
        }) 
    }
// Request to Yelp API server
    var option = {
        url: "https://api.yelp.com/v3/businesses/search?term=bar&limit=10&location=" + location,
        headers: {
    // Set Authorization Type to Request
            Authorization: "Bearer " + "fdNYgTq-voXax32LrWWy3tA2ArtaI2SiD8xpiUSCePO_ZAYba0OfhF4BwPexcHGTtgE84RPQbBo3p-5dWaKOkl500anMxZCaDAA-9YFiyAVr0bVCfDA_LiB5xV8zWnYx"
        }
    }
    request(option, function(err,res,body){
        if(err) throw err;
        body = JSON.parse(body);
        var i = 0;
        (function find () {
            var bar = body.businesses[i].name;
            var url = body.businesses[i].image_url;
            var barState = body.businesses[i].is_closed ?   "Close" : "Open Now";
            var state = false;
            i = i+1;
            ongoing.findOne({bar: bar}, function(err, out){
                if(err) throw err;
                if(out) {
                    for (var x = 0; x< out.username.length; x++) {
                        if (username == out.username[x]) state = true;
                    }
                    console.log(out);
                    data.push({bar: bar, value: out.username.length, url: url, barState: barState, state: state});
                } else {
                    data.push({bar: bar, value: 0, url: url, barState: barState, state: state});
                }
                if( i< body.businesses.length) find();
                else {
                    response.json(data);
                }
            })
        })();
    })
   
})
app.post("/update", function(req,res){
    var username = req.body.username;
    var bar = req.body.bar;
    console.log(username + " " + bar);
    ongoing.findOne({bar: bar},function(err,data){
        if(err) throw err;
        if(data) {
            var duplicate = false;
            for (var i = 0; i < data.username.length; i++) {
                if (data.username[i]==username) {
                    data.username.splice(i,1);
                    duplicate = true;
                }
            }
            if (duplicate) {
                console.log(data.username);
                save();
            } else {
                data.username.push(username);
                save();
            }
            function save () {ongoing.findByIdAndRemove(data._id, function(err){
                if(err) throw err;
                var newOngoing = new ongoing ({
                    bar: bar,
                    username: data.username
                })
                newOngoing.save(function(err){
                    if (err) throw err;
                    console.log("data updated");
                })
            })}
        } else {
            var newOngoing = new ongoing ({
                bar: bar,
                username: [username]
            })
            newOngoing.save(function(err){
                if(err) throw err;
                console.log("data saved");
            })
        }
    })
    
})



app.listen(3000);