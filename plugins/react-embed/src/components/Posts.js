import React, { useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Modal, Spinner } from "react-bootstrap";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import Post from "./Post";
import Search from "./Search";

/**
 * component: The feed of Facebook posts.
 *
 * props:
 * - login (boolean): whether the user is currently logged in to Facebook
 * - loggedInUser (object): Facebook user details including id and access token
 * - JWT (string): a token retrieved from WordPress for accessing protected API routes
 *
 * state:
 * - posts (array): details of user's posts returned from Graph API
 * - showModal (boolean): whether to show the modal for confirming a migration request
 * - sorting (string): 0=most recent, 1=least recent, 2=most reactions
 * - showPending (boolean): whether to show posts that are pending approval
 * - searchQuery (string): the query string from the search bar
 * - isFetching (boolean): whether currently fetching new posts
 * - isFirstPage (boolean): whether the next page to be fetched is the first
 * - isLastPage (boolean): whether the previous page to be fetched was the last
 * - nextPage (string): request URL for the next page
 * - selectAll (boolean): whether the Select All button has been toggled
 * - showSending (boolean): whether currently waiting for request(s) to be created
 */
const Posts = ({ login, loggedInUser, JWT }) => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sorting, setSorting] = useState("0");
  const [showPending, setShowPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [nextPage, setNextPage] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSending, setShowSending] = useState(false);

  // On login, add scroll event listener and automatically fetch first page
  useEffect(() => {
    if (login) {
      setIsFetching(true);
      window.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [login]);

  // Detect scrolling to bottom of page
  const handleScroll = () => {
    if (
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight
    ) {
      setIsFetching(true);
    }
  };

  // Fetch more posts
  useEffect(() => {
    if (!isFetching) return;
    fetchNextPage();
  }, [isFetching]);

  // Get feed from Graph API and fill in any existing requests info
  const fetchNextPage = (skipToNext) => {
    if (isLastPage) {
      setIsFetching(false);
      return;
    }
    // Determine axios request config
    let axiosConfig = isFirstPage
      ? {
          method: "get",
          url: "https://graph.facebook.com/v11.0/2658160797819865/feed",
          params: {
            fields:
              "message,from,created_time,updated_time,type,id,name,full_picture,reactions,comments,attachments,permalink_url",
            access_token: loggedInUser.accessToken,
          },
        }
      : nextPage;
    if (skipToNext) axiosConfig = skipToNext;
    // Make axios request
    axios(axiosConfig)
      .then((response) => {
        let newPosts = response.data.data;
        if (newPosts.length === 0) {
          // No more new posts, so we have reached the last page; stop fetching
          setIsLastPage(true);
          setIsFetching(false);
          return;
        }
        // Keep only the posts belonging to the logged in user
        newPosts = newPosts.filter((post) => {
          if (post.from === undefined) return false;
          return post.from.id === loggedInUser.id;
        });
        if (newPosts.length === 0) {
          // No posts after filtering, so skip to the next page
          fetchNextPage(response.data.paging.next);
          return;
        }
        // Get WordPress requests and if the request is already in WordPress, add migration status
        const promises = [];
        newPosts.forEach((post) => {
          promises.push(
            axios({
              method: "get",
              url: "/wp-json/custom-api/v1/fbposts/" + post.id,
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + JWT,
              },
            })
              .then((response) => {
                post.status = response.data.acf.migration_status;
                if (post.status === "declined") {
                  post.rejection_reason = response.data.acf.rejection_reason;
                }
              })
              .catch(() => {
                // The request doesn't exist for this post yet
                post.status = false;
              })
              .finally(() => {
                post.isSelected = false;
              })
          );
        });
        Promise.all(promises).then(() => {
          setPosts([...posts, ...newPosts]);
          setIsFirstPage(false);
          setNextPage(response.data.paging.next);
          setIsFetching(false);
        });
      })
      .catch((error) => console.log(error.message));
  };

  // Handler for opening a modal to confirm sending multiple migration requests
  const handleOpenModal = () => setShowModal(true);

  // Handler for closing the modal
  const handleCloseModal = (confirmed) => {
    setShowModal(false);
    // If modal was confirmed, handle migration requests for all selected posts
    if (confirmed) {
      setShowSending(true);
      const selected = posts.filter((post) => post.isSelected);
      handleRequests(selected);
    }
  };

  // Handler for saving a migration request to the database
  const handleRequests = (allPosts) => {
    const promises = [];
    allPosts.forEach((post) => {
      promises.push(
        axios({
          method: "post",
          url: "/wp-json/wp/v2/fbposts",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + JWT,
          },
          data: {
            title: post.id,
            content: getContent(post).message,
            status: "pending",
            fields: {
              created_time: post.created_time,
              file_links: getContent(post).photos,
              author_id: getAuthorID(post),
              updated_time: post.updated_time,
              author_name: getAuthorName(post),
              type: post.type,
              post_content: getContent(post).message,
              post_id: post.id,
              migration_status: "pending review",
              rejection_reason: "",
            },
          },
        })
      );
    });
    Promise.all(promises)
      .then(() => {
        // Update state so requested posts now show up as pending
        const newPosts = posts.map((post) => {
          if (allPosts.includes(post)) {
            return {
              ...post,
              status: "pending review",
              isSelected: false,
            };
          }
          return post;
        });
        setPosts(newPosts);
      })
      .catch((error) => console.log(error.message))
      .finally(() => {
        setShowSending(false);
      });
  };

  // Handler for selecting a post
  const handleSelect = (id) => {
    // Update state to show which posts are selected
    const newPosts = posts.map((post) => {
      // Only allow selection of posts that have not yet been requested
      if (post.id === id && !post.status) {
        return { ...post, isSelected: !post.isSelected };
      }
      return post;
    });
    setPosts(newPosts);
  };

  const numSelected = posts.filter((p) => p.isSelected).length;

  const getAuthorName = (post) => {
    if (post.from === undefined) return "Unknown User";
    return post.from.name;
  };

  const getAuthorID = (post) => {
    if (post.from === undefined) return 0;
    return post.from.id;
  };

  const getContent = (post) => {
    let content = {
      message: "",
      photos: [],
      // videos: [],
      // videoThumbs: [],
    };
    if (post.message) {
      content.message = post.message;
    }
    if (post.attachments) {
      const attachmentsData = post.attachments.data[0];
      let media;
      if (attachmentsData.subattachments) {
        media = attachmentsData.subattachments.data;
      } else if (attachmentsData.media) {
        media = [attachmentsData];
      }
      for (const m of media) {
        if (m.type === "photo") {
          content.photos.push(m.media.image.src);
        }
        // else if (
        //   m.type === "video" ||
        //   m.type === "video_inline" ||
        //   m.type === "video_autoplay"
        // ) {
        //   content.videos.push(m.media.source);
        //   content.videoThumbs.push(m.media.image.src);
        // }
      }
    }
    return content;
  };

  const getCommentsCount = (post) => {
    if (post.comments === undefined) return 0;
    return post.comments.data.length;
  };

  // Update state of posts by sorting
  useEffect(() => {
    switch (sorting) {
      case "0":
        setPosts((p) =>
          p.slice().sort((a, b) => (a.updated_time < b.updated_time ? 1 : -1))
        );
        break;
      case "1":
        setPosts((p) =>
          p.slice().sort((a, b) => (a.updated_time > b.updated_time ? 1 : -1))
        );
        break;
      case "2":
        setPosts((p) =>
          p
            .slice()
            .sort((a, b) =>
              getCommentsCount(a) < getCommentsCount(b) ? 1 : -1
            )
        );
        break;
      default:
    }
  }, [sorting]);

  const filterPosts = (posts, showPending, searchQuery) => {
    // Filter out posts that are pending approval depending on the checkbox
    if (showPending) {
      posts = posts.filter((post) => !post.status);
    }
    // Filter out posts according to search query from search bar
    return posts.filter((post) => {
      return getContent(post)
        .message.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  };

  const filteredPosts = filterPosts(posts, showPending, searchQuery);

  // Update selection when Select All button is toggled
  useEffect(() => {
    // Update state to show which posts are selected
    const newPosts = posts.map((post) => {
      // Only allow selection of posts that have not yet been requested
      if (!post.status) {
        return { ...post, isSelected: selectAll };
      }
      return post;
    });
    setPosts(newPosts);
  }, [selectAll]);

  return (
    <>
      {!login && (
        <Alert variant="warning">
          <Alert.Heading>You aren't logged in.</Alert.Heading>
          <p className="mb-0">
            You'll need to log in with Facebook before we can show you posts.
          </p>
        </Alert>
      )}
      {login && (
        <>
          <h2>Your Content ({posts.length})</h2>
          <Search
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showPending={showPending}
            setShowPending={setShowPending}
            sorting={sorting}
            setSorting={setSorting}
          />
          {filteredPosts.map((post) => (
            <Post
              key={post.id}
              name={post.from === undefined ? "Unknown User" : post.from.name}
              type={post.type}
              created_time={post.created_time}
              updated_time={post.updated_time}
              id={post.id}
              status={post.status}
              commentsCount={getCommentsCount(post)}
              handleRequest={() => handleRequests([post])}
              handleSelect={() => handleSelect(post.id)}
              isSelected={post.isSelected}
              content={getContent(post)}
              userPicture={loggedInUser.picture.data.url}
              permalink={post.permalink_url}
              rejection={post.rejection_reason}
              setShowSending={setShowSending}
            />
          ))}

          {isFetching && !isLastPage && (
            <div>
              <Spinner animation="border" size="sm" /> Fetching next page...
            </div>
          )}
          {isLastPage && "All posts loaded"}

          <ButtonGroup
            vertical
            className="position-fixed bottom-0 end-0 m-5 w-25"
          >
            <Button
              onClick={() => setSelectAll(!selectAll)}
              variant="primary"
              disabled={posts.length === 0}
              className="m-1"
            >
              {selectAll ? "Deselect All" : "Select All"}
            </Button>
            <Button
              onClick={handleOpenModal}
              variant="primary"
              disabled={numSelected === 0}
              className="m-1"
            >
              {numSelected === 0
                ? "0 selected"
                : `Request Selected (${numSelected})`}
            </Button>
          </ButtonGroup>

          <ConfirmModal
            show={showModal}
            handleClose={handleCloseModal}
            heading="Please confirm"
            body={`Migrate content from ${numSelected} post${
              numSelected === 1 ? "" : "s"
            }?`}
          />

          <Modal centered show={showSending}>
            <Modal.Body>
              <Modal.Title>Sending...</Modal.Title>
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

export default Posts;
