import { findByAltText, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import Invites from '../components/Invites';
import React, { useState } from "react";
import userEvent from '@testing-library/user-event';
import { findAllInRenderedTree } from 'react-dom/test-utils';
import { act } from 'react-dom/test-utils';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";


/* Mocking the returned response from making external axios api call */

// Mocking the response of axios call to /wp-json/buddyboss/v1/groups
const groupQuokka = {
    "id": 1,
    "creator_id": 3,
    "parent_id": 0,
    "date_created": "2021-10-03T04:20:11",
    "description": {
        "raw": "We worship Quokka",
        "rendered": "<p>We worship Quokka</p>\n"
    },
    "enable_forum": false,
    "link": "www",
    "name": "Quokka",
    "slug": "quokka",
    "status": "private",
    "types": [],
    "group_type_label": "",
    "subgroups_id": [],
    "is_member": false,
    "invite_id": false,
    "request_id": false,
    "is_admin": false,
    "is_mod": false,
    "members_count": "3",
    "role": "",
    "plural_role": "",
    "can_join": true,
    "can_post": true,
    "create_media": true,
    "create_video": false,
    "create_document": false
};

const groupDog = {
    "id": 2,
    "creator_id": 3,
    "parent_id": 0,
    "date_created": "2021-10-03T04:27:13",
    "description": {
        "raw": "Human best friend, Dog!!",
        "rendered": "<p>Human best friend, Dog!!</p>\n"
    },
    "enable_forum": false,
    "link": "www",
    "name": "Dog",
    "slug": "dog",
    "status": "private",
    "types": [],
    "group_type_label": "",
    "subgroups_id": [],
    "is_member": false,
    "invite_id": false,
    "request_id": false,
    "is_admin": false,
    "is_mod": false,
    "members_count": "1",
    "role": "",
    "plural_role": "",
    "can_join": true,
    "can_post": true,
    "create_media": true,
    "create_video": false,
    "create_document": false
};

const receivedGroups = [groupQuokka, groupDog];



// Mocking the response of axios call to /wp-json/custom-api/v1/fbposts-any-status
const pendingRequest = {
    "ID": 123,
    "post_author": "1",
    "post_date": "2021-10-01 22:09:51",
    "post_date_gmt": "0000-00-00 00:00:00",
    "post_content": "I really want a pet - any suggestions?",
    "post_title": "pendingRequest",
    "post_excerpt": "",
    "post_status": "pending",
    "comment_status": "closed",
    "ping_status": "closed",
    "post_password": "",
    "post_name": "",
    "to_ping": "",
    "pinged": "",
    "post_modified": "2021-10-04 22:09:51",
    "post_modified_gmt": "0000-00-00 00:00:00",
    "post_content_filtered": "",
    "post_parent": 0,
    "guid": "/hello",
    "menu_order": 0,
    "post_type": "fbposts",
    "post_mime_type": "",
    "comment_count": "0",
    "filter": "raw",
    "acf": {
        "created_time": "2021-09-30 23:52:39",
        "file_links": [],
        "author_id": "this",
        "updated_time": "2021-09-30 23:55:12",
        "author_name": "",
        "type": "status",
        "post_content": "I really want a pet - any suggestions?",
        "post_id": "pendingRequest",
        "migration_status": "pending review"
    }
};

const migratedRequest = {
    "ID": 111,
    "post_author": "9",
    "post_date": "2021-10-14 20:24:59",
    "post_date_gmt": "0000-00-00 00:00:00",
    "post_content": "My goodness quokka is SO CUTE!",
    "post_title": "migratedRequest",
    "post_excerpt": "",
    "post_status": "publish",
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
        "file_links": ["www"],
        "author_id": "007",
        "updated_time": "2021-10-01 02:20:40",
        "author_name": "John Lee",
        "type": "photo",
        "post_content": "My goodness quokka is SO CUTE!",
        "post_id": "migratedRequest",
        "migration_status": "migrated"
    }
};

const receivedRequests = [pendingRequest, migratedRequest];


// Mocking the response of axios call to /wp-json/buddyboss/v1/activity
const responsePostBuddyBoss = {
    "id": 100,
    "bp_media_ids": []
}



beforeEach(() => {
    const mock = new MockAdapter(axios);

    // Mocking the axios call to get groups information
    mock.onGet("/wp-json/buddyboss/v1/groups").reply(200, receivedGroups);

    // Mocking the axios call to get all the requests
    mock.onGet("/wp-json/custom-api/v1/fbposts-any-status").reply(200, receivedRequests);

    // Mocking the axios call to post to WordPress custom API when admin accept/reject a request
    mock.onPost("/wp-json/custom-api/v1/fbposts/" + pendingRequest.acf.post_id).reply(200);

    // Mocking the axios call to post to BuddyBoss, when a request has been accepted
    mock.onPost("/wp-json/buddyboss/v1/activity").reply(200, responsePostBuddyBoss);

    // Mocking the axios call to patch the author to BuddyBoss
    mock.onPatch("/wp-json/buddyboss/v1/activity/" + responsePostBuddyBoss.id).reply(200, responsePostBuddyBoss);

});



test("Simulate non-admin logs in", async () => {

    /* Arrange */
    const su = false;
    const JWT = "fakeJWT";
    await act(async () => render(<Invites su={su} JWT={JWT}/>));

    /* Action: None */

    /* Assert: an aleart would appear for non-admin */
    expect(screen.queryByRole("alert")).toBeInTheDocument();

});



test("Simulate admin logs in, only pending requests are rendered", async () => {

    /* Arrange */
    const su = true;
    const JWT = "FakeJWT"
    await act(async () => render(<Invites su={su} JWT={JWT}/>));
    await waitFor(() => expect(screen.queryByRole("heading", {name: "Migration Requests (1)"})).toBeInTheDocument());
    
    /* Action: None */

    /* Assert: 
        1. The alert should disappear for the admin
        2. Only pending requests are rendered 
    */
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(pendingRequest.post_content)).toBeInTheDocument();
    expect(screen.queryByText(migratedRequest.post_content)).not.toBeInTheDocument();

});


test("Simulate admin chooses a group and then accept the migration request", async () => {

    /* Arrange */
    const su = true;
    const JWT = "fakeJWT";
    await act(async () => render(<Invites su={su} JWT={JWT}/>));
    await waitFor(() => expect(screen.queryByRole("heading", {name: "Migration Requests (1)"})).toBeInTheDocument());

    /* Assert 0: Before any action, assert that the default group (Quokka) is selected */
    expect(screen.queryByRole("option", {name: "Dog (private)"}).selected).toBe(false);
    expect(screen.queryByRole("option", {name: "Quokka (private)"}).selected).toBe(true);

    /* Action 1: Admin select a non-default group */
    userEvent.selectOptions(screen.queryByRole("combobox"), screen.queryByRole("option", {name: "Dog (private)"}));

    /* Assert 1: The Dog group has been selected, and the Quokka group is no longer selected */
    expect(screen.queryByRole("option", {name: "Dog (private)"}).selected).toBe(true);
    expect(screen.queryByRole("option", {name: "Quokka (private)"}).selected).toBe(false);

    /* Action 2: Admin accept the migration request */
    userEvent.click(screen.queryByRole("button", {name: "Migrate"}));
    userEvent.click(screen.queryByRole("button", {name: "OK"}));
    await waitFor(() => expect(screen.queryByRole("heading", {name: "Migration Requests (1)"})).not.toBeInTheDocument());

    /* Assert 2: The migrated post will disappear from the screen */
    expect(screen.queryByText("Migration Requests (0)")).toBeInTheDocument();

});


test("Simulate admin enters rejection reason and decline a request", async () => {

    /* Arrange */
    const su = true;
    const JWT = "fakeJWT";
    await act(async () => render(<Invites su={su} JWT={JWT}/>));
    await waitFor(() => expect(screen.queryByRole("heading", {name: "Migration Requests (1)"})).toBeInTheDocument());

    /* Action 1: Admin types in the rejection reason box */
    userEvent.type(screen.getByRole("textbox"), "Contain swearing");

    /* Assert 1: Rejection reason appears on the screen */
    expect(screen.queryByText("Contain swearing")).toBeInTheDocument();

    /* Action 2: Admin clicks the Reject button */
    userEvent.click(screen.queryByRole("button", {name: "Reject"}));
    userEvent.click(screen.queryByRole("button", {name: "OK"}));
    await waitForElementToBeRemoved(() => screen.queryByRole("button", {name: "Reject"}));

    /* Assert 2: The rejected request disappears from the screen */
    expect(screen.queryByText("Migration Requests (0)")).toBeInTheDocument();

});

