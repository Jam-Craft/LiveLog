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
define (['jquery', 'socket.io', 'template'], function ($, io, template) {
	return function (url) {
		// define runtime variables
		var selectedFile = null;
		var knownFiles = [];

		// connect to server
		var socket = io.connect (url);

		// hook events
		socket.on ('handshake', function (data) {
			// log
			console.log ('LiveLog v' + data.version);
			console.log ('Copyright (C) 2014 Evil-Co <http://www.evil-co.org>');
			console.log ('---------------------------------------------------');

			// clear HTML
			$('#sidebarContent').html ('');
			$('#main').html ('');

			// clear array
			selectedFile = null;
			knownFiles = [];
			var fileShown = false;

			// add files to list
			data.files.forEach (function (file) {
				// create elements
				$('#sidebarContent').append (template.sidebarItem ({ 'file': file.fileName, 'fileID': file.fileID }));
				$('#main').append (template.messageContainer ({ 'file' : file.fileID }));

				// hook clicks
				$('#item' + file.fileID).click (function () {
					// hide all known elements
					$('#main > pre').addClass ('hidden');

					// show corresponding message
					$('#messageContainer' + file.fileID).removeClass ('hidden');
				});

				// show file by default
				if (!fileShown) {
					// show corresponding message
					$('#messageContainer' + file.fileID).removeClass ('hidden');

					// show file
					fileShown = true;
				}

				// push to stack
				knownFiles.push (file);
			});
		});

		socket.on ('message', function (data) {
			// log
			console.log ("Received message: " + data.message);

			// create element
			var element = $('<span></span>');
			element.addClass ((data.type == 'error' ? 'messageError' : (data.type == 'warning' ? 'messageWarning' : (data.type == 'debug' ? 'messageDebug' : 'messageUnknown'))));
			element.text (data.message);

			// append
			$('#messageContainer' + data.fileID).append (element);
			$('#messageContainer' + data.fileID).append ('<br />');
		});
	};
});