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

let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}



const createUrl = async function (req, res) {
    try {
        const localurl = 'http:localhost:3000';
        const urlCode = shortid.generate().toLowerCase();
        let { longUrl } = req.body;
        if (!isValidRequestBody(req.body)) return res.status(400).send({status: false, message: "Please provide details in body"})
                    
        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, msg: "longUrl is not valid." })
    
        const checkUrl_Code = await urlModel.findOne({ urlCode: urlCode})
        if (checkUrl_Code) return res.status(409).send({status: false, message: "urlCode already exist"})
        let redisUrl = await urlModel.findOne({longUrl: longUrl})
        if(redisUrl){
        let urlCode1=redisUrl.urlCode
        let url = await GET_ASYNC(`${urlCode1}`)
        if (url) return res.status(200).send({status: true,msg:"shortUrl alredy exist in catche", data: JSON.parse(url)})
        }
        let dbUrl = await urlModel.findOne({longUrl: longUrl}).select({ __v: 0, _id: 0, createdAt: 0, updatedAt: 0 })
        if(dbUrl) return res.status(200).send({ status: true,msg:"shortUrl alredy exist in database", data: dbUrl })
        const shortUrl = localurl + '/' + urlCode;
        let result = {urlCode: urlCode,longUrl: longUrl,shortUrl: shortUrl}
        
        url = new urlModel({ longUrl, shortUrl, urlCode }), await url.save();
        return res.status(201).send({status:true,message:"success",data:result});
    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}


const getUrl = async function (req, res) {
    try {
        const url = await GET_ASYNC(`${req.params.urlCode}`);
        if (url)  return res.status(200).send({status:true,message:"success",catchedData:JSON.parse(url)})
         else {
            let findUrl = await urlModel.findOne({ urlCode: req.params.urlCode });
            if (!findUrl) return res.status(404).send({ status: false, message: "Url not found." });
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl.longUrl))
            return res.redirect(findUrl.longUrl);
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}

module.exports = { createUrl, getUrl }

