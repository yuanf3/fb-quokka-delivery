# Project Description
Team Quokka is designing a software solution to help users of Genyus Network to migrate their content from Facebook to WordPress. The solution is designed for use within a WordPress site that already has BuddyBoss configured, and comprises the following components:
- [react-embed](#react-embed) (Primary deliverable)
- [wordpress](#wordpress) (Demonstration site)

## Handover Repository Overview
All the important plugins that were customised are also available here.

The acceptance demo video can be found: https://youtu.be/vPmtTzLiG0g

The `documentation` folder contains an export of most of our internal Confluence documentation, which outlines some additional handover details, system design and architecture, as well as testing.

The `fb-quokka-original` folder contains a compressed version of our development repository at the end of our third/final sprint. The structure of this includes all the plugins we used.

## Repository Structure Overview

```
├── database
├── testing
│   ├── system_testing
│   │   └── output (testing report)
│   └── wp_backend_integration_testing
│       └── newman (testing report)
├── wp-content
│   ├── plugins
│   │   ├── custom-api
│   │   ├── react-embed (Primary deliverable)
│   │   │   ├── components
│   │   │   └── __tests__
│   │   └── other plugins
│   └── themes
│       ├── buddyboss-theme
│       └── buddyboss-theme-child
├── README.md
├── .htaccess
└── wp-config.php
```

# react-embed
Primary deliverable - frontend app for controlling the migration of Facebook content

## Description
This app, built with React, fetches a user's Facebook posts using the Graph API and provides an interface for the user to select content to migrate. 

When migration is approved by an admin, the app will interface with WordPress REST API to migrate the content and make it visible on BuddyBoss.

The app is embedded into a WordPress page using the accompanying plugin.

## Execution (for development only)
Inside react-embed:
1. Run `npm install`
2.
    - Run `npm start` to run on live development server at localhost:3000, or:
    - Run `npm run build` to generate static assets for the WordPress plugin

## React Testing
We used the officially recommended tools to test React applications - Jest and React Testing Library. The tools were used to write unit and integration tests for React components in a way resembling how the user will use the app. At least 50% statement coverage has been achieved for all components. To view the tests folder containing the test cases, click this link [testing](wp-content/plugins/react-embed/src/__tests__)

### How to reproduce tests

Open a terminal and navigate to the react-embed directory, then it depends on what you would like to do:
1. Run `npm test` to test the changed files
2. In order to run all the tests and collect coverage information, use the command: `npm test -- --coverage --watchAll`
3. In order to generate a html test report of test coverage, use the following command: `npm test -- --coverage --watchAll --coverageDirectory <folder name>`


### How to view test reports
Option 1: 
1. Download the repository
2. Navigate to wp-content/plugins/react-embed/react-tests-report/lcov-report
3. Double click on index.html
4. The test report will be opened in the browser, with each file clickable to see which statements have not been covered

Option 2: 
1. Visit [Section-C](https://confluence.cis.unimelb.edu.au:8443/display/SWEN900142021FBQuokka/Individual+Section+Testing+Report) on Confluence
2. Download the zip files, and follow instructions written on Confluence.

# wordpress
WordPress site to demonstrate data migration functionality

## Description

The WordPress demonstration site aims to serve as an endpoint of data migration, mimicing the client's website (currently under development) which is built on WordPress. Once the data has been migrated from Facebook, it should appear in the WordPress site, confirming that the data migration has been successful.

## Execution 
Follow the steps [here](https://confluence.cis.unimelb.edu.au:8443/display/SWEN900142021FBQuokka/Migration+App+Installation) on Confluence

## WordPress Backend API
This section documents all the WordPress API endpoints.

### JWT Authentication
The WordPress API endpoints are secured by the JWT authentication. A JWT Token is required when a user wants to make a post, update or delete request. 

#### To get the JWT Token using a plain text password:
```
POST http://genyusnetwork.local/wp-json/jwt-auth/v1/token
Content-Type: application/json

{
    "username": "<user's username>",
    "password": "<user's password>"
}
```

#### To get the JWT Token using hashed password:
```
POST http://genyusnetwork.local/wp-json/jwt-auth/v1/token
Content-Type: application/json

{
    "username": "<user's username>",
    "password": "<user's hashed password>"
    "custom_auth": "true"
}
```

This will return a JWT Token for the current user. When you want to make a post, update or delete a request, you need to append the JWT Token in the request header.

### FBposts
The FBposts is a database table that stores the migrated Facebook posts.

#### To get the published posts in FBposts:
```
GET http://genyusnetwork.local/wp-json/wp/v2/fbposts
```

#### To get the pending posts in FBposts:
```
http://genyusnetwork.local/wp-json/custom-api/v1/fbposts-pending
```

#### To get all posts in FBposts (regardless of the status of the post):
```
http://genyusnetwork.local/wp-json/custom-api/v1/fbposts-any-status
```

#### To get a specific post using WordPress post id:
```
GET http://genyusnetwork.local/wp-json/custom-api/v1/fbposts/<WordPress post id>
Authorization: Bearer <user's JWT Token>
```

#### To get a specific post using Facebook post id:
```
GET http://genyusnetwork.local/wp-json/custom-api/v1/fbposts/<Facebook post id>
Authorization: Bearer <user's JWT Token>
```

#### To add a new post:
```
POST http://genyusnetwork.local/wp-json/wp/v2/fbposts
Content-Type: application/json
Authorization: Bearer <user's JWT Token>

{
    "title": "<Facebook Post ID>",
    "content": "<FaceBook Post Content>",
    "status": "publish",
    "fields":
        {
            "created_time": "<Format: 15-08-2021 3:30 pm>",
            "file_links": "",
            "author_id": "",
            "updated_time": "<Format: 19-08-2021 5:30 pm>",
            "author_name": "",
            "type": "",
            "post_content": "<FaceBook Post Content>",
            "post_id": "<Facebook Post ID>",
            "migration_status": "<Choose between 'migrated', 'pending review', 'declined', or 'spam'>",
            "rejection_reason": "<Leave it blank in this case>"
        }
}
```

#### To update a post using WordPress post id:
```
POST http://genyusnetwork.local/wp-json/wp/v2/fbposts/<WordPress post id>
Content-Type: application/json
Authorization: Bearer <user's JWT Token>

{
    "title": "<Facebook Post ID>",
    "content": "<FaceBook Post Content>",
    "status": "publish",
    "fields":
        {
            "created_time": "<Format: 15-08-2021 3:30 pm>",
            "file_links": "",
            "author_id": "",
            "updated_time": "<Format: 19-08-2021 5:30 pm>",
            "author_name": "",
            "type": "",
            "post_content": "<FaceBook Post Content>",
            "post_id": "<Facebook Post ID>",
            "migration_status": "<Choose between 'migrated', 'pending review', 'declined', or 'spam'>",
            "rejection_reason": "<Insert the rejection reason if the post is getting declined or marked as a spam>"
        }
}
```

#### To update a post using Facebook post id:
```
POST http://genyusnetwork.local/wp-json/wp/v2/fbposts/<Facebook post id>
Content-Type: application/json
Authorization: Bearer <user's JWT Token>

{
    "post_title": "<Facebook Post ID>",
    "post_content": "<FaceBook Post Content>",
    "post_status": "publish",
    "meta_input":
        {
            "created_time": "<Format: 15-08-2021 3:30 pm>",
            "file_links": "",
            "author_id": "",
            "updated_time": "<Format: 19-08-2021 5:30 pm>",
            "author_name": "",
            "type": "",
            "post_content": "<FaceBook Post Content>",
            "post_id": "<Facebook Post ID>",
            "migration_status": "<Choose between 'migrated', 'pending review', 'declined', or 'spam'>",
            "rejection_reason": "<Insert the rejection reason if the post is getting declined or marked as a spam>"
        }
}
```

#### To delete a specific post using WordPress post id:
```
DELETE http://genyusnetwork.local/wp-json/wp/v2/fbposts/<WordPress post id>
Authorization: Bearer <user's JWT Token>
```

#### To delete a specific post using Facebook post id:
```
DELETE http://genyusnetwork.local/wp-json/wp/v2/fbposts/<Facebook post id>
Authorization: Bearer <user's JWT Token>
```
