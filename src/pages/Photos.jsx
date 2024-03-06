import React, { useState, useEffect, useRef } from "react";
import "../styles/Photos.css";
import {
  Typography,
  Carousel as TailwindCarousel,
  IconButton,
  ButtonGroup,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { supabase } from "../services/supabase";
import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";

const responsive = {
  0: { items: 1 },
  568: { items: 2 },
  1024: { items: 3 },
};

const createItems = (length, [handleClick]) => {
  let deltaX = 0;
  let difference = 0;
  const swipeDelta = 20;

  return Array.from({ length }).map((item, i) => (
    <div
      data-value={i + 1}
      className="item"
      onMouseDown={(e) => (deltaX = e.pageX)}
      onMouseUp={(e) => (difference = Math.abs(e.pageX - deltaX))}
      onClick={() => difference < swipeDelta && handleClick(i)}
    >
      <span className="item-inner" />
    </div>
  ));
};

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 40;
  const totalPages = Math.ceil(photos.length / imagesPerPage);

  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = Math.min(startIndex + imagesPerPage, photos.length);

  const displayedPhotos = photos.slice(startIndex, endIndex);

  //const [items] = useState(createItems(photos.length, [setActivePhoto]));

  const slidePrev = () => setActivePhoto(activePhoto - 1);
  const slideNext = () => setActivePhoto(activePhoto + 1);
  const syncActivePhoto = ({ item }) => setActivePhoto(item);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const prev = () => {
    goToPage(currentPage - 1);
  };

  const next = () => {
    goToPage(currentPage + 1);
  };

  const getPaginationItemProps = (pageNumber) => ({
    className: currentPage === pageNumber ? "bg-blue-400 text-white" : "",
    onClick: () => setCurrentPage(pageNumber),
  });

  useEffect(() => {
    const getPhotos = async () => {
      try {
        const { data: imgData, error: imgError } = await supabase
          .from("gallery_img")
          .select(`*`);
        if (imgError) {
          throw imgError;
        }

        const shuffledPhotos = imgData.sort(() => Math.random() - 0.5);

        console.log(shuffledPhotos);
        setPhotos(shuffledPhotos);
      } catch (error) {
        console.log("Error fetching photos:", error.message);
      }
    };
    getPhotos();
    supabase
      .channel("changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "storage",
          table: "objects",
          filter: "bucket_id=eq.gallery",
        },
        (payload) => {
          getPhotos();
        }
      )
      .subscribe();
  }, []);

  const carousel = useRef(null);
  const items = photos.map((image) => (
    <div
      className="relative flex items-center justify-center w-full h-auto"
      key={image.id}
    >
      <img
        src={image.url}
        alt={image.name}
        className={` max-w-screen h-full rounded-lg`}
        style={{ maxHeight: 638, minHeight: 638 }}
      />
    </div>
  ));

  const isTablet = window.innerWidth < 1024 && window.innerWidth > 638;
  const isMobile = window.innerWidth <= 638;

  return [
    <>
      <Card className="mt-4 bg-transparent">
        <div className="grid place-items-center mb-8">
          <CardHeader
            color="deep-orange"
            className="mt-4 w-1/2 lg:w-1/3 md:w-1/2"
          >
            <Typography className="mb-4 pt-4" variant="h1">
              Gallery
            </Typography>
          </CardHeader>
        </div>
        <div className="grid place-items-center">
          <div className="border-b border-slate-800 mb-8 w-5/6"></div>
        </div>
        <div className="border-b-2 border-gray-300 pb-4">
          <AliceCarousel
            key="carousel"
            mouseTracking
            disableDotsControls
            disableButtonsControls
            items={items}
            ref={carousel}
            className=""
          />
          <nav key="nav" className="b-refs-navs">
            {items.map((item, i) => (
              <span key={i} onClick={() => carousel?.current?.slideTo(i)} />
            ))}
          </nav>
          <div className="flex justify-center items-center mt-6 mb-8">
            <ButtonGroup key="btns" className="gap-1" color="light-blue">
              <Button onClick={(e) => carousel?.current?.slidePrev(e)}>
                Prev
              </Button>
              <Button onClick={(e) => carousel?.current?.slideNext(e)}>
                Next
              </Button>
            </ButtonGroup>
          </div>
          <div className="grid place-items-center">
            <div className="border-b border-slate-800 mb-8 w-5/6"></div>
          </div>
          <div>
            <Box sx={{ width: 1, height: 1 }}>
              {isMobile ? (
                <ImageList variant="masonry" cols={2} gap={8}>
                  {displayedPhotos.map((image) => (
                    <ImageListItem key={image.url}>
                      <img
                        src={`${image.url}?w=248&fit=crop&auto=format`}
                        srcSet={`${image.url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                        alt={image.img_name}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : isTablet ? (
                <ImageList variant="masonry" cols={3} gap={8}>
                  {displayedPhotos.map((image) => (
                    <ImageListItem key={image.url}>
                      <img
                        src={`${image.url}?w=248&fit=crop&auto=format`}
                        srcSet={`${image.url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                        alt={image.img_name}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <ImageList variant="masonry" cols={4} gap={8}>
                  {displayedPhotos.map((image) => (
                    <ImageListItem key={image.url}>
                      <img
                        src={`${image.url}?w=248&fit=crop&auto=format`}
                        srcSet={`${image.url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                        alt={image.img_name}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Box>
            <CardFooter divider className="mt-4">
              <div className="flex items-center justify-center">
                <ButtonGroup
                  variant="outlined"
                  color="light-blue"
                  className="mt-8"
                >
                  <IconButton onClick={prev}>
                    <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
                  </IconButton>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <IconButton
                      key={i}
                      {...getPaginationItemProps(i + 1)}
                      onClick={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </IconButton>
                  ))}
                  <IconButton onClick={next}>
                    <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                  </IconButton>
                </ButtonGroup>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </>,
  ];
};

export default Photos;
