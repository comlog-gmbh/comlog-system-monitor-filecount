# Watch a Directory files

Installation via
```sh
$ npm install -s comlog-system-monitor-filecount
```

# Usage
```javascript
var Service = require('comlog-system-monitor-filecount');

var csmf = new Service({
	path: "/tmp", // Or function
	interval: 60000, // 1 Minute
	max: 1000, // Max count of ifles (-1 == ignore)
	min: -1, // Min count of ifles (-1 == ignore)
	folder: false // count folder (faster)
});

csmf.on('error', function(err) {
    console.error(err);
});

// bind event
csmf.on('down', function() {
    console.info('Max or min limit overflow');
});

// bind event
csmf.on('up', function() {
    console.info('File limit ok now');
});
```
