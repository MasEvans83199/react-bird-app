import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ButtonGroup,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  IconButton,
  Input,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Textarea,
  Timeline,
  TimelineItem,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  Typography,
  Switch,
} from "@material-tailwind/react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../services/supabase";
import defaultAvatar from "../assets/default_icon.png";

function Thread({ session }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImagePost, setIsImagePost] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen((cur) => !cur);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const postOpen = (postId) => {
    setSelectedPost((prev) => (prev === postId ? null : postId));
  };

  useEffect(() => {
    async function fetchPosts() {
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
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (posts) {
          setPosts(posts);
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchPosts();
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_posts",
        },
        (payload) => {
          fetchPosts();
        }
      )
      .subscribe();
  }, [session]);

  useEffect(() => {
    async function fetchReplies(postId) {
      try {
        if (selectedPost) {
          const { data: replies, error } = await supabase
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

          if (replies) {
            setReplies(replies);
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

  const handleUpload = async (event, storagePath) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];

      let { data, error } = await supabase.storage
        .from("forum_images")
        .upload(storagePath, file);

      if (error) {
        throw error;
      }

      const imageUrl = `https://ycfcamxsouvagmrltkbj.supabase.co/storage/v1/object/public/forum_images/${storagePath}`;

      setImageUrl(imageUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleDetailsChange = (event) => {
    setDetails(event.target.value);
  };

  const handleImageChange = (event) => {
    handleUpload(
      event,
      `user_${session.user.id}/${event.target.files[0].name}`
    );
  };

  const handleReplyChange = (event, postId) => {
    setNewReply(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isImagePost) {
        if (!imageUrl) {
          console.error("Please upload an image to post.");
          return;
        }

        const { error: postError } = await supabase
          .from("forum_posts")
          .insert([
            { text, details, image_url: imageUrl, user_id: session.user.id },
          ]);

        if (postError) {
          console.error("Error creating image post:", postError);
        }
      } else {
        if (!text) {
          console.error("Please enter text for the post.");
          return;
        }

        const { error: postError } = await supabase
          .from("forum_posts")
          .insert([{ text, details, user_id: session.user.id }]);

        if (postError) {
          console.error("Error creating text post:", postError);
        }
      }

      setImageUrl("");
      setText("");
      setDetails("");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    try {
      if (!newReply) {
        console.error("Please enter a reply for the post.");
        return;
      }

      const { data: selectedPostData, error: postError } = await supabase
        .from("forum_posts")
        .select(
          `
          user_id (
            id
          )
        `
        )
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
        reply: newReply,
        post_id: selectedPost,
        profile_id: session.user.id,
        created_at: new Date().toISOString(),
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
          message: newReply,
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
      setNewReply("");
    } catch (error) {
      console.error(error.message);
      alert("You must be signed in to reply to a post.");
    }
  };

  const handleSwitchChange = () => {
    setIsImagePost((prevValue) => !prevValue);
  };

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

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const next = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prev = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginationItemProps = (index) => ({
    className: currentPage === index ? "bg-light-blue-400 text-white" : "",
    onClick: () => setCurrentPage(index),
  });


  return (
    <Card className="flex flex-col justify-center items-center bg-transparent">
      <div className="grid place-items-center mb-8">
        <CardHeader color="deep-orange" className="mt-4 w-full">
          <Typography variant="h1" className="mb-4 mt-4 lg:mx-52">
            Forum
          </Typography>
        </CardHeader>
      </div>
      <Button className="mt-4 mb-8" color="light-blue" onClick={handleOpen}>
        New Post
      </Button>
      <Dialog
        size="xs"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[24rem]">
          <CardHeader
            variant="gradient"
            color="deep-orange"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h4" color="white">
              New Post
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center">
              <Typography className="mr-2 ml-8">Text Post</Typography>
              <Switch
                color="light-blue"
                checked={isImagePost}
                onChange={handleSwitchChange}
              />
              <Typography className="ml-2">Image Post</Typography>
            </div>
            {isImagePost ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  type="file"
                  color="light-blue"
                  label="Upload Image"
                  onChange={(e) => handleImageChange(e)}
                  required
                />
                <Input
                  size="lg"
                  color="light-blue"
                  className="bg-slate-300"
                  value={text}
                  onChange={(e) => handleTextChange(e)}
                  label="Title your post"
                  required
                />
                <Textarea
                  size="lg"
                  className="bg-slate-300"
                  color="light-blue"
                  value={details}
                  onChange={(e) => handleDetailsChange(e)}
                  label="Post details go here...(optional)"
                />
                <div className="grid place-items-center">
                  <Button color="light-blue" type="submit">
                    Submit Post
                  </Button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  size="lg"
                  color="light-blue"
                  className="bg-slate-300"
                  value={text}
                  onChange={(e) => handleTextChange(e)}
                  label="Title your post"
                  required
                />
                <Textarea
                  size="lg"
                  color="light-blue"
                  className="bg-slate-300"
                  value={details}
                  onChange={(e) => handleDetailsChange(e)}
                  label="Post details go here...(optional)"
                />
                <div className="grid place-items-center">
                  <Button color="light-blue" type="submit">
                    Submit Post
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </Dialog>
      <Timeline className="flex flex-col items-center  max-w-2xl">
        {currentPosts.map((post) => (
          <TimelineItem
            key={post.id}
            className="relative rounded-xl border border-blue-gray-50 bg-white py-3 pl-4 pr-8 shadow-lg shadow-gray-900/5 mb-8 w-full h-auto"
          >
            <TimelineHeader className="pb-3 ml-2 border-b flex">
              <div className="flex items-center flex-col">
                {post.user_id.avatar_url ? (
                  <TimelineIcon variant="ghost" className="p-0">
                    <Avatar size="sm" src={post.user_id.avatar_url} />
                  </TimelineIcon>
                ) : (
                  <TimelineIcon variant="ghost" className="p-0">
                    <Avatar size="sm" src={defaultAvatar} />
                  </TimelineIcon>
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
              <div className="flex-grow flex items-center justify-center">
                <Typography variant="h4" color="black" className="text-center">
                  {post.text}
                </Typography>
              </div>
            </TimelineHeader>
            <TimelineBody>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Uploaded by"
                  className="rounded-xl min-w-[200px] border-2 border-gray-500 shadow-lg shadow-blue-gray-900/5"
                />
              )}
              <Typography
                variant="paragraph"
                className="mt-4 text-left line-clamp-4"
              >
                {post.details}
              </Typography>
            </TimelineBody>
            <div className="grid place-items-center mt-4 border-t border-stone-800">
              <TimelineBody>
                <div>
                  <Typography variant="small">
                    {formatDateTime(post.created_at)}
                  </Typography>
                </div>
                <Link to={`#/post/${post.id}`}>
                  <Button
                    size="sm"
                    color="light-blue"
                    className="mt-4"
                  >
                    View Post
                  </Button>
                </Link>
              </TimelineBody>
            </div>
          </TimelineItem>
        ))}
      </Timeline>
      <CardFooter>
        <ButtonGroup variant="outlined" color="blue-gray">
          <IconButton onClick={prev}>
            <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => (
            <IconButton
              key={i}
              {...getPaginationItemProps(i + 1)}
              onClick={() => handlePaginationChange(i + 1)}
            >
              {i + 1}
            </IconButton>
          ))}
          <IconButton onClick={next}>
            <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
          </IconButton>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}

export default Thread;
