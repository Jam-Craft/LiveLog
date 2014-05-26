/*
 * Copyright (C) 2014 Evil-Co <http://wwww.evil-co.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// includes
var config = require ('./config.js');
var express = require ('express');
var http = require ('http');
var socketIO = require ('socket.io');

// define variables
var recentMessages = { };
var messageIndex = { };
var fileHashes = { };

// create server
var application = express ();
var httpServer = application.listen (config.port);
var io = socketIO.listen (httpServer);

// configure server
application.configure (function () {
	application.use (require('less-middleware') (__dirname + '/static'));
	application.use (express.static (__dirname + '/static'));
	application.use (express.bodyParser ());
	application.use (express.methodOverride ());
});

/**
 * Handles connection requests.
 */
application.get ('/connection', function (request, response) {
	response.set ('Content-Type', 'text/plain');
	response.send (config.baseURL);
});

// create server instance
var server = new require ('./lib/server.js') (io, config.files, config);