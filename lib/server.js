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
var crypto = require ('crypto');
var fs = require ('fs');
var timers = require ('timers');

var pkg = require ('../package.json');

/**
 * Provides a server implementation.
 * @param io The socket server.
 * @param files The known files.
 * @constructor
 */
function Server (io, files, config) {
	// create default variables
	this.config = config;
	this.files = files;
	this.fileHashes = { };
	this.io = io;
	this.messageIndex = { };
	this.recentMessages = { };
	this.timeouts = { };
	this.watchers = { };

	/**
	 * Calculates a hash value.
	 * @param fileName The filename.
	 */
	this.calculateHash = function (fileName) {
		// generate missing hash
		if (!this.fileHashes[fileName]) {
			// get hash
			var hash = crypto.createHash ('sha1');

			// add data
			hash.update (fileName);

			// calculate digest
			this.fileHashes[fileName] = hash.digest ('hex');
		}

		// return hash
		return this.fileHashes[fileName];
	};

	/**
	 * Handles socket connections.
	 * @param socket
	 */
	this.connect = function (socket) {
		// create handshake files
		var handshakeFiles = [ ];

		this.files.forEach (function (item) {
			handshakeFiles.push ({
				fileID:		this.calculateHash (item),
				fileName:	item
			});
		});

		// send handshake
		socket.emit ('handshake', {
			version:		pkg.version,
			files:			handshakeFiles
		});

		// replay recent messages on all files
		for (var key in this.recentMessages) {
			// iterate over messages
			for (var i = 0; i < this.recentMessages[key].length; i++) {
				// send message
				this.sendMessage (socket, key, this.recentMessages[key][i]);
			}
		}
	};

	/**
	 * Handles file changes.
	 * @param eventName The event type.
	 * @param fileName The file name.
	 */
	this.onFileChange = function (eventName, fileName) {
		// handle renames
		if (eventName == 'rename') {
			// register timeout
			this.timeouts[fileName] = timers.setTimeout (this.proxy (function () {
				if (!fs.existsSync (fileName)) {
					// debug
					console.log ('A file has been removed: ' + fileName);

					// reset index
					this.messageIndex[fileName] = -1;

					// reset known messages
					this.recentMessages[fileName] = [ ];
				}
			}, this));
		}

		// handle changes
		if (eventName == 'change') {
			// debug
			console.log ('Changed file: ' + fileName);

			// delete removal timeout
			if (!!this.timeouts[fileName]) timers.clearTimeout (this.timeouts[fileName]);

			this.readMessages (fileName);

			// iterate over elements
			for (var i = 0; i < this.recentMessages[fileName].length; i++) {
				// check index
				if (this.messageIndex[fileName] >= i) continue;

				// notify users
				this.sendMessage (null, fileName, this.recentMessages[fileName][i]);

				// update index
				this.messageIndex[fileName]++;
			}
		}
	};

	/**
	 * Proxies method contexts.
	 * @param method The method.
	 * @param context The context.
	 * @returns {Function} The proxy method.
	 */
	this.proxy = function (method, context) {
		return function () {
			method.apply (context, arguments);
		};
	};

	/**
	 * Reads all file messages.
	 * @param fileName The file to read from.
	 */
	this.readMessages = function (fileName) {
		// reset recent messages
		this.recentMessages[fileName] = [ ];
		if (!this.messageIndex[fileName]) this.messageIndex[fileName] = -1;

		// read message array
		this.recentMessages[fileName] = fs.readFileSync (fileName).toString ().split (/\r\n|\r|\n/g);
	};

	/**
	 * Sends a message.
	 * @param socket The socket.
	 * @param fileName The file name.
	 * @param message The message.
	 */
	this.sendMessage = function (socket, fileName, message) {
		// censor message
		if (!!this.config.censorPattern) message = message.replace (this.config.censorPattern, "*REDACTED*");

		// create message
		var data = {
			fileID:		this.calculateHash (fileName),
			fileName:	fileName,
			message:	message,
			type:		(this.config.enableColors ? (message.match (this.config.color.debug) ? 'debug' : (message.match (this.config.color.warning) ? 'warning' : (message.match (this.config.color.error) ? 'error' : 'unknown'))) : 'unknown')
		};

		// send global message
		if (socket == undefined || socket == null) {
			// broadcast to all clients
			this.io.sockets.emit ('message', data);

			// skip further execution
			return;
		}

		// send message
		socket.emit ('message', data);
	};

	/**
	 * Starts watching a file.
	 * @param fileName The file.
	 */
	this.watchFile = function (fileName) {
		// check for previous watcher
		if (!!this.watchers[fileName]) return true;

		// watch
		var watcher = fs.watch (fileName);

		// hook events
		watcher.on ('change', this.proxy (this.onFileChange, this));

		// store watcher
		this.watchers[fileName] = watcher;
	};

	// calculate hash values & register watchers
	this.files.forEach (this.proxy (function (item) {
		// calculate hash
		this.calculateHash (item);

		// read files
		this.readMessages (item);

		// watch file
		this.watchFile (item);
	}, this));

	// hook methods
	io.on ('connection', this.proxy (this.connect, this));
}

// export method
module.exports = Server;