
require('colors');

const CONFIG		= require('./config');
const Twitter 		= require('twitter');
const twitter 		= new Twitter(CONFIG.twitter);
const xls 			= require('./xls')(CONFIG);

var sheets = CONFIG.target.map(key => ({
	key: key,
	left: CONFIG.limit,
	count: 0
}));

sheets.forEach(target => {
	twitter.stream('statuses/filter', { track: target.key }, stream => {
		stream.on('data', data => {
			if(!data) return;

			target.left--;
			target.count++;

			if(target.left <= 0) return closeStream(stream, target);
			
			console.log(`#${target.key}`.cyan + `(${target.count+1})`.yellow, data.text);
			xls.writeXls(target.key, data);
		});
		stream.on('error', err=>{
			console.error('Twitter stream error'.red);
			console.error(err);
		});
	});
});

function closeStream(stream) {
	stream.destroy();
	for(let i=0, l=sheets.length; i < l; i++){
		if(sheets[i].left > 0)
			return;
	}
	exit({finish: true});
}

// Handle exit
function exit(options, err) {
	if(err) console.error(err);
	if(options.finish){
		console.log(`Saving changes to ${CONFIG.output}...`.green);
		xls.saveXls()
			.then(()=>{
				console.log('Done.'.blue, 'Exiting...'.red);
				exit({exit: true})
			})
			.catch(err => {
				exit({exit: true})
			});
	}
	if(options.exit){
		if (err) console.error(err.stack);
		if (options.exit) process.exit();	
	}
}

process.on('SIGINT', 			exit.bind(null, {finish: true}));
process.on('uncaughtException', exit.bind(null, {finish: true}));

// exit on buggy шindoшs
if(process.platform === "win32"){
	(require("readline").createInterface({
		input: process.stdin,
		output: process.stdout
	})).on("SIGINT", ()=>{
		process.emit("SIGINT");
	});
}

// Autosave
const save = (timeout=0) => setTimeout(()=>{
	xls.saveXls()
		.then(save.bind(null, timeout))
		.catch(err => {save(timeout)});
}, timeout);
// save(1000);