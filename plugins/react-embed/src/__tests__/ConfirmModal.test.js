import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import ConfirmModal from '../components/ConfirmModal';
import React, { useState } from "react";
import userEvent from '@testing-library/user-event';

/* All tests follow the three steps:
   1. Arrange: set up the test data, conditions and environment
   2. Act: run logic that should be tested (e.g. simulate a button clicks)
   3. Assert: compare execution to our expectation 
*/



// Unit test
test("Simulating user clicking the Close button on Modal, after Request Migration button is clicked", () => {
    
    /* Arrange */
    
    /* Mock the props that are passed into the ConfirmModal. show is set to true because the Modal needs to be open 
     in order to close it */
    const show = true;              
    const handleClose = jest.fn();
    const heading = "Hello User";
    const body = "Do you like this?";
    render(<ConfirmModal show={show} handleClose={handleClose} heading={heading} body={body}/>);

    /* Action: user clicking the Close button on the Modal*/
    userEvent.click(screen.getByRole("button", {name: "Close"}));
    
    /* Assert  */
    // handleClose would have been called once.
    expect(handleClose).toHaveBeenCalledTimes(1);

});


// Unit test
test("Simulating user clicking the Cancel button on Modal, after Request Migration button is clicked", () => {
    
    /* Arrange */
    
    /* Mock the props that are passed into the ConfirmModal. show is set to true because the Modal needs to be open 
     in order to close it */
    const show = true;              
    const handleClose = jest.fn();
    const heading = "Hello User";
    const body = "Do you like this?";
    render(<ConfirmModal show={show} handleClose={handleClose} heading={heading} body={body}/>);

    /* Action: user clicking the Close button on the Modal*/
    userEvent.click(screen.getByRole("button", {name: "Cancel"}));
    
    /* Assert  */
    // handleClose would have been called once.
    expect(handleClose).toHaveBeenCalledTimes(1);

});

// Unit test
test("Simulating user clicking the OK button on Modal, after Request Migration button is clicked", () => {
    
    /* Arrange */
    
    /* Mock the props that are passed into the ConfirmModal. show is set to true because the Modal needs to be open 
     in order to close it */
    const show = true;              
    const handleClose = jest.fn();
    const heading = "Hello User";
    const body = "Do you like this?";
    render(<ConfirmModal show={show} handleClose={handleClose} heading={heading} body={body}/>);

    /* Action: user clicking the Close button on the Modal*/
    userEvent.click(screen.getByRole("button", {name: "OK"}));
    
    /* Assert  */
    // handleClose would have been called once.
    expect(handleClose).toHaveBeenCalledTimes(1);

});