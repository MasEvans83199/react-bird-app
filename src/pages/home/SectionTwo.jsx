import React from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

function SectionTwo() {
  const features = [
    {
      icon: <ChatBubbleLeftRightIcon />,
      title: "Ask Questions",
      description:
        "Have a question? Ask other users and see what new things you can learn!",
    },
    {
      icon: <UserGroupIcon />,
      title: "Start A Discussion",
      description:
        "Know something interesting about a particular bird or just have bit of information to share? Start a discussion with other users!",
    },
  ];

  return (
    <section className="py-10 lg:py-20">
      <div className="mx-auto mb-24 w-full text-center md:w-3/4 lg:w-1/2">
        <Typography variant="h2" className="mb-2 font-semibold tracking-normal">
          Participate in the Bird Community
        </Typography>
        <Typography className="mb-2 text-lg font-light">
          Join the Bird Community and participate in discussions, chats, and
          more!
        </Typography>
      </div>
      <div className="flex flex-row flex-wrap place-content-center">
        {features.map(({ icon, title, description }, key) => (
          <div
            key={key}
            className="mb-12 w-full max-w-full px-3 sm:w-1/2 sm:flex-none lg:mb-0 xl:mb-0 xl:w-1/4"
          >
            <Card className="border border-white/80 bg-white/80 shadow-lg backdrop-blur-2xl backdrop-saturate-200">
              <CardHeader
                shadow={false}
                className="mx-6 -mb-3 grid h-12 w-12 place-items-center rounded-lg p-1 text-white shadow-lg"
                color="light-blue"
              >
                {icon}
              </CardHeader>
              <CardBody className="mt-1">
                <Typography variant="h5" className="mb-2 text-[#1A237E]">
                  {title}
                </Typography>
                <Typography className="font-light text-[#787878]/60">
                  {description}
                </Typography>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SectionTwo;
