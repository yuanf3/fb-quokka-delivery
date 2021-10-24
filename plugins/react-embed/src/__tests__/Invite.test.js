import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import Invite from '../components/Invite';
import React, { useState } from "react";
import userEvent from '@testing-library/user-event';


/* 
   For Invite.js unit tests, we mock out the handleMigrate, handleDecline and handleGroup props 
   Because: these functions uses variables/other functions that are defined in Invites.js
   In order to test these three functions are correctly implemented, we need integration tests, 
   testing the interactions between Invites.js and Invite.js 
*/

// Mock the groups information returned from WP
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
    "create_document": false};

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
    "create_document": false};

// Mock the props that need to be passed into the Invite component
const name = "John Lee";
const status = "pending review";
const type = "status";
const created_time = "2021-09-30 23:27:22";
const updated_time = "2021-09-30 23:27:22";
const id = "1234567899";
const content = {"message": "Weather is lovely!", "photos": []};
const groups = [groupQuokka, groupDog];
const handleMigrate = jest.fn();
const handleDecline = jest.fn();
const isMigrating = false;


// Unit test
test("Simulating the admin clicking the Migrate button of a post pending review", async () => {

    /* Arrange */
    render(<Invite name={name} status={status} type={type} created_time={created_time} updated_time={updated_time}
    id={id} content={content} groups={groups} handleMigrate={handleMigrate} handleDecline={handleDecline} isMigrating={isMigrating}/>);

    /* Action: 1. Admin clicks the Migrate button */
    userEvent.click(screen.getByRole("button", {name: "Migrate"}));

    /* Assert: 1. Assert that the Modal shows up on the screen */
    expect(screen.getByText("Please confirm migration")).toBeVisible();

    /* Action: 2. User clicks the OK button to close the modal */
    userEvent.click(screen.getByRole("button", {name: "OK"}));
    await waitForElementToBeRemoved( () => screen.queryByRole("button", {name: "OK"}));

    /* Assert: 2. Checks that the Modal disappears from the screen, and handleMigrate is called exactly once */
    expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "OK"})).not.toBeInTheDocument();

    expect(handleMigrate).toHaveBeenCalledTimes(1);

});


// Unit test
test("Simulating the admin clicking the Reject button of a post pending review", async () => {

    /* Arrange */
    render(<Invite name={name} status={status} type={type} created_time={created_time} updated_time={updated_time}
    id={id} content={content} groups={groups} handleMigrate={handleMigrate} handleDecline={handleDecline} isMigrating={isMigrating}/>);

    /* Action: 1. Admin clicks the Reject button */
    userEvent.click(screen.getByRole("button", {name: "Reject"}));

    /* Assert: 1. Assert that the Modal shows up on the screen */
    expect(screen.getByText("Please confirm rejection")).toBeVisible();

    /* Action: 2. User clicks the OK button to close the modal */
    userEvent.click(screen.getByRole("button", {name: "OK"}));
    await waitForElementToBeRemoved( () => screen.queryByRole("button", {name: "OK"}));

    /* Assert: 2. Checks that the Modal disappears from the screen, and handleDecline is called exactly once */
    expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "OK"})).not.toBeInTheDocument();

    expect(handleDecline).toHaveBeenCalledTimes(1);

});

//Unit test
test("Simulate the admin typing rejection reason", async () => {

    /* Arrange */
    render(<Invite name={name} status={status} type={type} created_time={created_time} updated_time={updated_time}
    id={id} content={content} groups={groups} handleMigrate={handleMigrate} handleDecline={handleDecline} isMigrating={isMigrating}/>);
    

    /* Action: Admin typing down rejection reason */
    userEvent.type(screen.getByRole("textbox"), "Contain swearing");
    
    /* Assert: Rejection reason appears on the screen */
    expect(screen.queryByText("Contain swearing")).toBeInTheDocument();
    
});

//Unit test
test("Simulate the admin selecting a group that is not the default one", async () => {

    /* Arrange */
    render(<Invite name={name} status={status} type={type} created_time={created_time} updated_time={updated_time}
        id={id} content={content} groups={groups} handleMigrate={handleMigrate} handleDecline={handleDecline} isMigrating={isMigrating}/>);

    /* Assert 0: Before assertion, check that Quokka option is selected, and Dog option is not */
    expect(screen.queryByRole("option", {name: "Dog (private)"}).selected).toBe(false);
    expect(screen.queryByRole("option", {name: "Quokka (private)"}).selected).toBe(true);

    /* Action 1: Admin selects the Dog group */
    userEvent.selectOptions(screen.queryByRole("combobox"), screen.queryByRole("option", {name: "Dog (private)"}));

    /* Assert 1: The Quokka option is not selected, but the Dog option is */
    expect(screen.queryByRole("option", {name: "Dog (private)"}).selected).toBe(true);
    expect(screen.queryByRole("option", {name: "Quokka (private)"}).selected).toBe(false);

});
