import { fireEvent, queryAllByText, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import Post from '../components/Post';
import PhotoRow from '../components/PhotoRow';
import React, { useState } from "react";
import userEvent from '@testing-library/user-event';

/* All tests follow the three steps:
   1. Arrange: set up the test data, conditions and environment
   2. Act: run logic that should be tested (e.g. simulate a button clicks)
   3. Assert: compare execution to our expectation 
*/



/* In all tests, we mock out the handleRequest and handleSelect functions because:
   1. They are defined in Posts.js
   2. They use variables which are defined in Posts.js.
   To properly test them, they will be tested again in Posts.js as another integration test
*/



/* Integration Test between Post and ConfirmModal components
   handleOpenModal needs to be successfully called in order for the test to pass
*/
test("Simulating user clicking the Request Migration button", () => {

    /* Arrange */

    // Mock the props accepted by the Posts component. All props set to the initial.
    const name = "Random Name";
    const type = "status";
    const created_time = "2021-09-30T23:53:52+0000";
    const updated_time = "2021-09-30T23:53:52+0000";
    const id = "123456789";
    const status = false; 
    const commentsCount = 10;
    const handleRequest = jest.fn();
    const handleSelect = jest.fn();
    const isSelected = false;
    const content = {photos: [], message: "Weather is GOOD"};
    const userPicture = "www";
    const permalink = "www";
    const rejection = "";
    const setShowSending = jest.fn();
    
    render(<Post name={name} type={type} created_time={created_time} updated_time={updated_time} 
    id={id} status={status} commentsCount={commentsCount} handleRequest={handleRequest} handleSelect={handleSelect}
    isSelected={isSelected} content={content} userPicture={userPicture} permalink={permalink} rejection={rejection}
    setShowSending={setShowSending}/>);

    /* Action: User clicking the Request Migration button */
    userEvent.click(screen.getByRole("button", {name: "Request Migration"}));

    
    /* Assert: The Modal needs to be present on the screen. */
    
    // These elements are part of the Modal. 
    // If the modal showed up, it means the these elements are visible to the user.
    expect(screen.getByText("Please confirm")).toBeVisible();
    expect(screen.getByText("Migrate this post?")).toBeVisible();

});


/* Integration Test between Post and ConfirmModal components 
   handleOpenModal and handleCloseModal (before if statement) need to be successfully called in order for the test to pass
*/
test("Simulating user clicking the Cancel button on Modal, after Request Migration button is clicked", async () => {
    
   /* Arrange */
   
   // Mock the props accepted by the Posts component. All props set to the initial.
   const name = "Random Name";
   const type = "status";
   const created_time = "2021-09-30T23:53:52+0000";
   const updated_time = "2021-09-30T23:53:52+0000";
   const id = "123456789";
   const status = false; 
   const commentsCount = 10;
   const handleRequest = jest.fn();
   const handleSelect = jest.fn();
   const isSelected = false;
   const content = {photos: [], message: "Weather is GOOD"};
   const userPicture = "www";
   const permalink = "www";
   const rejection = "";
   const setShowSending = jest.fn();
   
   render(<Post name={name} type={type} created_time={created_time} updated_time={updated_time} 
   id={id} status={status} commentsCount={commentsCount} handleRequest={handleRequest} handleSelect={handleSelect}
   isSelected={isSelected} content={content} userPicture={userPicture} permalink={permalink} rejection={rejection}
   setShowSending={setShowSending}/>);


   /* Action: 1. User clicks the Request Migration Button */
   userEvent.click(screen.getByRole("button", {name: "Request Migration"}));

   
   /* Assert: 1. Assert that the Modal shows up on the screen */
   expect(screen.getByText("Please confirm")).toBeVisible();

   /* Action: 2. User clicks the Cancel button to close the modal */
   userEvent.click(screen.getByRole("button", {name: "Cancel"}));
   await waitForElementToBeRemoved( () => screen.queryByRole("button", {name: "Cancel"}));

   /* Assert: 2. Checks that the Modal disappears from the screen */
   expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
   expect(screen.queryByRole("button", {name: "OK"})).not.toBeInTheDocument();

});


/* Integration Test between Post and ConfirmModal components 
   handleOpenModal and handleCloseModal (before if statement) need to be successfully called in order for the test to pass
*/
test("Simulating user clicking the Close button on Modal, after Request Migration button is clicked", async () => {
    
   /* Arrange */
   
   // Mock the props accepted by the Posts component. All props set to the initial.
   const name = "Random Name";
   const type = "status";
   const created_time = "2021-09-30T23:53:52+0000";
   const updated_time = "2021-09-30T23:53:52+0000";
   const id = "123456789";
   const status = false; 
   const commentsCount = 10;
   const handleRequest = jest.fn();
   const handleSelect = jest.fn();
   const isSelected = false;
   const content = {photos: [], message: "Weather is GOOD"};
   const userPicture = "www";
   const permalink = "www";
   const rejection = "";
   const setShowSending = jest.fn();
   
   render(<Post name={name} type={type} created_time={created_time} updated_time={updated_time} 
   id={id} status={status} commentsCount={commentsCount} handleRequest={handleRequest} handleSelect={handleSelect}
   isSelected={isSelected} content={content} userPicture={userPicture} permalink={permalink} rejection={rejection}
   setShowSending={setShowSending}/>);


   /* Action: 1. User clicks the Request Migration Button */
   userEvent.click(screen.getByRole("button", {name: "Request Migration"}));

   
   /* Assert: 1. Assert that the Modal shows up on the screen */
   expect(screen.getByText("Please confirm")).toBeVisible();

   /* Action: 2. User clicks the Close button to close the modal */
   userEvent.click(screen.getByRole("button", {name: "Close"}));
   await waitForElementToBeRemoved( () => screen.queryByRole("button", {name: "Close"}));

   /* Assert: 2. Checks that the Modal disappears from the screen */
   expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
   expect(screen.queryByRole("button", {name: "OK"})).not.toBeInTheDocument();

});


/* Integration Test between Post and ConfirmModal components 
   handleOpenModal and handleCloseModal need to be successfully called in order for the test to pass
*/
test("Simulating user clicking the OK button on Modal, after Request Migration button is clicked", async () => {
    
   /* Arrange */
   
   // Mock the props accepted by the Posts component. All props set to the initial.
   const name = "Random Name";
   const type = "status";
   const created_time = "2021-09-30T23:53:52+0000";
   const updated_time = "2021-09-30T23:53:52+0000";
   const id = "123456789";
   const status = false; 
   const commentsCount = 10;
   const handleRequest = jest.fn();
   const handleSelect = jest.fn();
   const isSelected = false;
   const content = {photos: [], message: "Weather is GOOD"};
   const userPicture = "www";
   const permalink = "www";
   const rejection = "";
   const setShowSending = jest.fn();
   
   render(<Post name={name} type={type} created_time={created_time} updated_time={updated_time} 
   id={id} status={status} commentsCount={commentsCount} handleRequest={handleRequest} handleSelect={handleSelect}
   isSelected={isSelected} content={content} userPicture={userPicture} permalink={permalink} rejection={rejection}
   setShowSending={setShowSending}/>);


   /* Action: 1. User clicks the Request Migration Button */
   userEvent.click(screen.getByRole("button", {name: "Request Migration"}));
 
   /* Assert: 1. Assert that the Modal shows up on the screen */
   expect(screen.getByText("Please confirm")).toBeVisible();

   /* Action: 2. User clicks the OK button to close the modal */
   userEvent.click(screen.getByRole("button", {name: "OK"}));
   await waitForElementToBeRemoved( () => screen.queryByRole("button", {name: "OK"}));
   
   /* Assert: 2. Checks that the Modal disappears from the screen, and handleRequest is called exactly once */
   expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
   expect(screen.queryByRole("button", {name: "OK"})).not.toBeInTheDocument();
   
   expect(handleRequest).toHaveBeenCalledTimes(1);

});



