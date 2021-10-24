import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Form,
  FloatingLabel,
  Spinner,
} from "react-bootstrap";
import ConfirmModal from "./ConfirmModal";
import { formatPhotos } from "./PhotoRow";

/**
 * component: A single migration request.
 *
 * props:
 * - name (string): full name of the post author
 * - status (string): "pending review", "migrated", "declined" or "spam"
 * - type (string): type of the post e.g. status, photo, video
 * - created_time (string): time the post was created
 * - updated_time (string): time the post was last updated
 * - id (string): unique ID of the post
 * - content (object): content of the post e.g. message, photos
 * - groups ([object]): list of available groups to join
 * - handleMigrate (function): handler for approving a request
 * - handleDecline (function): handler for declining a request
 * - isMigrating (boolean): whether migration is currently in progress
 *
 * state:
 * - selectedGroup (string): id of selected group
 * - reason (string): reason for rejection
 * - showModal1 (boolean): whether to show the modal for confirming migration
 * - showModal2 (boolean): whether to show the modal for rejecting migration
 */
const Invite = ({
  name,
  status,
  type,
  created_time,
  updated_time,
  id,
  content,
  groups,
  handleMigrate,
  handleDecline,
  isMigrating,
}) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [reason, setReason] = useState("");
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  // Initialise the first group to be selected
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups]);

  // Handler for closing modal1 (confirm migrate)
  const handleCloseModal1 = (confirmed) => {
    setShowModal1(false);
    if (confirmed) {
      handleMigrate(selectedGroup);
    }
  };

  // Handler for closing modal2 (confirm reject)
  const handleCloseModal2 = (confirmed) => {
    setShowModal2(false);
    if (confirmed) {
      handleDecline(reason);
    }
  };

  return (
    <>
      <Card className="m-3">
        <Card.Body>
          <Card.Title as="h5">{name}</Card.Title>
          <Card.Subtitle as="h6" className="mb-2 text-muted">
            Content type: {type}
          </Card.Subtitle>
          <Card.Text>{content.message}</Card.Text>
        </Card.Body>

        <Container className="g-2">{formatPhotos(content.photos)}</Container>

        {status === "pending review" && (
          <Card.Body>
            <Row>
              <Col className="px-1">
                <FloatingLabel
                  controlId="floatingSelectGroup"
                  label="Choose a community"
                >
                  <Form.Select
                    aria-label="Choose a community"
                    onChange={(event) => setSelectedGroup(event.target.value)}
                  >
                    {groups.map((group) => {
                      return (
                        <option value={group.id} key={group.id}>
                          {`${group.name} (${group.status})`}
                        </option>
                      );
                    })}
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col className="px-1">
                <Form.Group className="mb-3" controlId="formReason">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Provide reason for rejection (optional)"
                    value={reason}
                    onInput={(event) => setReason(event.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className="px-1">
                <Button
                  onClick={() => {
                    setShowModal1(true);
                  }}
                  variant="outline-primary"
                  className="w-100"
                  id={"migrate_" + id}
                  disabled={isMigrating}
                >
                  {isMigrating ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Migrate"
                  )}
                </Button>
              </Col>
              <Col className="px-1">
                <Button
                  onClick={() => {
                    setShowModal2(true);
                  }}
                  variant="outline-danger"
                  className="w-100"
                  id={"decline_" + id}
                >
                  Reject
                </Button>
              </Col>
            </Row>
          </Card.Body>
        )}

        <Card.Footer className="text-muted">
          Post created: {new Date(created_time).toDateString()}
          <br />
          Last updated: {new Date(updated_time).toDateString()}
          <br />
          {/*Post ID: {id}*/}
        </Card.Footer>
      </Card>

      <ConfirmModal
        show={showModal1}
        handleClose={handleCloseModal1}
        heading="Please confirm migration"
        body={`Migrating this post to "${
          selectedGroup &&
          groups.find((group) => group.id == selectedGroup).name
        }"`}
      />
      <ConfirmModal
        show={showModal2}
        handleClose={handleCloseModal2}
        heading="Please confirm rejection"
        body={`Rejecting this post${reason && " due to: " + reason}`}
      />
    </>
  );
};

export default Invite;
