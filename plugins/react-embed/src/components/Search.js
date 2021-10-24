import React from "react";
import { Form } from "react-bootstrap";

/**
 * component: A form including a search bar and some options.
 *
 * props:
 * - searchQuery (string): the query string from the search bar
 * - setSearchQuery (function): handler for changing the above
 * - showPending (boolean): whether to show posts that are pending approval
 * - setShowPending (function): handler for changing the above
 * - sorting (string): the chosen sorting order (0=most recent, 1=least recent, 2=most reactions)
 * - setSorting (function): handler for changing the above
 */
const Search = ({
  searchQuery,
  setSearchQuery,
  showPending,
  setShowPending,
  sorting,
  setSorting,
}) => {
  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      <Form.Label>Search</Form.Label>
      <Form.Control
        placeholder="Search"
        value={searchQuery}
        onInput={(event) => setSearchQuery(event.target.value)}
      />
      <Form.Check
        inline
        type="radio"
        name="group-search"
        label="Most recent"
        checked={"0" === sorting}
        value="0"
        id="group-search-radio-0"
        onChange={(event) => setSorting(event.target.value)}
      />
      <Form.Check
        inline
        type="radio"
        name="group-search"
        label="Least recent"
        checked={"1" === sorting}
        value="1"
        id="group-search-radio-1"
        onChange={(event) => setSorting(event.target.value)}
      />
      <Form.Check
        inline
        type="radio"
        name="group-search"
        label="Most interactions"
        checked={"2" === sorting}
        value="2"
        id="group-search-radio-2"
        onChange={(event) => setSorting(event.target.value)}
      />
      <Form.Check
        type="checkbox"
        name="group-search"
        label="Hide requested"
        checked={showPending}
        id="group-search-checkbox"
        onChange={(event) => setShowPending(event.target.checked)}
      />
    </Form>
  );
};

export default Search;
