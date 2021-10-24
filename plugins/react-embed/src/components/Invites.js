import React, { useEffect, useState } from "react";
import axios from "axios";
import Invite from "./Invite";
import { Alert } from "react-bootstrap";

/**
 * component: All migration requests.
 *
 * props:
 * - su (boolean): whether the user has admin privileges
 * - JWT (string): a token retrieved from WordPress for accessing protected API routes
 *
 * state:
 * - invites (array): migration requests that are still pending review
 * - archived (array): all other migration requests
 * - groups (array): details of available BuddyBoss groups
 */
const Invites = ({ su, JWT }) => {
  const [invites, setInvites] = useState([]);
  const [archived, setArchived] = useState([]);
  const [groups, setGroups] = useState([]);

  // Get list of Buddyboss groups which can be posted to
  useEffect(() => {
    axios({
      method: "get",
      url: "/wp-json/buddyboss/v1/groups",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    })
      .then((response) => setGroups(response.data))
      .catch((error) => console.log(error.message));
  }, [JWT]);

  // Get all requests from database
  useEffect(() => {
    axios({
      method: "get",
      url: "/wp-json/custom-api/v1/fbposts-any-status",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    })
      .then((response) => {
        let data = response.data;
        data = data.map((invite) => ({ ...invite, isMigrating: false }));
        // Set the state variables
        setInvites(
          data.filter(
            (invite) => invite.acf.migration_status === "pending review"
          )
        );
        setArchived(
          data.filter(
            (invite) => invite.acf.migration_status !== "pending review"
          )
        );
      })
      .catch((error) => console.log(error.message));
  }, [groups, JWT]);

  const getMedia = (links) => {
    const promises = [];
    links.forEach((link) =>
      promises.push(
        axios({
          method: "GET",
          url: link, // URL of file
          responseType: "blob",
        })
      )
    );
    return Promise.all(promises);
  };

  const uploadMedia = (files, id) => {
    const promises = [];
    files.forEach((file, index) => {
      const data = file.data;
      const formData = new FormData();
      formData.append("file", new File([data], `${id}_${index}.jpg`));
      promises.push(
        axios({
          method: "POST",
          url: "/wp-json/buddyboss/v1/media/upload",
          headers: {
            Authorization: "Bearer " + JWT,
          },
          data: formData,
        })
      );
    });
    return Promise.all(promises);
  };

  const patchMedia = (media) => {
    const promises = [];
    media.forEach((m) => {
      const id = m.id;
      promises.push(
        axios({
          method: "patch",
          url: "/wp-json/buddyboss/v1/media/" + id,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + JWT,
          },
          data: {
            privacy: "grouponly",
          },
        })
      );
    });
    return Promise.all(promises);
  };

  // Handler for approving migration request
  const handleMigrate = async (inv, group) => {
    // Get media, upload media and receive mediaIDs
    const files = await getMedia(inv.acf.file_links);
    const bbResponses = await uploadMedia(files, inv.acf.post_id);
    const mediaIDs = bbResponses.map((response) => response.data.upload_id);

    // Post to BuddyBoss
    axios({
      method: "post",
      url: "/wp-json/buddyboss/v1/activity",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
      data: {
        component: "groups",
        primary_item_id: group,
        type: "activity_update",
        content: inv.acf.post_content,
        bp_media_ids: mediaIDs,
      },
    })
      .then((response) => {
        // Patch the author on BuddyBoss
        const bbid = response.data.id;
        axios({
          method: "patch",
          url: "/wp-json/buddyboss/v1/activity/" + bbid,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + JWT,
          },
          data: {
            user_id: inv.post_author,
          },
        }).then((response) => {
          // Patch media
          const mediaIDs = response.data.bp_media_ids;
          if (mediaIDs) patchMedia(mediaIDs);
        });
      })
      .then(() => {
        // Update migration status
        axios({
          method: "post",
          url: "/wp-json/custom-api/v1/fbposts/" + inv.acf.post_id,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + JWT,
          },
          data: {
            post_status: "publish",
            meta_input: {
              migration_status: "migrated",
              rejection_reason: "[APPROVED]",
            },
          },
        });
      })
      .then(() => {
        setIsMigrating(inv.acf.post_id, false);
        // Move over to archived section
        setInvites(
          invites.filter((invite) => invite.acf.post_id !== inv.acf.post_id)
        );
        inv.acf.migration_status = "migrated";
        setArchived([...archived, inv]);
      })
      .catch(() => {
        setIsMigrating(inv.acf.post_id, false);
      });
  };

  // Handler for rejecting migration request
  const handleDecline = (inv, reason) => {
    // Update migration status
    axios({
      method: "post",
      url: "/wp-json/custom-api/v1/fbposts/" + inv.acf.post_id,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
      data: {
        post_status: "pending",
        meta_input: {
          migration_status: "declined",
          rejection_reason: reason,
        },
      },
    }).then(() => {
      // Move over to archived section
      setInvites(
        invites.filter((invite) => invite.acf.post_id !== inv.acf.post_id)
      );
      inv.acf.migration_status = "declined";
      setArchived([...archived, inv]);
    });
  };

  // Update state to show migration in progress
  const setIsMigrating = (id, isMigrating) => {
    const newInvites = invites.map((invite) => {
      if (invite.acf.post_id === id) {
        return { ...invite, isMigrating: isMigrating };
      }
      return invite;
    });
    setInvites(newInvites);
  };

  // Format the content for Invite component
  const getContent = (inv) => {
    let content = {
      message: inv.acf.post_content,
      photos: [],
      // videos: [],
      // videoThumbs: [],
    };
    if (inv.acf.type === "photo" || inv.acf.type === "video") {
      content.photos = inv.acf.file_links;
    }
    return content;
  };

  return (
    <>
      {!su && (
        <Alert variant="danger">
          <Alert.Heading>Sorry, moderators only.</Alert.Heading>
          <p>
            Our moderators are hard at work reviewing posts for migration. If
            you're post isn't migrated yet, check back in a bit.
          </p>
          <hr />
          <p className="mb-0">Want to be a moderator? Get in touch!</p>
        </Alert>
      )}

      {su && (
        <>
          <h2>Migration Requests ({invites.length})</h2>

          {invites.map((invite) => (
            <Invite
              key={invite.acf.post_id}
              name={invite.acf.author_name}
              status={invite.acf.migration_status}
              type={invite.acf.type}
              created_time={invite.acf.created_time}
              updated_time={invite.acf.updated_time}
              id={invite.acf.post_id}
              content={getContent(invite)}
              groups={groups}
              handleMigrate={(group) => {
                setIsMigrating(invite.acf.post_id, true);
                handleMigrate(invite, group);
              }}
              handleDecline={(reason) => handleDecline(invite, reason)}
              isMigrating={invite.isMigrating}
            />
          ))}
        </>
      )}
    </>
  );
};

export default Invites;
