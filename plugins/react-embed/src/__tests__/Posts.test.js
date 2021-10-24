import { findByText, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import Posts from '../components/Posts';
import React, { useState } from "react";
import userEvent from '@testing-library/user-event'

import axios from "axios";
import MockAdapter from "axios-mock-adapter";


/* All tests follow the three steps:
   1. Arrange: set up the test data, conditions and environment
   2. Act: run logic that should be tested (e.g. simulate a button clicks)
   3. Assert: compare execution to our expectation 
*/


// Mocking a post not written by the logged in user
const otherUserPost = {
    "message": "It always seems impossible until it's done",
    "created_time": "2021-10-10T08:16:40+0000",
    "updated_time": "2021-10-10T08:16:40+0000",
    "type": "status",
    "id": "fakeId1",
    "permalink_url": "fakeUrl1"
};

// Mocking a post written by the logged in user.  The user has not requested to migrate it
const notRequestedPostA = {
    "message": "Ice Cream is just amazing! Not requested yet.",
    "from": {
        "name": "LoggedIn User",
        "id": "123"
    },
    "created_time": "2021-09-30T23:53:52+0000",
    "updated_time": "2021-09-30T23:53:52+0000",
    "type": "status",
    "id": "iceCreamPostID",
    "reactions": {
        "data": [
            {
                "id": "fakeReactionID1",
                "name": "John",
                "type": "LIKE"
            }
        ],
        "paging": {
            "cursors": {
                "before": "fakeUrlCursor1",
                "after": "fakeUrlCursor2"
            }
        }
    },
    "permalink_url": "fakeUrl2"
};

// Mocking a post written by the logged in user.  The user has not requested to migrate it
const notRequestedPostB = {
    "message": "I really want a pet - any suggestions? Not requested yet.",
    "from": {
        "name": "LoggedIn User",
        "id": "123"
    },
    "created_time": "2021-10-03T23:52:39+0000",
    "updated_time": "2021-10-03T23:55:12+0000",
    "type": "status",
    "id": "petPostID",
    "reactions": {
        "data": [
            {
                "id": "fakeReactionID3",
                "name": "John",
                "type": "LIKE"
            }
        ],
        "paging": {
            "cursors": {
                "before": "www",
                "after": "www"
            }
        }
    },
    "comments": {
        "data": [
            {
                "created_time": "2021-10-07T23:55:10+0000",
                "from": {
                    "name": "Mary",
                    "id": "000"
                },
                "message": "pet quokka!",
                "id": "0000"
            }
        ],
        "paging": {
            "cursors": {
                "before": "www",
                "after": "www"
            }
        }
    },
    "permalink_url": "www"
};

// Mocking a post written by the logged in user. It has been rejected by the admin.
const rejectedPost = {
    "message": "HAHAHAHAHAHAHA I hacked your account",
    "from": {
        "name": "LoggedIn User",
        "id": "123"
    },
    "created_time": "2021-10-15T23:53:52+0000",
    "updated_time": "2021-10-15T23:53:52+0000",
    "type": "status",
    "id": "hackPostID",
    "reactions": {
        "data": [
            {
                "id": "fakeReactionID1",
                "name": "John",
                "type": "LIKE"
            }
        ],
        "paging": {
            "cursors": {
                "before": "fakeUrlCursor1",
                "after": "fakeUrlCursor2"
            }
        }
    },
    "permalink_url": "www"
}


const returnedPostFromFB = {
    "data": [otherUserPost, notRequestedPostB],
    "paging": {
        "previous": "www",
        "next": "www"
    }
};

const returnedPostsFromFBSelectAll = {
    "data": [otherUserPost, notRequestedPostA, notRequestedPostB, rejectedPost],
    "paging": {
        "previous": "www",
        "next": "www"
    }
};



// Mocking response from WordPress, when trying to get a post that is pending migration
const responseFromWPPendingReview = {
    "ID": 111,
    "post_author": "1",
    "post_date": "2021-10-14 17:52:29",
    "post_date_gmt": "0000-00-00 00:00:00",
    "post_content": "I really want a pet - any suggestion? Pending Review",
    "post_title": "petPostID",
    "post_excerpt": "",
    "post_status": "pending",
    "comment_status": "closed",
    "ping_status": "closed",
    "post_password": "",
    "post_name": "",
    "to_ping": "",
    "pinged": "",
    "post_modified": "2021-10-14 17:52:29",
    "post_modified_gmt": "0000-00-00 00:00:00",
    "post_content_filtered": "",
    "post_parent": 0,
    "guid": "www",
    "menu_order": 0,
    "post_type": "fbposts",
    "post_mime_type": "",
    "comment_count": "1",
    "filter": "raw",
    "acf": {
        "created_time": "2021-10-11 10:10:25",
        "file_links": [],
        "author_id": "123",
        "updated_time": "2021-10-11 10:10:26",
        "author_name": "LoggedIn User",
        "type": "status",
        "post_content": "I really want a pet - any suggestion? Pending Review",
        "post_id": "petPostID",
        "migration_status": "pending review",
        "rejection_reason": ""
    }
};

// Mocking response from WordPress, when trying to get a post that has been rejected
const responseFromWPDeclined = {
    "ID": 113,
    "post_author": "9",
    "post_date": "2021-10-14 20:24:59",
    "post_date_gmt": "0000-00-00 00:00:00",
    "post_content": "HAHA I hacked your account! Declined with reason.",
    "post_title": "hackPostID",
    "post_excerpt": "",
    "post_status": "pending",
    "comment_status": "closed",
    "ping_status": "closed",
    "post_password": "",
    "post_name": "",
    "to_ping": "",
    "pinged": "",
    "post_modified": "2021-10-14 20:24:59",
    "post_modified_gmt": "2021-10-14 09:24:59",
    "post_content_filtered": "",
    "post_parent": 0,
    "guid": "www",
    "menu_order": 0,
    "post_type": "fbposts",
    "post_mime_type": "",
    "comment_count": "0",
    "filter": "raw",
    "acf": {
        "created_time": "2021-10-01 02:20:40",
        "file_links": [
            "www"
        ],
        "author_id": "9",
        "updated_time": "2021-10-01 02:20:40",
        "author_name": "Haoxin Li",
        "type": "photo",
        "post_content": "HAHA I hacked your account!",
        "post_id": "hackPostID",
        "migration_status": "declined",
        "rejection_reason": "Your account has been hacked"
    }
};

// This is the response from WP after we create a post via POST request in handleRequest
const postResponseFromWP = {
    "id": 548,
    "date": "2021-10-15T14:46:32",
    "date_gmt": "2021-10-15T03:46:32",
    "guid": {
        "rendered": "www",
        "raw": "www"
    },
    "modified": "2021-10-15T14:46:32",
    "modified_gmt": "2021-10-15T03:46:32",
    "password": "",
    "slug": "",
    "status": "pending",
    "type": "fbposts",
    "link": "www",
    "title": {
        "raw": "petPostID",
        "rendered": "petPostID"
    },
    "content": {
        "raw": "I really want a pet - any suggestions? Not requested yet.",
        "rendered": "<p>I really want a pet &#8211; any suggestions? Not requested yet.</p>\n",
        "protected": false,
        "block_version": 0
    },
    "author": 9,
    "featured_media": 0,
    "template": "",
    "meta": [],
    "categories": [],
    "permalink_template": "www",
    "generated_slug": "petpostid",
    "acf": {
        "created_time": "2021-09-30 23:52:39",
        "file_links": "",
        "author_id": "123",
        "updated_time": "2021-09-30 23:52:39",
        "author_name": "LoggedIn User",
        "type": "status",
        "post_content": "I really want a pet - any suggestions? Not requested yet.",
        "post_id": "petPostID",
        "migration_status": "pending review",
        "rejection_reason": ""
    },
    "_links": {
        "self": [
            {
                "href": "www"
            }
        ],
        "collection": [
            {
                "href": "www"
            }
        ],
        "about": [
            {
                "href": "www"
            }
        ],
        "author": [
            {
                "embeddable": true,
                "href": "www"
            }
        ],
        "wp:attachment": [
            {
                "href": "www"
            }
        ],
        "wp:term": [
            {
                "taxonomy": "category",
                "embeddable": true,
                "href": "www"
            }
        ],
        "wp:action-publish": [
            {
                "href": "www"
            }
        ],
        "wp:action-unfiltered-html": [
            {
                "href": "www"
            }
        ],
        "wp:action-assign-author": [
            {
                "href": "www"
            }
        ],
        "wp:action-create-categories": [
            {
                "href": "www"
            }
        ],
        "wp:action-assign-categories": [
            {
                "href": "www"
            }
        ],
        "curies": [
            {
                "name": "wp",
                "href": "www",
                "templated": true
            }
        ]
    }
};







describe("User has only 1 post in FB group", () => {


    beforeEach(() => {
        // Mock out axios calls
        const access_token = "abcd";
        const mock = new MockAdapter(axios);
        mock.onGet("https://graph.facebook.com/v11.0/2658160797819865/feed", 
        { params: 
            { 
                fields: "message,from,created_time,updated_time,type,id,name,full_picture,reactions,comments,attachments,permalink_url",
                access_token: "abcd"
            }
        })
            .reply(200, returnedPostFromFB);
    
    
        // Because the Pet post is pending review, hence it will not be found in WP
        mock.onGet("/wp-json/custom-api/v1/fbposts/petPostID").reply(404);
    
        // Mocks saving the migration request in the database
        mock.onPost("/wp-json/wp/v2/fbposts").reply(201, postResponseFromWP);
    });




    test("Simulating the scenario where the user has not logged in", () => {

        /* Arrange */
    
        // Mock the props accepted by the Posts component. All props set to the initial.
        const login = false;
        const loggedInUser = {};  // No user has logged in
        const JWT = ""
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
    
        /* Action: None */
    
        /* Assert: The alert element needs to be rendered on the page */
        expect(screen.getByRole("alert")).toBeInTheDocument();
    
    });


    /*
        Functions tested: 
        1. the first useEffect Hook with dependency array of [login]
        2. the second useEffect hook with dependency array [isFetching]
        3. fetchNextPage
    */
    test("Simulating the scenario where the user has logged in, and they have a post on FB group", async () => {

        /* Arrange */

        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
  
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());


        /* Action: None. Simply renders the page */

        /* Assert */

        // Assert 1: Any post that is not created by the logged in user should not be displayed (should be filtered)
        expect(screen.queryByText(returnedPostFromFB.data[0]["message"])).not.toBeInTheDocument();
    
        // Assert 2: Post that is created by the logged in user should be displayed
        expect(screen.getByRole("heading", {name: "Your Content (1)"})).toBeInTheDocument();
        expect(screen.getByText(returnedPostFromFB.data[1]["message"])).toBeInTheDocument();

        // Assert 3: 1 Request Migration button should be displayed on screen
        expect(screen.getByRole("button", {name:"Request Migration"})).toBeInTheDocument();
        

    });

    /*
        Integration test between Posts, Post and Confirm Modal.
        Function tested: handleRequest
    */
    test("Simulating user clicks the Request Migration button and migrate a single post", async () => {

        /* Arrange */
    
        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
    
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());
        
    
        /* Action 1: simulating user clicks the Request Migration button */
        const requestMigrationButton = screen.getByRole("button", {name: "Request Migration"});
        userEvent.click(requestMigrationButton);
        
        /* Assert 1: Confirm Modal should show up */
        expect(screen.queryByText("Migrate this post?")).toBeInTheDocument();
    
        /* Action 2: user confirm the migration */
        const confirmButton = screen.getByRole("button", {name: "OK"});
        userEvent.click(confirmButton);
    
        /* Assertion 2: 
            Confirm model disappears, and 
            request will be sent and the status becomes "Waiting for Approval" 
        */
        await waitForElementToBeRemoved(() => screen.queryByText("Migrate this post?"));
        expect(screen.getByRole("button", {name: "Waiting for approval"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Request Migration"})).not.toBeInTheDocument();  
    
    });

    
});


describe("User has multiple posts in FB group", () => {

    beforeEach(() => {
        // Mock out axios calls
        const access_token = "abcd";
        const mock = new MockAdapter(axios);
        mock.onGet("https://graph.facebook.com/v11.0/2658160797819865/feed", 
        { params: 
            { 
                fields: "message,from,created_time,updated_time,type,id,name,full_picture,reactions,comments,attachments,permalink_url",
                access_token: "abcd"
            }
        })
            .reply(200, returnedPostsFromFBSelectAll);
    
    
        // Because the Ice Cream post has not been requested yet, hence it will not be found in WP
        mock.onGet("/wp-json/custom-api/v1/fbposts/iceCreamPostID").reply(404);
    
        // Because the Pet post is pending review, hence it will not be found in WP
        mock.onGet("/wp-json/custom-api/v1/fbposts/petPostID").reply(404);
    
        // Because the Hack post is rejected, it will also be found in WP
        mock.onGet("/wp-json/custom-api/v1/fbposts/hackPostID").reply(200, responseFromWPDeclined);
    
        // Mocks saving the migration request in the database
        mock.onPost("/wp-json/wp/v2/fbposts").reply(201, postResponseFromWP);
    });


    test("Can render post that has been rejected", async () => {

        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
    
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());

        /* Action: None. Simply renders the page. */
        
        /* Assert */

        // Assert 1: Posts that are created by the logged in user should be displayed
        expect(screen.getByRole("heading", {name: "Your Content (3)"})).toBeInTheDocument();
        expect(screen.getByText(returnedPostsFromFBSelectAll.data[1]["message"])).toBeInTheDocument();
        expect(screen.getByText(returnedPostsFromFBSelectAll.data[2]["message"])).toBeInTheDocument();
        expect(screen.getByText(returnedPostsFromFBSelectAll.data[3]["message"])).toBeInTheDocument();

        // Assert 2: 2 Request Migration buttons and 1 Migration Rejected button should be displayed on screen
        const requestMigrationButtons = screen.getAllByRole("button", {name: "Request Migration"});
        expect(requestMigrationButtons.length).toEqual(2);
        expect(screen.getByRole("button", {name: "Migration rejected"})).toBeInTheDocument();

    });



    /*
        Integration test between Posts, Post and Confirm Modal.
        Function tested: useEffect with dependency array [selectAll]
    */
    test("Simulating user clicks the Select All button and migrate all posts that have been loaded", async () => {

        /* Arrange */
    
        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
    
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());
        
    
        /* Action 1: simulating user clicks the Select All button */
        const selectAllButton = screen.getByRole("button", {name: "Select All"});
        userEvent.click(selectAllButton);

        /* Assert 1: 
            "Select All" button becomes "Deselect All" button, and
            Request Selected (2) button should be available
        */
        expect(screen.queryByRole("button", {name: "Select All"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Deselect All"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Request Selected (2)"})).toBeInTheDocument();

    
        /* Action 2: user clicks the Request Selected (2) button to request migration*/
        userEvent.click(screen.queryByRole("button", {name: "Request Selected (2)"}));

    
        /* Assertion 2: Confirm modal appears */
        expect(screen.queryByText("Migrate content from 2 posts?")).toBeInTheDocument();

        /* Action 3: user clicks the OK button on confirm modal to confirm the request */
        userEvent.click(screen.queryByRole("button", {name: "OK"}));


        /* Assertion 3: 
            Confirm model disappears, and 
            All requests will be sent and the status become "Waiting for Approval" 
        */
        await waitForElementToBeRemoved(() => screen.queryByText("Migrate content from 2 posts?"));
        const waitApprovalButton = screen.queryAllByRole("button", {name: "Waiting for approval"});
        expect(waitApprovalButton.length).toEqual(2);
        expect(screen.queryByRole("button", {name: "Request Migration"})).not.toBeInTheDocument();   
    
    });


    
    test("Simulate user clicks the Select All button, but changed their mind, selecting Deselect All", async () => {

        /* Arrange */
    
        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
    
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());
        
    
        /* Action 1: simulating user clicks the Select All button */
        userEvent.click(screen.queryByRole("button", {name: "Select All"}));

        /* Assert 1: 
            "Select All" button becomes "Deselect All" button, and
            Request Selected (2) button should be available
        */
        expect(screen.queryByRole("button", {name: "Select All"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Deselect All"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Request Selected (2)"})).toBeInTheDocument();

        /* Action 2: User clicks the Deselect All button */
        userEvent.click(screen.queryByRole("button", {name: "Deselect All"}));

        /* Assert 2: We should see "0 selected" and "Select All" buttons again */
        expect(screen.queryByRole("button", {name: "Select All"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "0 selected"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Deselect All"})).not.toBeInTheDocument();

    });


    /* Function tested: handleSelect */
    test("Simulate user select one of the posts that has not been requested", async () => {
        
        /* Arrange */
    
        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
    
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());
        

        /* Assert 0: Make sure that no post has been selected yet */
        expect(screen.queryByText("0 selected")).toBeInTheDocument();

        /* Action 1: simulating user clicks a post that has not been requested (by clicking the message area) */
        userEvent.click(screen.getByText(notRequestedPostA.message));

        /* Assert 1: Expect 1 post has been selected */
        expect(screen.queryByText("Request Selected (1)")).toBeInTheDocument();
        
    });

    /* Function tested: handleSelect */
    test("Simulate user select a rejected post", async () => {
        
        /* Arrange */
    
        // Mock the props accepted by the Posts component. 
        const login = true;                                         
        const loggedInUser = {"id": "123", "accessToken": "abcd", "picture":{
            data: {
                url: "www"
            }
        }};  
        const JWT = "ThisisamockJWTToken"
    
        render(<Posts login={login} loggedInUser={loggedInUser} JWT={JWT}/>);
        await waitFor(() => expect(screen.queryByText("Fetching next page...")).not.toBeInTheDocument());
        

        /* Assert 0: Make sure that no post has been selected yet */
        expect(screen.queryByText("0 selected")).toBeInTheDocument();

        /* Action 1: simulating user clicks the first post (by clicking the message area) */
        userEvent.click(screen.getByText(rejectedPost.message));

        /* Assert 1: no post has been selected has been selected - we cannot select a rejected post */
        expect(screen.queryByText("0 selected")).toBeInTheDocument();
        
    });


});






















