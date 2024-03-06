import React, { useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import emailjs from "@emailjs/browser";

function Contact() {
  const [formStatus, setFormStatus] = React.useState("Send");
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_hzyxxbf",
        "template_kdiaaah",
        form.current,
        "71s4hS-0YfXicJ4RC"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <div className="grid place-items-center">
      <Card className="mt-12 w-3/4">
        <div className="grid place-items-center">
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-4 grid h-28 place-items-center w-2/3 lg:w-1/3 md:w-1/2"
          >
            <Typography variant="h2" color="white">
              Contact Us
            </Typography>
          </CardHeader>
        </div>
        <CardBody className="flex flex-col gap-4">
          <form onSubmit={sendEmail} className="w-3/5 mx-auto" ref={form}>
            <div className="mb-4">
              <Input
                className="border-2 border-gray-300 px-3 py-2 w-full rounded-md focus:outline-none focus:border-blue-500"
                type="text"
                label="Your name"
                name="user_name"
                required
              />
            </div>
            <div className="mb-4">
              <Input
                className="border-2 border-gray-300 px-3 py-2 w-full rounded-md focus:outline-none focus:border-blue-500"
                type="email"
                label="Email"
                name="user_email"
                required
              />
            </div>

            <div className="mb-4">
              <Textarea
                className="border-2 border-gray-300 px-3 py-2 w-full rounded-md focus:outline-none focus:border-orange-500"
                variant="static"
                placeholder="Enter your message here..."
                name="message"
                rows={8}
                required
              ></Textarea>
            </div>

            <Button
              color="orange"
              className="text-white px-4 py-2 rounded-md shadow-md"
              type="submit"
              value="Send"
            >
              {formStatus}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Contact;
