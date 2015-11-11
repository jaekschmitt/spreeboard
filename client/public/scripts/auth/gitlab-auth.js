(function(hello){
    hello.init({
        gitlab : {
            name : 'gitlab',                        
            oauth : {
                version : 2,
                auth: 'http://localhost:8080/oauth/authorize',
                grant : 'http://localhost:8080/oauth/token',                
                response_type: 'code'
            },
            
            scope: {
                basic: ''
            },

            base: "http://localhost:8080/api/v3/",

            get: {
                me: 'user'
            }
        }
    });    
})(hello);