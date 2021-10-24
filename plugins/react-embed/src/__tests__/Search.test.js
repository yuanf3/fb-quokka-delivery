import { fireEvent, render, screen } from '@testing-library/react';
import Search from '../components/Search';
import React, { useState } from "react";

import userEvent from '@testing-library/user-event'


/* All tests follow the three steps:
   1. Arrange: set up the test data, conditions and environment
   2. Act: run logic that should be tested (e.g. simulate a button clicks)
   3. Assert: compare execution to our expectation 
*/

/*  In the Arrange step, we will mock the setSearchQuery, setShowPending and setSorting functions.
    i.e. We are not interested in the implementation details, because:
    The functions are created by React.  We will assume these are implemented correctly.
 */

test("Simulating user clicking Most Recent Button", () => {

    /* Arrange */
    
    // Mock the props that get passed into the Search component. User has clicked Least Recent Button
    const searchQuery = "";
    const setSearchQuery = jest.fn();
    const showPending = false;
    const setShowPending = jest.fn();
    const sorting = "1" // Least Recent
    const setSorting = jest.fn();
    
    
    render(<Search 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPending={showPending}
        setShowPending={setShowPending}
        sorting={sorting}
        setSorting={setSorting}/>);


    /* Act: simulate user clicking the Most Recent button */
    userEvent.click(screen.getByRole("radio", {name: "Most recent"}));

  
    /* Assert: the setSorting mock function is called exactly once. */
    expect(setSorting).toHaveBeenCalledTimes(1);
});




test("Simulating user clicking Least Recent Button", () => {

    /* Arrange */
    
    // Mock the props that get passed into the Search component. All props are set to initial value in Posts.js
    const searchQuery = "";
    const setSearchQuery = jest.fn();
    const showPending = false;
    const setShowPending = jest.fn();
    const sorting = "0" // Most Recent
    const setSorting = jest.fn();
    
    render(<Search 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPending={showPending}
        setShowPending={setShowPending}
        sorting={sorting}
        setSorting={setSorting}/>);


    /* Act: Simulate user clicking the Least Recent button */
    userEvent.click(screen.getByRole("radio", {name: "Least recent"}));


    /* Assert */
    
    /* This assertion will fail.  
       It shows that this logic needs to be checked in the Posts.js, because the useState hooks are created 
       in the Posts.js file.
       If I want this to work here, I need to rerender the Search componennt after clicking, to mock the behaviour of 
       React rerendering upon hook changing. This is not a very ideal way of testing (almost "cheating"). 
    */
    //expect(screen.getByRole("radio", {name: "Least recent"})).toBeChecked();
    
    // Assert that the setSorting mock function is called exactly once.
    expect(setSorting).toHaveBeenCalledTimes(1);
});



test("Simulating user clicking the Most interactions button", () => {

    /* Arrange */
    
    // Mock the props that get passed into the Search component. All props are set to initial value in Posts.js
    const searchQuery = "";
    const setSearchQuery = jest.fn();
    const showPending = false;
    const setShowPending = jest.fn();
    const sorting = "0" // Most Recent
    const setSorting = jest.fn();
    
    render(<Search 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPending={showPending}
        setShowPending={setShowPending}
        sorting={sorting}
        setSorting={setSorting}/>);


    /* Act: Simulate user clicking the Most Reaction button */
    userEvent.click(screen.getByRole("radio", {name: "Most interactions"}));


    /* Assert: the setSorting mock function is called exactly once. */
    expect(setSorting).toHaveBeenCalledTimes(1);
});


test("Simulating the user clicking the Hide requested button", () => {

    /* Arrange */
    
    // Mock the props that get passed into the Search component. All props are set to initial value in Posts.js
    const searchQuery = "";
    const setSearchQuery = jest.fn();
    const showPending = false;
    const setShowPending = jest.fn();
    const sorting = "0" // Most Recent
    const setSorting = jest.fn();
    
    render(<Search 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPending={showPending}
        setShowPending={setShowPending}
        sorting={sorting}
        setSorting={setSorting}/>);


    /* Act: Simulate user clicking the Hide requested button */
    userEvent.click(screen.getByRole("checkbox", {name: "Hide requested"}));


    /* Assert: the setShowPending mock function is called exactly once. */
    expect(setShowPending).toHaveBeenCalledTimes(1);
});


test("Simulating the user entering keywords in the Search box", async () => {

    /* Arrange */

    // Mock the props that get passed into the Search component. All props are set to initial value in Posts.js
    const searchQuery = "";
    const setSearchQuery = jest.fn();
    const showPending = false;
    const setShowPending = jest.fn();
    const sorting = "0" // Most Recent
    const setSorting = jest.fn();
    
    render(<Search 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPending={showPending}
        setShowPending={setShowPending}
        sorting={sorting}
        setSorting={setSorting}/>);

    
    /* Act: Simulate the user typing keywords in the search box */
    userEvent.type(screen.getByRole("textbox", {name: ""}), "S");
    
    /* Assert: the setSearchQuery mock function is executed exactly once */
    expect(setSearchQuery).toBeCalledTimes(1);

    
});
