import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

const About = () => {
  return (
    <div className="grid place-items-center">
      <Card className="w-3/4">
        <div className="grid place-items-center">
          <CardHeader
            className="grid mt-4 h-28 w-fit lg:w-1/3 md:w-1/2 place-items-center"
            color="deep-orange"
            variant="gradient"
          >
            <Typography variant="h2" className="mx-2">
              About the Website
            </Typography>
          </CardHeader>
        </div>
        <CardBody className="w-7/8 ml-4">
          <Typography variant="paragraph" color="gray" className="text-left">
            Welcome to Beak to Basics. This is a solo development project built
            entirely in React. This originally was intended to be a way for me
            to learn more about React and to learn more about Birds.
          </Typography>
          <br></br>
          <Typography variant="paragraph" color="gray" className="text-left">
            Some of the main features of this project are as follows: the Birds
            page, which allows users to browse and upload to a catalog of birds,
            the Photos page, which allows users to look through a gallery of
            photos of birds, the Bird Chat page, which allows users to create a
            post to start a discussion about various bird-related topics. These
            are just the base features, and there is much more to discover.
          </Typography>
          <br></br>
          <Typography variant="paragraph" color="gray" className="text-left">
            I have lots more planned for this project, but this is currently the
            first version. I hope to add more features that improve the user
            experience and make this site more accessible to the public.
          </Typography>
        </CardBody>
        <CardFooter className="text-left" divider>
          <Typography className="bottom-0 left-0" variant="small" color="gray">
            *All bird sounds are gathered from
            <Link to="xeno-canto.org"> xeno-canto.org </Link>
            and are designated as fair use under the Creative Commons
            Attribution-ShareAlike 4.0 International License. <br></br>
            **All images are designated as fair use under the Creative Commons
            Attribution-ShareAlike 4.0 International License.
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
};

export default About;
