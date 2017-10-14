
require('colors');

const CONFIG		= require('./config');
const Twitter 		= require('twitter');
const twitter 		= new Twitter(CONFIG);
const xls 			= require('./xls')(CONFIG);

const limit = 10;
var count = 0;

twitter.stream('statuses/filter', { track: 'bitcoin' }, function(stream) {
	stream.on('data', data => {
		console.log(data && data.text);
		if(!data)
			return;
		if(count > limit)
			return exit({finish: true});
		xls.writeBitCoinXls(data);
		count++;
	});
	stream.on('error', err=>{
		console.error('Twitter stream error'.red, err);
		console.error(err);
	});
});

// Handle exit
function exit(options, err) {
	if(err)
		console.error(err);
	setTimeout(function(){
		if (options.finish){
			console.log(`Saving changes to ${CONFIG.output}`.green);
			xls.saveXls()
				.then(()=>{
					console.log('Done.', 'Exiting...'.red);
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
	})
}

process.on('SIGINT', 			exit.bind(null, {finish: true}));
process.on('uncaughtException', exit.bind(null, {finish: true}));

// Autosave
const save = (timeout=0) => setTimeout(()=>{
	xls.saveXls()
		.then(save.bind(null, timeout))
		.catch(err => {save(timeout)});
}, timeout);
// save(1000);