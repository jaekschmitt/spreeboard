var _ = require('lodash');

module.exports = {
    loadStub: function(args) {
        return {
            issues: {
                load: function(pkg, cb) {
                    cb(null, _.extend({
                        id: 42,
                        iid: 3,
                        project_id: 8,
                        title: "Add user settings",
                        description: "",
                        labels: [],
                        milestone: {},
                        assignee: {},
                        author: {},
                        state: "opened"                        
                    }, args));
                }
            }
        };
    }
};