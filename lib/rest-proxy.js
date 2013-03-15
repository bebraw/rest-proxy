var request = require('request');


module.exports = function(app, opts) {
    if(!opts || !opts.url || !opts.target) return console.error('Proxy is missing parameters!', opts);

    var url = opts.url;
    var target = opts.target;
    var middleware = opts.middleware || function(req, res, next) {next();};
    var params = getParams.bind(undefined, opts.qs); // qs as string

    app.get(url + '/*', middleware, function(req, response) {
        request.get(params({
            url: target + req.originalUrl
        }), function(err, res, body) {
            if(!err && res.statusCode == 200) return response.send(JSON.parse(body));

            response.send(404);
        });
    });

    app.post(url + '/*', middleware, function(req, response) {
        request.post(params({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url: target + req.originalUrl,
            json: req.body
        }), function(err, res, body) {
            if(!err && res.statusCode == 200) return response.json(body);

            response.send(404);
        });
    });

    app.put(url + '/*', middleware, function(req, response) {
        request.put(params({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url: target + req.originalUrl + '/' + req.body._id,
            json: req.body
        }), function(err, res, body) {
            if(!err && res.statusCode == 200) return response.json(body);

            response.send(404);
        });
    });

    app['delete'](url + '/*', middleware, function(req, response) {
        request.del(params({
            url: target + req.originalUrl + '/' + req.body.id,
            json: req.body
        }), function(err, res, body) {
            if(!err && res.statusCode == 200) return response.send(body);

            console.error('Failed to connect to backend!', err, body);
        });
    });
};

function getParams(qs, out) {
    if(!qs) return out;

    if(out.url.indexOf('?') >= 0) out.url += qs;
    else out.url += '?' + qs;

    return out;
}
