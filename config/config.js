module.exports = {

    mongo: 'mongodb://localhost/spreeboard_dev',

    gitlab: {
        key: '2a1e3f5a0a0a98449fe5888d83e579dcf237d4de2a3809cb676d120a21b64b62',
        secret: 'e217640c5b163c198495674baa429cf21fed9b2ee28f29703af94796e357dd3d',

        // key: 'e09f24d7df6b1219c7cd1ffa1103989ffd2a42f4eff349c8a6f1d159dcb3debe',
        // secret: 'a7af84d9ba7f7f9753e8b86edd3ccdebb8f50e875a2bb6017ce8f21fb7fd8c76',
        
        url: 'http://localhost:8080/',
        callbackUrl: 'http://localhost:8888/auth/gitlab/callback'
    }

};