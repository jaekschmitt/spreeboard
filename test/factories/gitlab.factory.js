var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('gitlab-issue', {}, {
        id: 42,
        iid: 3,
        project_id: 8,
        title: "Add user settings",
        description: "",
        labels: [],
        milestone: {
            id: 1,
            title: "v1.0",
            description: "",
            due_date: "2012-07-20",
            state: "closed",
            updated_at: "2012-07-04T13:42:48Z",
            created_at: "2012-07-04T13:42:48Z"
        },
        assignee: {
            id: 2,
            username: "jack_smith",
            email: "jack@example.com",
            name: "Jack Smith",
            state: "active",
            created_at: "2012-05-23T08:01:01Z"
        },
        author: {
            id: 1,
            username: "john_smith",
            email: "john@example.com",
            name: "John Smith",
            state: "active",
            created_at: "2012-05-23T08:00:58Z"
        },
        state: "opened",
        updated_at: "2012-07-12T13:43:19Z",
        created_at: "2012-06-28T12:58:06Z"
    });
};