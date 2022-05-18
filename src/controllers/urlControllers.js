const urlModel = require("../models/urlModel");
const shortid = require('shortid');
const validUrl = require('valid-url');
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    13190,
    "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const createUrl = async function (req, res) {
    try {
        const localurl = 'http:localhost:3000';
        const urlCode = shortid.generate();
        let { longUrl } = req.body;
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, msg: "longUrl is required." })
        }
        let url = await urlModel.findOne({ longUrl });
        if (url) {
            return res.send({ data: url })
        }
        const shortUrl = localurl + '/' + urlCode;
        url = new urlModel({ longUrl, shortUrl, urlCode }), await url.save();
        res.send(url);
    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}

const getUrl = async function (req, res) {
    try {
        const url = await GET_ASYNC(`${req.params.urlCode}`);
        if (url) {
            res.redirect(JSON.parse(url))
        } else {
            let findUrl = await urlModel.findOne({ urlCode: req.params.urlCode });
            if (!findUrl)
                return res.status(404).send({ status: false, message: "Url not found." });
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl.longUrl))
            res.redirect(findUrl.longUrl);
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}

module.exports = { createUrl, getUrl }