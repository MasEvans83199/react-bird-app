import React from "react";
import { Link } from "react-router-dom";
import { 
  Typography, 
  IconButton,
  Card,
  CardBody,
} from "@material-tailwind/react";

const links = [
  { text: "About Us", url: "#/about" },
  { text: "Contact Us", url: "#/contact" },
];

const current_year = new Date().getFullYear();

function Footer() {
  return (
    <Card className="mt-4 shadow-lg border-t">
      <CardBody>
        <footer className="px-8">
          <div className="container mx-auto">
            <div className="mt-8 grid items-center justify-center">
              <ul className="flex flex-wrap justify-center gap-8 items-center">
                {links.map((link, idx) => (
                  <li key={link.text}>
                    <Link key={link.url} to={link.url}>
                    <Typography
                      className={`py-1 font-normal !text-gray-700 transition-colors hover:!text-gray-900 ${
                        idx === links.length - 1 ? "pl-2" : "px-2"
                      }`}
                    >
                      {link.text}
                    </Typography>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="gap-2 lg:flex items-center justify-center">
                <IconButton variant="text" color="gray" size="sm">
                  <i className="fa-brands fa-instagram text-lg" />
                </IconButton>
                <IconButton variant="text" color="gray" size="sm">
                  <i className="fa-brands fa-github text-lg" />
                </IconButton>
              </div>
              <Typography className="text-center font-normal !text-gray-700">
                &copy; {current_year} Beak to Basics™. All Rights Reserved.
              </Typography>
            </div>
          </div>
        </footer>
      </CardBody>
    </Card>
  );
}

export default Footer;
