module.exports = {

    mongo: 'mongodb://localhost/spreeboard_dev',

    gitlab: {
        key: 'b679362c4983c505b28a20e84fd21888dfa7f71037fa97aa1dafc670bb0a1778',
        secret: '97ecb4035e32b4ab1ec8c2f97e88a581d68f0742ae7e609aca4eb625e81cf4a4',

        // key: '9c43d7bf9c5cc6952e69ccb04940bae35dd15b5360138381fd758ccbf6308ead',
        // secret: 'eefcf5dd82c759fe6d582cd435c43b42beab132bb7b951c5ef15d32dbd366b45',

        url: 'http://localhost:8080/',
        api: 'http://localhost:8080/api/v3/',
        callbackUrl: 'http://localhost:3000/auth/gitlab/callback'
    }

};