import React from "react";
import Hero from "./Hero.jsx";
import SectionOne from "./SectionOne.jsx";
import SectionTwo from "./SectionTwo.jsx";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

const Home = () => {
  console.log("Printing a message from Home component!");
  return (
    <Card className="w-auto h-auto bg-transparent">
      <div className="grid place-items-center">
        <CardHeader
          color="deep-orange"
          className="mt-4 w-fit lg:w-fit md:w-fit"
        >
          <Typography
            variant="h1"
            className="text-gray h-24 mx-4 lg:mx-12 mt-8"
          >
            Beak to Basics
          </Typography>
        </CardHeader>
      </div>
      <CardBody className="">
        <div className="border-b border-neutral-700 pb-4 mt-4">
          <Hero />
        </div>
      </CardBody>
      <CardBody>
        <div className="border-b border-neutral-700 pb-4 mt-4">
          <SectionOne />
        </div>
      </CardBody>
      <CardBody>
        <div className="-mt-12">
          <SectionTwo />
        </div>
      </CardBody>
    </Card>
  );
};

export default Home;
