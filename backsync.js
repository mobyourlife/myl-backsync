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
            console.log('Falha de conexão com o banco de dados!');
			console.log(error);
			return;
        }
		else
		{
			console.log('Conexão estabelecida com sucesso!');
			
			/* Consulta os usuários cadastrados. */
			connection.query("SELECT page_fbid, access_token FROM myl_accounts;", function (error, rows, columns) {
				if (error)
				{
					console.log('Erro na consulta dos usuários cadastrados!');
					console.log(error);
					return;
				}
				else
				{
					if (rows.length > 0)
					{
						/* Percorre todos os usuários encontrados. */
						for (i = 0; i < rows.length; i++)
						{
							/* Utiliza os tokens dos usuários para sincronização de suas informações. */
							var page_fbid = rows[i].page_fbid;
							fb.setAccessToken(rows[i].access_token);
							
							console.log('Sincronizando página ' + page_fbid + '...');
						}
					}
					else
					{
						console.log('Nenhum usuário cadastrado.');
					}
				}
			});
        }
		
		return;
    });
}

exports.Start = Start;