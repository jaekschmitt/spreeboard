# Spreeboard

Spreeboard is an application written using Node.js and Mongo to help our team at Spreetail maintain the flow of tasks through our Software Department. It focuses on visibility for all parties involved and interfaces with our internal Gitlab server to sync our work boards with Gitlab issues, milestones, and developers.

## Developers

Setting up your development environment to run Spreeboard requires a few different prerequisites:

#### Mongo Server

Before running Spreeboard you will need a running mongo server.  There are a few options including installing your own local server ([Monogo Manual](https://docs.mongodb.org/manual/)) or choosing an online services such as [MongoLab](https://mongolab.com/)

#### Gitlab Server

You will also need access to a Gitlab server.  The easiest way is to insall [Vagrant](https://www.vagrantup.com) to create a basic Ubuntu box (I used a ubuntu/trusty64 box).  Once the box is created simply ssh into vagrant using 'vagrant ssh` and run the following commands:

- `sudo apt-get install curl openssh-server ca-certificates postfix`
- `curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash`
- `sudo apt-get install gitlab-ce`
- `sudo gitlab-ctl reconfigure`

*Note: You may be prompted to select an option for mail services, you may select __no configuration__ as you do not need mailing for a dev environment*

Once your Gitlab is installed you can log in with the temporary credentials (you will be prompted to change the root password): 
- **Username:** root
- **Password:** 5iveL!fe

#### Credentials and Settings

After you have these prerequisits you will need to fill out the server and client settings.  To fill these out you will need the connection string for your running Mongo instance, as well as the App ID and App Secret from registering your application (Spreeboard) in Gitlab.

Once your Spreeboard application is registerd in Gitlab (you can use the base url for the callback url) you will need to add your Application ID in two places and your Application Secret in one. Copy the file *config/env/sample.settings.json* and rename it *config/env/[NODE_ENV].json*. (If not NODE_ENV process variable is set it will fall back to *development*)
Here you will place your Gitlab information.  You will also need to copy the file *client/app/config/sample.config.json* and rename it *client/app/config/env.config.json* replacing the information with your Gitlab information.

Be sure to also add your Mongo Instance connection string to the *config/config.settings.json* file as well.

###### Gitlab

The last setup step is to add the webhooks required for gitlab to communicate with your spreeboard server.  Once you've create a project to work with select web hooks from the project settings menu and create one with the url `http://[spreeboard_host]/gitlab/issues` (for example: http://localhost:3000/gitlab/issues) be sure to tick only the box *issues* and turn off SSL by unchecking the box entitled *Enable SSL Verification*


#### Building and Running
Install dependencies with:
- `npm install`
- `bower install`

Build configurations and start grunt task runners with:
- `grunt`

Open another tab and run:
- `nodemon server.js`

You are now running Spreeboard!
