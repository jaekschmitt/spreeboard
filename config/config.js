module.exports = {

    mongo: 'mongodb://localhost/spreeboard_dev',

    gitlab: {
        // key: '2a1e3f5a0a0a98449fe5888d83e579dcf237d4de2a3809cb676d120a21b64b62',
        // secret: 'e217640c5b163c198495674baa429cf21fed9b2ee28f29703af94796e357dd3d',

        key: '9c43d7bf9c5cc6952e69ccb04940bae35dd15b5360138381fd758ccbf6308ead',
        secret: 'eefcf5dd82c759fe6d582cd435c43b42beab132bb7b951c5ef15d32dbd366b45',

        url: 'http://localhost:8080/',
        api: 'http://localhost:8080/api/v3/',
        callbackUrl: 'http://localhost:3000/auth/gitlab/callback'
    }

};