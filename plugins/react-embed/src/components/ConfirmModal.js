import React from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * component: A simple modal box for user confirmation.
 *
 * props:
 * - show (boolean): whether the modal is visible
 * - handleClose (function): handler for closing the modal
 * - heading (string): text to display in the heading
 * - body (string): text to display in the body
 */
const ConfirmModal = ({ show, handleClose, heading, body }) => {
  return (
    <Modal centered show={show} onHide={() => handleClose(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{heading}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => handleClose(true)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
