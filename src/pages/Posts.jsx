import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Collapse,
  Avatar,
  IconButton,
  Input,
  Textarea,
  Typography,
 } from "@material-tailwind/react";
import {
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../services/supabase"; // Import your supabase service

function Posts({ session }) {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const tempUsernamesRef = useRef({});
  const [selectedPost, setSelectedPost] = useState(postId);
  const [mainReply, setMainReply] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [newReplyTo, setNewReplyTo] = useState("");
  const [openReplies, setOpenReplies] = useState({});

  // Fetch the post data based on postId
  useEffect(() => {
    async function fetchPost() {
      try {
        const { data: posts, error } = await supabase
          .from("forum_posts")
          .select(
            `*,
            user_id (
              id,
              username,
              avatar_url
            )
          `
          )
          .eq("id", postId);

        if (error) {
          throw error;
        }

        if (posts && posts.length > 0) {
          setPost(posts[0]);
        } else {
          console.error("Post not found");
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchPost();
  }, [postId]);

  useEffect(() => {
    async function fetchReplies(postId, parentReplyId = null) {
      try {
        if (selectedPost) {
          const { data: repliesData, error } = await supabase
            .from("replies")
            .select(
              `
              *,
              profile_id (
                id,
                username,
                avatar_url
              )
            `
            )
            .eq("post_id", selectedPost)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          if (repliesData) {
            setReplies(repliesData);
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchReplies();
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "replies",
        },
        (payload) => {
          fetchReplies();
        }
      )
      .subscribe();
  }, [session, selectedPost]);

  if (!post) {
    return <div>Loading...</div>;
  }

  const formatDateTime = (timestamp) => {
    const options = {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(timestamp).toLocaleString(undefined, options);
  };

  const handleReplyChange = (event, postId) => {
    setMainReply(event.target.value);
    setNewReplyTo(event.target.value);
  };

  const handleReplySubmit = async (event, specificReplyId = null) => {
    event.preventDefault();
    try {
      // Check if mainReply is empty for the main post
      if (!mainReply && !replyTo && !specificReplyId) {
        console.error("Please enter a reply for the post.");
        return;
      }

      // Check if newReplyTo is empty for a reply to a reply
      if (!newReplyTo && (replyTo || specificReplyId)) {
        console.error("Please enter a reply to this reply.");
        return;
      }

      const { data: selectedPostData, error: postError } = await supabase
        .from("forum_posts")
        .select(`
          user_id (
            id
          )
        `)
        .eq("id", selectedPost);

      if (postError) {
        console.error("Error getting post data:", postError);
        return;
      }

      const selectedUserId = selectedPostData[0].user_id.id;

      const { data: replyIdData, error: replyIdError } = await supabase.from(
        "replies"
      ).select(`
          id
        `);

      if (replyIdError) {
        console.error("Error with reply:", replyIdError);
        return;
      }

      const replyId = replyIdData[0].id;

      const newReplyObj = {
        reply: specificReplyId ? newReplyTo : mainReply,
        post_id: selectedPost,
        profile_id: session.user.id,
        created_at: new Date().toISOString(),
        parent_reply_id: specificReplyId || replyTo,
      };

      const { error: replyError } = await supabase
        .from("replies")
        .insert([newReplyObj]);

      if (selectedUserId !== session.user.id) {
        const notifObj = {
          user_id: selectedUserId,
          post_id: selectedPost,
          created_at: new Date().toISOString(),
          reply_user_id: session.user.id,
          message: specificReplyId ? newReplyTo : mainReply,
          reply_id: replyId,
        };

        const { error: notifError } = await supabase
          .from("notifications")
          .insert([notifObj]);

        if (replyError || notifError) {
          console.error("Error creating reply:", replyError, notifError);
          return;
        }
      }

      setReplies((prevReplies) => [...prevReplies, newReplyObj]);
      setMainReply("");
      setReplyTo(null);
      setNewReplyTo("");
    } catch (error) {
      console.error(error.message);
      alert("You must be signed in to reply to a post.");
    }
  };



  const handleReplyTo = (replyId) => {
    setReplyTo(null); // Reset replyTo for main reply
    setNewReplyTo(""); // Reset newReplyTo for main reply
    setReplyTo(replyId); // Set replyTo for specific reply
  };


    const toggleReplyTextarea = (replyId) => {
      setOpenReplies((prevOpenReplies) => ({
        ...prevOpenReplies,
        [replyId]: !prevOpenReplies[replyId],
      }));
    };

  const generateTempUsername = (() => {
    let counter = 0;
    return () => {
      counter += 1;
      return `Unnamed User ${counter}`;
    };
  })();

  const getTempUsername = (userId) => {
    if(tempUsernamesRef.current[userId]) {
      return tempUsernamesRef.current[userId];
    }

    const newTempUsername = `Anonymous User #${Object.keys(tempUsernamesRef.current).length + 1}`;
    tempUsernamesRef.current[userId] = newTempUsername;
    return newTempUsername;
  }

    const renderReplies = (replies, parentReplyId = null, depth = 0, maxDepth = 10) => {
    if (depth > maxDepth) {
      console.error("Maximum recursion depth reached.");
      return null;
    }

    const filteredReplies = replies.filter(reply => reply.parent_reply_id === parentReplyId);

    if (filteredReplies.length === 0) {
      return null;
    }


    return (
      <div>
        {filteredReplies.map((reply) => (
          <div
            key={reply.id}
            className="ml-4 mt-2 border-l"
            style={{ marginLeft: calculateIndentation(reply.level) }}
          >
            <div className="flex items-center">
              <Typography variant="small" color="gray" className="text-left ml-2">
                <span>
                  {reply.profile_id.username ? reply.profile_id.username : getTempUsername(reply.profile_id.id)}
                </span>
                <span className="ml-2">
                  {formatDateTime(reply.created_at)}
                </span>
              </Typography>
              <PaperAirplaneIcon
                className="h-4 w-4 ml-2"
                onClick={() => toggleReplyTextarea(reply.id)}
              />
            </div>
            {/* Render the reply text */}
            <Typography variant="paragraph" className="text-left mb-2 ml-2">
              {reply.reply}
            </Typography>
            <Collapse open={openReplies[reply.id]}>
              <form onSubmit={(e) => handleReplySubmit(e, reply.id)}>
                <Textarea
                  size="md"
                  className="bg-slate-300"
                  color="light-blue"
                  value={newReplyTo}
                  onChange={(e) => setNewReplyTo(e.target.value)}
                  label={`Reply to ${reply.profile_id.username}'s post...`}
                />
                <div className="grid place-items-center">
                  <Button color="light-blue" type="submit">
                    Reply
                  </Button>
                </div>
              </form>
            </Collapse>
            {renderReplies(replies, reply.id, depth + 1, maxDepth)}
          </div>
        ))}
      </div>
    );
  };
  
  const calculateIndentation = (level) => {
    // Set the base indentation and increase it for each level of nesting
    const baseIndentation = 2; // You can adjust this value based on your design
    return `${baseIndentation + level * 2}rem`;
  };

  return (
    <div className="grid place-items-center">
      <Card className="mt-12 sm:w-full lg:w-1/2 md:w-full">
        <CardHeader>
          <div className="flex items-center ml-4 my-2">
            <div className="flex items-center mr-4">
              {post.user_id.avatar_url ? (
                <Avatar className="mr-2" size="sm" src={post.user_id.avatar_url} />
              ) : (
                <Avatar className="mr-2" size="sm" src={defaultAvatar} />
              )}
              {post.user_id.username ? (
                <Typography variant="small" color="black">
                  {post.user_id.username}
                </Typography>
              ) : (
                <Typography variant="small" color="black">
                  {generateTempUsername()}
                </Typography>
              )}
            </div>
            <div className="flex-1 text-right mr-2">
              <Typography variant="small">
                {formatDateTime(post.created_at)}
              </Typography>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="flex-grow flex items-center justify-center">
            <Typography variant="h4" color="black" className="text-center">
              {post.text}
            </Typography>
          </div>
        </CardBody>
        <CardBody>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Uploaded by"
              className="rounded-xl min-w-[200px] border-2 border-gray-500 shadow-lg shadow-blue-gray-900/5"
            />
          )}
          <Typography
            variant="paragraph"
            className="mt-4 text-left"
          >
            {post.details}
          </Typography>
        </CardBody>
        <CardBody>
          <form onSubmit={handleReplySubmit}>
            <Textarea
              size="md"
              className="bg-slate-300"
              color="light-blue"
              value={mainReply}
              onChange={(e) => handleReplyChange(e)}
              label="Reply to this post..."
            />
            <div className="grid place-items-center">
              <Button color="light-blue" type="submit">
                Reply
              </Button>
            </div>
          </form>
        </CardBody>
        <CardBody className="grid place-items-start border-t">
          {replies.length > 0 ? (
            <div>
              <Typography variant="h5">Replies:</Typography>
              {renderReplies(replies)}
            </div>
          ) : (
            <div>
              <Typography variant="h5">Replies:</Typography>
              <Typography
                variant="small"
                className="text-left mb-2 mt-6 ml-4"
              >
                No replies yet.
              </Typography>
            </div>
          )}
        </CardBody>
        <CardFooter className="border-t">
          <Link to="#/thread">
            <Button color="deep-orange">Back to Forum</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Posts;
