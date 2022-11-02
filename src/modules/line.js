(function(hello) {

	hello.init({
		line: {
			name: 'line',
			oauth: {
				version: 2,
				auth: 'https://access.line.me/oauth2/v2.1/authorize',
				grant: 'https://api.line.me/oauth2/v2.1/token',
				response_type: 'code',
				scope: {
					basic: 'profile%20openid%20email', // https://developers.line.biz/en/docs/line-login/integrate-line-login/#scopes
				},
				state: Math.random(),
				scope_map: {
					basic: ['profile', 'openid', 'email'],
				},
			},

			base: 'https://access.line.me/oauth2/v2.1/',

			get: {
				me: function(p, callback) {
					p.headers = {
						Authorization: `Bearer ${p.authResponse.access_token}`,
					};
					var form_data = new URLSearchParams;
					form_data.append('id_token', `${p.authResponse.id_token}`);
					form_data.append('client_id', `${hello.services[p.network].id}`);
					fetch('https://api.line.me/oauth2/v2.1/verify',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
							},
							body: form_data
						}
					).then(function(res) {
						return res.json();
					}).then(function(json) {
						p.token_data = json;
						callback('https://api.line.me/v2/profile');
					});
				},
			},

			login: function(p) {
				// OAuth2 non-standard adjustments
				p.qs.scope = 'profile%20openid%20email';
			},

			wrap: {
				me: function(o, h, p) {
					if (o.userId) {
						o.picture = o.thumbnail = o.pictureUrl;
						o.id = o.userId;
						o.name = o.displayName;
						o.email = p.token_data.email;
					}

					return o;
				},
			},

			jsonp: false,
		},
	});
})(hello);
