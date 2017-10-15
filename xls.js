
require('colors');
const FS 			= require('fs');
const Excel 		= require('exceljs');
const Moment		= require('moment');
const packageJson 	= require('./package.json');
const author 		= process.env.USER || packageJson.author;

module.exports = function(CONFIG){

	const fileStream 		= FS.createWriteStream(CONFIG.output);
	const workbook 			= new Excel.Workbook();
	workbook.creator 		= author;
	workbook.lastModifiedBy = author;

	const worksheets = {};
	CONFIG.target.forEach(target => {
		worksheets[target] = workbook.addWorksheet(target);
		worksheets[target].columns = [
			{ header: 'Date', key: 'date', width: 17 },
			{ header: 'ID',   key: 'id',   width: 10 },
			{ header: 'User', key: 'user', width: 10 },
			{ header: 'Lang', key: 'lang', width: 5 },
			{ header: 'Message', key: 'text', width: 80 },
			{ header: 'Emotion', key: 'emotion', width: 10 },
			{ header: 'Link', key: 'link', width: 50 }
		];
	});

	const writeXls = function(target, data){

		var row = worksheets[target].addRow({
			date: Moment(Number(data.timestamp_ms)).format('MMMM Do YYYY, hh:mm:ss'),
			id: { 
				text: '@'+data.user.screen_name, 
				hyperlink: `https://twitter.com/${data.user.name}`
			},
			user: data.user.name,
			lang: data.lang,
			text: data.text,
			link: { 
				text: `https://twitter.com/${data.user.name}/status/${data.user.id_str}`, 
				hyperlink: `https://twitter.com/${data.user.name}/status/${data.user.id_str}`
			},
		});

		row.height = 60;
		row.alignment = { 
			vertical: 'top', 
			horizontal: 'left',
			wrapText: true
		}

		row.getCell('date').fill = 
		row.getCell('user').fill = 
		row.getCell('id').fill = {
    		type: 'pattern',
    		pattern: 'solid',
			fgColor:{argb:'ffdaebfd'},
    		bgColor:{argb:'FF0000FF'}
		}

		row.getCell('link').fill = {
    		type: 'pattern',
    		pattern: 'solid',
			fgColor:{argb:'ffEEEEEE'},
    		bgColor:{argb:'FF0000FF'}
		}

		row.getCell('lang').fill = {
    		type: 'pattern',
    		pattern: 'solid',
			fgColor:{argb:'ffffe599'},
    		bgColor:{argb:'FF0000FF'}
		}

		row.getCell('text').fill = 
		row.getCell('emotion').fill = {
    		type: 'pattern',
    		pattern: 'solid',
			fgColor:{argb:'FFFFFFFF'},
    		bgColor:{argb:'FF0000FF'}
		}

		row.getCell('id').border =
		row.getCell('user').border =
		row.getCell('lang').border ={
		    top: {style:'thick', color: {argb:'FFCCCCCC'}},
		    bottom: {style:'thick', color: {argb:'FFCCCCCC'}},
		}

		row.getCell('date').border =
		row.getCell('text').border =
		row.getCell('emotion').border =
		row.getCell('link').border =  {
		    left: {style:'thick', color: {argb:'FFCCCCCC'}},
		    right: {style:'thick', color: {argb:'FFCCCCCC'}},
		    top: {style:'thick', color: {argb:'FFCCCCCC'}},
		    bottom: {style:'thick', color: {argb:'FFCCCCCC'}},
		}
	}

	const saveXls = function saveXls(){
		return workbook.xlsx.write(fileStream);
	}

	return {
		writeXls: 	writeXls,
		saveXls: 	saveXls
	};
}