const fs = require('fs');
const path = require('path');

function ComlogFileTimeWatcher(options) {
	require('comlog-event-handler')(this);

	var	_self = this;
	this.satus = null; // null = start, true = off, false = on
	this.path = null;
	this.debug = false;
	this.interval = 60000; // 1 Minute
	this.max = 1000; // Maximale anzahl der Dateien -1 == ignore
	this.min = -1; // Minimale anzahl der Dateien -1 == ignore
	this.folder = false; // Ordner mit zählen

	// Private funktionen
	var _running = false, _timer = null;

	function _count(dir, files, count,  cb) {
		if (files && files.length > 0) {
			var file = files.shift();
			if (_self.folder) {
				_count(dir, files, ++count, cb);
			} else {
				fs.stat(dir+path.sep+file, function (err, Stats) {
					if (err || Stats.isDirectory()) {
						_count(dir, files, count, cb);
					} else {
						_count(dir, files, ++count, cb);
					}
				});
			}

			return;
		}

		cb(null, count);
	}

	function _watch() {
		if (_running) return;
		_running = true;

		var p = path.normalize((typeof _self.path == 'function') ? _self.path() : _self.path);
		if (_self.debug) console.info('Check '+p+' ...');

		fs.readdir(p, function (err, files) {
			//console.info(files);
			_count(path.normalize(p), files, 0, function (err, cnt) {
				//console.info(arguments);
				if (err !== null) {
					if (_self.debug) console.error(err.stack || err);
					_self.trigger('error', [new Error("FileCount error for "+p+" \n"+err.message)]);
					if (_self.satus === true) _self.trigger('down');
					_self.satus = false;
				} else {
					// Service is down
					if (_self.max > -1 && cnt >= _self.max) {
						if (_self.debug) console.info("FileCount overflow "+_self.max+" in "+p);
						if (_self.satus === true) _self.trigger('down');
						_self.satus = false;
					}
					else if (_self.min > -1 && cnt <= _self.min) {
						if (_self.debug) console.info("FileCount underflow "+_self.min+" in "+p);
						if (_self.satus === true) _self.trigger('down');
						_self.satus = false;
					}
					else {
						if (_self.debug) console.info("FileCount ok "+p);
						if (_self.satus === false) _self.trigger('up');
						_self.satus = true;
					}
				}

				_running = false;
				_timer = setTimeout(_watch, _self.interval);
			});
		});
	}
	
	/**
	 * Überwachung starten
	 */
	this.start = function() {
		_watch();
	};

	/**
	 * Überwachung stoppen
	 */
	this.stop = function() {
		if (_timer !== null) clearInterval(_timer);
	};

	for(var i in options) this[i] = options[i];

	if (typeof this.path == 'string' && this.path.substr(0, 9) == 'function(') {
		this.path = eval('this.path = '+this.path);
	}
}

module.exports = ComlogFileTimeWatcher;