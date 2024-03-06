import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import defaultAvatar from "../assets/default_icon.png";
import { GiKiwiBird } from "react-icons/gi";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Navbar,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import {
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
  HomeIcon,
  NewspaperIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  PowerIcon,
  RocketLaunchIcon,
  Bars2Icon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

import { BellIcon } from "@heroicons/react/24/solid";

import "../App.css";

const navListMenuItems = [
  {
    title: "Birds",
    href: "#/birds",
    description: "Learn about different types of birds",
  },
  {
    title: "Photos",
    href: "#/photos",
    description: "Browse a photo gallery of birds",
  },
  {
    /* {
    title: "Birds of the World",
    href: "/map",
    description: "Explore the world of birds",
  },*/
  },
];

function ProfileMenu({ session }) {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getAvatar() {
      const { user } = session;

      let { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn(error);
      } else if (data) {
        setAvatarUrl(data.avatar_url);
      }
    }

    getAvatar();
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
          getAvatar();
        }
      )
      .subscribe();
  }, [session]);

  const handleAuth = async () => {
    if (session) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Handle sign-out error
        throw error;
      }
    } else {
      navigate("#/login");
    }
  };

  const profileMenuItems =
    session && session.user
      ? [
          {
            label: "My Account",
            href: "#/account",
            icon: UserCircleIcon,
          },
          {
            label: "Log Out",
            onClick: handleAuth,
            icon: PowerIcon,
          },
        ]
      : [
          {
            label: "Sign In",
            href: "#/login",
            icon: UserCircleIcon,
          },
        ];

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="white"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          {!session ? (
            <Avatar
              variant="circular"
              size="md"
              className="border border-orange-500 p-0.5"
              src={defaultAvatar}
              alt="Your Avatar"
            />
          ) : (
          <Avatar
            variant="circular"
            size="md"
            className="border border-orange-500 p-0.5"
            src={avatarUrl}
            alt="Your Avatar"
          />
          )}
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
            color="gray"
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {profileMenuItems.map(({ label, href, onClick, icon }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <Link to={href} key={label}>
              <MenuItem
                onClick={closeMenu}
                className={`flex items-center gap-2 rounded ${
                  isLastItem
                    ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                    : ""
                }`}
              >
                {React.createElement(icon, {
                  className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                  strokeWidth: 2,
                })}
                <Typography
                  as="span"
                  variant="small"
                  className="font-normal"
                  color={isLastItem ? "red" : "inherit"}
                  onClick={isLastItem ? () => supabase.auth.signOut() : null}
                >
                  {label}
                </Typography>
              </MenuItem>
            </Link>
          );
        })}
      </MenuList>
    </Menu>
  );
}

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const triggers = {
    onMouseEnter: () => setIsMenuOpen(true),
    onMouseLeave: () => setIsMenuOpen(false),
  };

  const renderItems = navListMenuItems.map(
    ({ title, href, description }, key) => (
      <Link to={href} key={key}>
        <MenuItem>
          <Typography variant="h6" color="blue-gray" className="mb-1">
            {title}
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {description}
          </Typography>
        </MenuItem>
      </Link>
    )
  );

  return (
    <React.Fragment>
      <Menu open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <Typography as="a" href="#" variant="small" className="font-normal">
            <MenuItem
              {...triggers}
              className="hidden items-center gap-2 text-blue-gray-900 lg:flex lg:rounded-full"
            >
              <NewspaperIcon className="h-[18px] w-[18px]" /> Pages{" "}
              <ChevronDownIcon
                strokeWidth={2}
                className={`h-3 w-3 transition-transform ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </MenuItem>
          </Typography>
        </MenuHandler>
        <MenuList
          {...triggers}
          className="hidden w-[36rem] grid-cols-7 gap-3 overflow-visible lg:grid"
        >
          <Card
            color="deep-orange"
            shadow={false}
            variant="gradient"
            className="col-span-3 grid h-full w-full place-items-center rounded-md"
          >
            <GiKiwiBird strokeWidth={1} className="h-28 w-28" />
          </Card>
          <ul className="col-span-4 flex w-full flex-col gap-1">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <MenuItem className="flex items-center gap-2 text-blue-gray-900 lg:hidden">
        <NewspaperIcon className="h-[18px] w-[18px]" /> Pages{" "}
      </MenuItem>
      <ul className="ml-6 flex w-full flex-col gap-1 lg:hidden">
        {renderItems}
      </ul>
    </React.Fragment>
  );
}

const navListItems = [
  {
    label: "Home",
    icon: HomeIcon,
    href: "#/",
  },
  {
    label: "Bird Chat",
    icon: ChatBubbleBottomCenterTextIcon,
    href: "#/thread",
  },
];

function NavList() {
  return (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center">
      <NavListMenu />
      {navListItems.map(({ label, icon, href }, key) => (
        <Link to={href} key={label}>
          <Typography
            variant="small"
            color="blue-gray"
            className="font-normal"
          >
            <MenuItem className="flex items-center gap-2 lg:rounded-full">
              {React.createElement(icon, { className: "h-[18px] w-[18px]" })}{" "}
              {label}
            </MenuItem>
          </Typography>
        </Link>
      ))}
    </ul>
  );
}

function ComplexNavbar({ session }) {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const toggleNotifOpen = () => setNotifOpen((cur) => !cur);
  const [notifications, setNotifications] = React.useState([]);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");

  const dialogOpen = (notificationId) => {
    const selectedNotification = notifications.find(
      (notification) => notification.id === notificationId
    );
    if (selectedNotification) {
      setSelectedPost(selectedNotification.post_id.id);
    } else {
      setSelectedPost(null);
    }
  };

  const closeDialog = () => {
    // Remove the selected post from state
    setSelectedPost(null);

    // Find the index of the notification to be removed
    const indexToRemove = notifications.findIndex(
      (notification) => notification.post_id.id === selectedPost
    );

    // If the notification is found, remove it from the notifications state
    if (indexToRemove !== -1) {
      const updatedNotifications = [...notifications];
      updatedNotifications.splice(indexToRemove, 1);
      setNotifications(updatedNotifications);

      // Delete the corresponding notification from the Supabase table
      const notificationIdToDelete = notifications[indexToRemove].id;
      deleteNotification(notificationIdToDelete);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await supabase.from("notifications").delete().eq("id", notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error.message);
    }
  };

  useEffect(() => {
    async function fetchNotifications() {
      const { user } = session;

      const { data, error } = await supabase
        .from("notifications")
        .select(
          `*,
                  post_id (
                   *
                 ),
                 reply_id (
                  profile_id:
                  profiles (
                    username
                  )
                 )
               `
        )
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (data) {
        setNotifications(data);
      }
    }

    fetchNotifications();
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();
  }, [session]);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  useEffect(() => {
    async function fetchReplies(postId) {
      try {
        if (selectedPost) {
          // Ensure that selectedPost is truthy before fetching replies
          const { data: replies, error } = await supabase
            .from("replies")
            .select(
              `
            *,
            post_id (
              *
            )
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

  const handleReplyChange = (event, postId) => {
    setNewReply(event.target.value);
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    try {
      if (!newReply) {
        // Handle the case where no reply is provided
        console.error("Please enter a reply for the post.");
        return;
      }

      const newReplyObj = {
        reply: newReply,
        post_id: selectedPost,
        profile_id: session.user.id,
        created_at: new Date().toISOString(),
      };
      // Create a new reply for the selected post
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
        };

        const { error: notifError } = await supabase
          .from("notifications")
          .insert([notifObj]);

        if (replyError || notifError) {
          console.error("Error creating reply:", replyError, notifError);
          return;
        }
      }

      // Clear the reply input field after posting
      setReplies((prevReplies) => [...prevReplies, newReplyObj]);
      setNewReply("");
    } catch (error) {
      console.error(error.message);
      alert("You must be signed in to reply to a post.");
    }
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

  const generateTempUsername = (() => {
    let counter = 0;
    return () => {
      counter += 1;
      return `Unnamed User ${counter}`;
    };
  })();
  

  return (
    <Navbar
      className="mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6 mb-2 "
      variant="gradient"
    >
      <div className="relative mx-auto flex items-center">
        <Link to="#/" className="text-stone-950">
          <img
            className="h-24 w-32 -ml-4 -my-6 rounded-full object-cover object-center"
            src="src/images/bird_logo.png"
            alt="bird logo"
          />
        </Link>
        <div className="absolute top-2/4 left-2/4 hidden -translate-x-2/4 -translate-y-2/4 lg:block">
          <NavList />
        </div>
        {/*<div className="">
          <IconButton
            size='sm'
            variant='text'
            onClick={toggleDarkMode}
            className="right-4 p-2 rounded-full bg-blue-gray-800 text-white dark:bg-yellow-500 dark:text-blue-gray-900"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-500" /> // Sun icon for light mode
            ) : (
              <MoonIcon className="h-6 w-6 text-blue-gray-500" /> // Moon icon for dark mode
            )}
          </IconButton>
        </div>*/}
        <div className="ml-auto flex gap-1 md:mr-4">
          <IconButton
            size="sm"
            color="blue-gray"
            variant="text"
            onClick={toggleIsNavOpen}
            className="ml-auto mr-2 mt-2 lg:hidden"
          >
            <Bars2Icon className="h-6 w-6" />
          </IconButton>
          {notifications.length > 0 ? (
            <Menu>
              <MenuHandler>
                <div className="flex items-center gap-8">
                  <Badge
                    content={notifications.length}
                    overlap="circular"
                    placement="top-end"
                  >
                    <IconButton
                      size="sm"
                      color="blue-gray"
                      variant="text"
                      onClick={toggleNotifOpen}
                      className="ml-auto mr-2 mt-2"
                    >
                      <BellIcon className="h-6 w-6" />
                    </IconButton>
                  </Badge>
                </div>
              </MenuHandler>
              <MenuList className=" max-h-32 overflow-y-auto">
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    className="border-b"
                    onClick={() => dialogOpen(notification.id)}
                  >
                    <Typography variant="small">
                      {notification.reply_id.profile_id.username ? (
                        <>
                          {notification.reply_id.profile_id.username} replied to
                          your post: {notification.post_id.text}
                        </>
                      ) : (
                        <>
                          An unnamed user replied to your post:{" "}
                          {notification.post_id.text}
                        </>
                      )}
                    </Typography>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          ) : (
            <Menu>
              <MenuHandler>
                <div className="flex items-center gap-8">
                  <Badge
                    content={notifications.length}
                    overlap="circular"
                    placement="top-end"
                    className="hidden"
                  >
                    <IconButton
                      size="sm"
                      color="blue-gray"
                      variant="text"
                      onClick={toggleNotifOpen}
                      className="ml-auto mr-2 mt-2"
                    >
                      <BellIcon className="h-6 w-6" />
                    </IconButton>
                  </Badge>
                </div>
              </MenuHandler>
              <MenuList className=" max-h-32 overflow-y-auto">
                <MenuItem>
                  <Typography variant="small">No new notifications.</Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
          <ProfileMenu session={session} avatarUrl={avatarUrl} />
        </div>
      </div>
      <Collapse open={isNavOpen} className="overflow-scroll">
        <NavList />
      </Collapse>
      {selectedPost !== null && (
        <>
          {notifications.map((notification) => {
            if (notification.post_id.id === selectedPost) {
              return (
                <Dialog
                  open={selectedPost === notification.post_id.id}
                  handler={() => dialogOpen(notification.id)}
                  className="overflow-auto max-h-full"
                >
                  <DialogHeader>{notification.post_id.text}</DialogHeader>
                  <DialogBody divider>
                    <img
                      src={notification.post_id.image_url}
                      className="rounded-xl min-w-[200px] mb-4"
                    ></img>
                    <Typography variant="paragraph">
                      {notification.post_id.details}
                    </Typography>
                  </DialogBody>
                  <DialogBody divider>
                    <form onSubmit={handleReplySubmit}>
                      <Textarea
                        size="md"
                        className="bg-slate-300"
                        color="light-blue"
                        value={newReply}
                        onChange={(e) => handleReplyChange(e)}
                        label="Reply to this post..."
                      />
                      <div className="grid place-items-center">
                        <Button color="light-blue" type="submit">
                          Reply
                        </Button>
                      </div>
                    </form>
                    <div>
                      <Typography variant="h5">Replies:</Typography>
                      <div>
                        {replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="ml-4 mt-2 border-b border-l"
                          >
                            {reply.profile_id.username ? (
                              <Typography
                                variant="small"
                                color="gray"
                                className="text-left ml-2"
                              >
                                {reply.profile_id.username} -{" "}
                                {formatDateTime(reply.created_at)}
                              </Typography>
                            ) : (
                              <Typography
                                variant="small"
                                color="gray"
                                className="text-left ml-2"
                              >
                                {generateTempUsername()} -{" "}
                                {formatDateTime(reply.created_at)}
                              </Typography>
                            )}
                            <Typography
                              variant="paragraph"
                              className="text-left mb-2 ml-4"
                            >
                              {reply.reply}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <Button
                      variant="outlined"
                      color="red"
                      onClick={closeDialog}
                      className="mr-1"
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </Dialog>
              );
            }
            return null;
          })}
        </>
      )}
    </Navbar>
  );
}

export default ComplexNavbar;
