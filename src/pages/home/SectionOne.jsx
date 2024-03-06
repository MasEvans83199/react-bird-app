import { Typography, Button } from "@material-tailwind/react";
import React from "react";
import { Link } from "react-router-dom";
import connect from "../../images/home_photos/section-one.png";

const SectionOne = () => {
  return (
    <div className="w-full lg:p-8 p-4 flex items-center justify-between">
      <div className="lg:w-[40%] w-full lg:block hidden ">
        <img src={connect} alt="Hero" className="shadow-xl rounded-lg" />
      </div>
      <div className="lg:w-[60%] w-full lg:px-6 lg:pl-10">
        <Typography className="text-3xl ...(truncated)">
          Look through a gallery of bird photos
        </Typography>
        <Typography className="font-poppins mb-6">
          Here, you can browse a gallery of the most beautiful birds in the
          world. You will be able to see birds from all over the world!
        </Typography>
        <Link to="#/photos">
          <Button size="lg" color="light-blue">
            <span>Browse Gallery</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SectionOne;
