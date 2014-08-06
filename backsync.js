var fb = require('fb');
var fs = require('fs');
var http = require('http');
var mysql = require('mysql');
var config = require('./config.json');

function format_date(time) {
	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," "));
	var ret = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	return ret;
}

function Start() {
	console.log('MOB YOUR LIFE - BACK SYNC');

	/* Define os dados de conexão ao servidor MySQL. */
    var connection = mysql.createConnection({
		"hostname": config.database.host,
		"user": config.database.user,
		"password": config.database.pass,
		"database": config.database.name
	});
	
	console.log('');
	console.log('### Configurações ###');
	console.log(' *  Hostname: ' + config.database.host);
	console.log(' *  Username: ' + config.database.user);
	console.log(' *  Database: ' + config.database.name);
	console.log('');
	
	/* Estabelece conexão com o servidor MySQL. */
	console.log('Estabelecendo conexão com o servidor de banco de dados...');
	connection.connect(function (error)
	{
        if (error)
		{
            return console.log('Falha de conexão com o banco de dados! Mensagem de erro: ' + error);
        }
		else
		{
			console.log('Conexão estabelecida com sucesso!');
        }
    });
}

exports.Start = Start;