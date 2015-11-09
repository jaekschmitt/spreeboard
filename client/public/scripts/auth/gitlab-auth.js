(function(hello){
    var CLIENT_IDS = {
        myoauth : 'e09f24d7df6b1219c7cd1ffa1103989ffd2a42f4eff349c8a6f1d159dcb3debe'
    };

    hello.init({
        gitlab : {
            name : 'gitlab',

            oauth : {
                version : 2,
                auth : 'http://localhost:8080/oauth/authorize?',
                grant : 'http://localhost:8080/oauth/token?'
            },
            response_type : 'code',
            oauth_proxy: 'https://auth-server.herokuapp.com/proxy',
            refresh : false
        }
    }, {
        oauth_proxy: 'https://auth-server.herokuapp.com/proxy'
    });

    hello.on('auth.cancelled', function(auth) {
        var test = auth;
    });

    hello.on('auth.login', function(auth) {
        var test = auth;
    });

    hello.on('auth.failed', function(auth) {
        var test = auth;
    });    
})(hello);