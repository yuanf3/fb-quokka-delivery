import React, { useState } from "react";
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap";
import ConfirmModal from "./ConfirmModal";
import { formatPhotos } from "./PhotoRow";

/**
 * component: A single Facebook post.
 *
 * props:
 * - name (string): full name of the post author
 * - type (string): type of the post e.g. status, photo, video
 * - created_time (string): time the post was created
 * - updated_time (string): time the post was last updated
 * - id (string): unique ID of the post
 * - status (string): "pending review", "migrated" or "declined"
 * - commentsCount (integer): number of comments to the post
 * - handleRequest (function): handler for requesting post to be migrated
 * - handleSelect (function): handler for selecting the post
 * - isSelected (boolean): whether the post is selected
 * - content (object): content of the post e.g. message, photos
 * - userPicture (string): URL of the user's Facebook profile picture
 * - permalink (string): URL to the post on Facebook
 * - rejection (string): String indicating reason for rejection
 * - setShowSending (function): toggles the "Sending..." message
 *
 * state:
 * - showModal (boolean): whether to show the modal for confirming a migration request
 */
const Post = ({
  name,
  type,
  created_time,
  updated_time,
  id,
  status,
  commentsCount,
  handleRequest,
  handleSelect,
  isSelected,
  content,
  userPicture,
  permalink,
  rejection,
  setShowSending,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Handler for opening a modal to confirm sending a migration request
  const handleOpenModal = () => setShowModal(true);

  // Handler for closing the modal
  const handleCloseModal = (confirmed) => {
    setShowModal(false);
    if (confirmed) {
      setShowSending(true);
      handleRequest();
    }
  };

  return (
    <>
      <Card
        className="m-3"
        border={isSelected && "primary"}
        onClick={handleSelect}
      >
        <Card.Body>
          <Row xs="auto">
            <Col>
              <Image src={userPicture} roundedCircle />
            </Col>
            <Col className="p-0">
              <Card.Title as="h5">{name}</Card.Title>
              <Card.Subtitle as="h6" className="mb-2 text-muted">
                Content type: {type}
              </Card.Subtitle>
            </Col>
          </Row>
          <Card.Text>{content.message}</Card.Text>
        </Card.Body>

        <Container className="g-2">{formatPhotos(content.photos)}</Container>

        <Card.Body>
          <Card.Text>
            {`${commentsCount} interaction${commentsCount === 1 ? "" : "s"}`}
          </Card.Text>

          <Row className="px-1">
            <Col className="px-1">
              {status === false && (
                <Button
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent the onClick event from selecting the whole Post
                    handleOpenModal();
                  }}
                  variant="primary"
                  className="w-100"
                  id={"rm_" + id}
                >
                  Request Migration
                </Button>
              )}
              {status === "pending review" && (
                <Button variant="light" disabled className="w-100">
                  Waiting for approval
                </Button>
              )}
              {status === "migrated" && (
                <Button variant="success" disabled className="w-100">
                  Post migrated
                </Button>
              )}
              {status === "declined" && (
                <>
                  <Row>
                    <Col sm={8} className="px-1">
                      <Button variant="dark" disabled className="w-100">
                        Migration rejected
                      </Button>
                    </Col>
                    <Col sm={4} className="px-1">
                      <Button
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent the onClick event from selecting the whole Post
                          handleOpenModal();
                        }}
                        variant="primary"
                        className="w-100"
                        id={"rm_" + id}
                      >
                        Request Again
                      </Button>
                    </Col>
                  </Row>
                  <Row className="px-1">
                    {rejection !== "" && (
                      <>
                        Your migration was not approved for the following
                        reason:
                        <br />
                        {rejection}
                        <br />
                      </>
                    )}
                    You may edit your post on Facebook and request migration
                    again.
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>

        <Card.Footer className="text-muted">
          Post created: {new Date(created_time).toDateString()}
          <br />
          Last updated: {new Date(updated_time).toDateString()}
          <br />
          {/*Post ID: {id}*/}
          {/*<br />*/}
          <Button
            onClick={(event) => {
              event.stopPropagation(); // Prevent the onClick event from selecting the whole Post
              window.open(permalink, "_blank");
            }}
            variant="link"
            className="p-0"
          >
            Original post
          </Button>
        </Card.Footer>
      </Card>

      <ConfirmModal
        show={showModal}
        handleClose={handleCloseModal}
        heading="Please confirm"
        body="Migrate this post?"
      />
    </>
  );
};

export default Post;
