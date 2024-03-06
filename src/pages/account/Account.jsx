import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  ButtonGroup,
  Button,
  Input,
  T,
} from "@material-tailwind/react";

const TABLE_HEAD = ["Name", "Uploaded On", ""];

const TABLE2_HEAD = ["Title", "Uploaded On", "Details", ""];

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birdList, setBirdList] = useState([]);
  const [birdsLoading, setBirdsLoading] = useState(true);
  const [forumPosts, setForumPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [forumPostsLoading, setForumPostsLoading] = useState(true);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = (postId) =>
    setSelectedPost((prev) => (prev === postId ? null : postId));

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { user } = session;

      let { data, error } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn(error);
      } else if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }

      setLoading(false);
    }

    getProfile();
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          getProfile();
        }
      )
      .subscribe();
  }, [session]);

  async function updateProfile(event, newAvatarUrl) {
    event.preventDefault();

    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url: newAvatarUrl,
      updated_at: new Date(),
    };

    let { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert(error.message);
    } else {
      setAvatarUrl(newAvatarUrl);
    }
    setLoading(false);
  }

  useEffect(() => {
    const fetchBirdList = async () => {
      try {
        const { data: birdsData, error: birdsError } = await supabase
          .from("birds")
          .select("*")
          .eq("profile_id", session.user.id); // Filter by the user's profile id

        if (birdsError) {
          throw birdsError;
        }

        const sortedBirds = birdsData.sort(
          (a, b) => new Date(b.uploaded) - new Date(a.uploaded)
        );
        setBirdList(sortedBirds);
      } catch (error) {
        console.log("Error fetching bird data:", error.message);
      } finally {
        setBirdsLoading(false);
      }
    };

    fetchBirdList();
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "birds",
        },
        (payload) => {
          fetchBirdList();
        }
      )
      .subscribe();
  }, [session]);

  useEffect(() => {
    const fetchForumPosts = async () => {
      try {
        const { data: forumPostsData, error: forumPostsError } = await supabase
          .from("forum_posts")
          .select("*")
          .eq("user_id", session.user.id); // Filter by the user's user_id

        if (forumPostsError) {
          throw forumPostsError;
        }

        const sortedForumPosts = forumPostsData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setForumPosts(sortedForumPosts);
      } catch (error) {
        console.log("Error fetching forum posts:", error.message);
      } finally {
        setForumPostsLoading(false);
      }
    };

    fetchForumPosts();
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
          fetchForumPosts();
        }
      )
      .subscribe();
  }, [session]);

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

  function deleteBird(id) {
    supabase
      .from("birds")
      .delete()
      .eq("id", id)
      .then((response) => {
        alert("Bird deleted:", response);
        // If you want to update the UI after successful deletion, you can fetch the updated birdList here.
      })
      .catch((error) => {
        alert("Error deleting row:", error);
      });
  }

  function deletePost(id) {
    supabase
      .from("forum_posts")
      .delete()
      .eq("id", id)
      .then((response) => {
        console.log("Post deleted:", response);
        // If you want to update the UI after successful deletion, you can fetch the updated birdList here.
      })
      .catch((error) => {
        alert("Error deleting row:", error);
      });
  }

  const isMobile = window.innerWidth < 1024;

  return (
    <div className="flex justify-center">
      <Card className="sm:w-2/3 lg:w-1/2 items-center">
        <CardHeader
          variant="gradient"
          color="deep-orange"
          className="mb-4 grid h-28 w-fit lg:w-1/3 md:w-1/2 place-items-center"
        >
          <Typography variant="h3" className="mx-4">
            My Account
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 border-b border-stone-800 pb-8">
          <form onSubmit={updateProfile} className="">
            <Avatar
              url={avatarUrl}
              onUpload={updateProfile}
              session={session}
            />
            <div>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="text"
                size="lg"
                value={session.user.email}
                disabled
              />
            </div>
            <div className="mt-4">
              <Input
                id="username"
                label="Username"
                type="text"
                required
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <ButtonGroup variant="text" color="light-blue" className="mt-4">
              <Button type="submit" handler={updateProfile} disabled={loading}>
                {loading ? "Loading ..." : "Update"}
              </Button>
              <Button onClick={() => supabase.auth.signOut()}>Sign Out</Button>
              <Button>
                <Link to="#/">Back to Home</Link>
              </Button>
            </ButtonGroup>
          </form>
        </CardBody>
        <CardBody className="flex flex-col gap-4 border-b border-stone-800 pb-8">
          <Typography variant="h3">My Uploads</Typography>
          {birdList.length === 0 ? (
            <div className="text-center mt-4 border-x border-b">
              <Typography variant="body" color="blue-gray" className="mx-2">
                No birds uploaded yet
              </Typography>
            </div>
          ) : (
            <Card className="h-96 w-full overflow-y-scroll">
              <table className="w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    {TABLE_HEAD.map((head, index) => (
                      <th
                        key={head}
                        className={`border-b border-blue-gray-100 bg-blue-gray-50 p-4 ${
                          index !== 0 && index !== 2 && isMobile ? "hidden" : ""
                        }`}
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                {isMobile ? (
                  <tbody>
                    {birdList.map(({ id, name, uploaded }) => (
                      <tr key={id}>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => deleteBird(id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    {birdList.map(({ id, name, uploaded }) => (
                      <tr key={id}>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatDateTime(uploaded)}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => deleteBird(id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </Card>
          )}
        </CardBody>
        <CardBody className="flex flex-col gap-4">
          <Typography variant="h3">My Posts</Typography>
          {forumPosts.length === 0 ? (
            <div className="text-center mt-4 border-x border-b">
              <Typography variant="body" color="blue-gray" className="mx-2">
                No submitted posts yet
              </Typography>
            </div>
          ) : (
            <Card className="h-96 w-full overflow-y-scroll">
              <table className="w-full max-w-fit table-auto text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    {TABLE2_HEAD.map((head2, index) => (
                      <th
                        key={head2}
                        className={`border-b border-blue-gray-100 bg-blue-gray-50 p-4 ${
                          index !== 0 && index !== 3 && isMobile ? "hidden" : ""
                        }`}
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head2}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                {isMobile ? (
                  <tbody>
                    {forumPosts.map((post, index) => (
                      <tr key={post.id}>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {post.text}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    {forumPosts.map((post, index) => (
                      <tr key={post.id}>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {post.text}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatDateTime(post.created_at)}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Button
                            size="sm"
                            color="light-blue"
                            onClick={() => handleOpen(post.id)}
                            className=""
                          >
                            Show
                          </Button>
                          <Dialog
                            open={selectedPost === post.id}
                            handler={() => handleOpen(post.id)}
                            className="overflow-auto max-h-full"
                          >
                            <DialogHeader>{post.text}</DialogHeader>
                            <DialogBody divider>
                              <img
                                src={post.image_url}
                                className="rounded-xl min-w-[200px] mb-4"
                              ></img>
                              <Typography variant="paragraph">
                                {post.details}
                              </Typography>
                            </DialogBody>
                            <DialogFooter>
                              <Button
                                variant="outlined"
                                color="red"
                                onClick={() => handleOpen(post.id)}
                                className="mr-1"
                              >
                                Close
                              </Button>
                            </DialogFooter>
                          </Dialog>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50">
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </Card>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
