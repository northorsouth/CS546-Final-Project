const mongoCollections = require("../mongo/collections");
const users = mongoCollections.users;
const uuid = require('uuid/v4');
const checkType = require('./Typecheck');
const DatabaseError = require('./Error/DatabaseError');
const FormatError = require('./Error/FormatError');

