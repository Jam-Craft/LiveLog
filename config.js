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
var config = {
	/**
	 * Defines the application bind hostname.
	 * @var			string
	 */
	'hostname':		undefined,

	/**
	 * Defines the application port.
	 * @var			integer
	 */
	'port':			8080,

	/**
	 * Defines the application base URL.
	 * @var			string
	 */
	'baseURL':		'http://localhost:8080',

	/**
	 * Defines a regex which may be applied to messages to remove them.
	 * @var			RegExp
	 */
	censorPattern:		null,

	/**
	 * Enables log colors.
	 * @var			boolean
	 */
	enableColors:		true,

	/**
	 * Stores all color matchers
	 */
	color:			{
		debug:			new RegExp ('\\[(.*)?(DEBUG|FINE(ST)?)\\]', 'i'),
		error:			new RegExp ('\\[(.*)?ERROR\\]', 'i'),
		warning:		new RegExp ('\\[(.*)?WARN(ING)?\\]', 'i')
	},

	/**
	 * Defines
	 */
	playbackBuffer:		50,

	/**
	 * Defines the file poll interval.
	 * @var			integer
	 */
	pollInterval:		1000,

	/**
	 * Defines all monitored files.
	 * @var			string
	 */
	'files':		[
		'test.txt',
		'test2.txt'
	]
};

// DO NOT EDIT ANYTHING BELOW THIS LINE
module.exports = config;