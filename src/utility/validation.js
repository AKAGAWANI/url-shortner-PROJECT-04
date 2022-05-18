const mongoose = require("mongoose")

let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}

let isEmpty = function (value) {
    if (typeof value === 'undefined' || value === null) return true;
    if (typeof value === 'string' && value.trim().length === 0) return true;
    return false;
}

let isValidUrl = function (url) {
    let urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    return urlRegex.test(url);
}

module.exports = {
    isValidRequestBody,
    isEmpty,
    isValidUrl
}