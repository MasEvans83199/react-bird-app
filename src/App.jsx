import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./services/supabase.js";
import {BrowserRouter, Route, Routes } from "react-router-dom";
import Menu from "./static/Menu.jsx";
import Footer from "./static/footer/Footer.jsx";
import Home from "./pages//home/Home.jsx";
import About from "./static/footer/About.jsx";
import Contact from "./static/footer/Contact.jsx";
import Birds from "./pages/birds-page/Birds.jsx";
import Photos from "./pages/Photos.jsx";
import Map from "./pages/Map.jsx";
import Login from "./pages/account/Login.jsx";
import Account from "./pages/account/Account.jsx";
import UpdatePassword from "./pages/account/UpdatePassword.jsx";
import Thread from "./pages/Thread.jsx";
import Posts from "./pages/Posts.jsx";
import "./App.css";
import "./index.css";
import { IconButton, Button, ThemeProvider } from "@material-tailwind/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const App = () => {
  const links = [
    { title: "Home", href: "/" },
    { title: "Birds", href: "/birds" },
    { title: "Photos", href: "/photos" },
    { title: "Map", href: "/map" },
    { title: "Thread", href: "/thread" },
  ];

  const sessionTimeoutDuration = 1800000; // 1 hour in milliseconds
  const [session, setSession] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSessionTimeout = () => {
    supabase.auth.signOut();

    clearTimeout(sessionTimeout);
    setSession(null);
  };

  useEffect(() => {
    const handleUserActivity = () => {
      clearTimeout(sessionTimeout);

      const newSessionTimeout = setTimeout(
        handleSessionTimeout,
        sessionTimeoutDuration
      );
      setSessionTimeout(newSessionTimeout);
    };

    if (session) {
      const sessionTimeout = setTimeout(
        handleSessionTimeout,
        sessionTimeoutDuration
      );
      setSessionTimeout(sessionTimeout);
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
    }

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [session]);

  return (
    <BrowserRouter>
      <div>
        <Menu title="Beak to Basics" links={links} session={session} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/birds" element={<Birds />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/map" element={<Map />} />
            <Route path="/login" element={<Login />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route
              path="/account"
              element={
                <div
                  className="account-container"
                  style={{ padding: "50px 0 100px 0" }}
                >
                  {!session ? (
                    <Login />
                  ) : (
                    <Account key={session.user.id} session={session} />
                  )}
                </div>
              }
            />
            <Route path="/post/:postId" element={<Posts session={session} />} />
            <Route path="/thread" element={<Thread session={session} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
