import { Button, Typography } from "@material-tailwind/react";
import React from "react";
import { Link } from "react-router-dom";

import hero from "../../images/home_photos/hero-image.png";

const Hero = () => {
  return (
    <div className="w-full lg:p-8 px-4 flex ...(truncated)">
      <div className="lg:w-[60%] w-full lg:px-6 lg:pr-14">
        <Typography className="text-3xl ...(truncated)">
          Learn about all different types of birds
        </Typography>
        <Typography className="font-poppins mb-6">
          Look through an expansive catalog of birds, where you can learn about
          their names, behaviors, appearance, calls, and so much more!
        </Typography>
        <Link to="#/birds">
          <Button size="lg" color="light-blue">
            <span>Explore Birds</span>
          </Button>
        </Link>
      </div>
      <div className="lg:w-[40%] w-full lg:block hidden ">
        <img src={hero} alt="Hero" className="shadow-xl rounded-lg" />
      </div>
    </div>
  );
};

export default Hero;
