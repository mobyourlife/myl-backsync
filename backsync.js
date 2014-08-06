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
	console.log('');
			
			/* Consulta os usuários cadastrados. */
			connection.query("SELECT admin_uid, page_fbid, access_token FROM myl_accounts;", function (error, rows, columns)
			{
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
							var is_fanpage = (rows[i].admin_uid != rows[i].page_fbid);
							fb.setAccessToken(rows[i].access_token);
							
							console.log('Sincronizando ' + (is_fanpage ? 'página' : 'perfil') + ' ' + page_fbid + '...');
							
							/* Sincronizando informações do perfil do usuário. */
							if (is_fanpage == false)
							{
								fb.api('/v2.0/me', function (res)
								{
									/* TODO */
									//console.log(res);
								});
							}
							else
							{
								fb.api('/v2.0/' + page_fbid, function (res)
								{
									/* TODO */
									//console.log(res);
								});
							}
							
							/* Sincronizando informações dos álbuns. */
							fb.api('/v2.0/me/albums', function (albums)
							{
								if (!albums || albums.error)
								{
									console.log('Erro na consulta dos álbuns!');
									console.log(error);
									return;
								}
								else
								{
									albums.data.forEach(function (a)
									{
										if (a.count)
										{
											console.log('Sincronizando álbum: ' + a.id + ' (' + a.name + '), fotos: ' + a.count);
											connection.query("INSERT INTO myl_fb_albums (album_id, page_fbid, album_type, count, updated_time) VALUES (" + a.id + ", " + page_fbid + ", '" + a.type + "', " + a.count + ", '" + format_date(a.updated_time) + "') ON DUPLICATE KEY UPDATE count = " + a.count + ", updated_time = '" + format_date(a.updated_time) + "';");
											
											/* Sincronizando informações das fotos de cada álbum modificado. */
											console.log('Sincronizando fotos do álbum ' + a.id + '...');
											var album_id = a.id;
											
											fb.api('/v2.0/' + album_id + '/photos', function (photos)
											{
												if (!photos || photos.error)
												{
													console.log('Erro na consulta das fotos!');
													console.log(error);
													return;
												}
												else
												{
													photos.data.forEach(function (p)
													{
														connection.query("INSERT INTO myl_fb_photos (photo_id, album_id, source_url, thumbs_url) VALUES (" + p.id + ", " + album_id + ", '" + p.images[0].source + "', '" + p.images[p.images.length - 1].source + "') ON DUPLICATE KEY UPDATE source_url = '" + p.images[0].source + "', thumbs_url = '" + p.images[p.images.length - 1].source + "';");
													});
												}
											});
										}
									});
								}
							});
							
							console.log('');
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