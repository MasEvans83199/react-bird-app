import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../services/supabase.js";
import { useNavigate } from "react-router-dom";
import { Howl } from "howler";
import { DarkThemeToggle, Flowbite } from "flowbite-react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayCircleIcon,
  StopCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  IconButton,
  ButtonGroup,
} from "@material-tailwind/react";

const TABLE_HEAD = [
  "Bird",
  "Call/Song",
  "Type",
  "Uploaded By",
  "Date Uploaded",
  " ",
];

function BirdInformation() {
  const [birdList, setBirdList] = useState([]);
  const [selectedBirdId, setSelectedBirdId] = useState(null);
  const [sortingCriteria, setSortingCriteria] = useState(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [sound, setSound] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const [active, setActive] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const birdsPerPage = 10;
  const navigate = useNavigate();

  const TABS = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Endangered",
      value: "endangered",
    },
    {
      label: "Extinct",
      value: "extinct",
    },
  ];

  const getItemProps = (index) => ({
    className:
      active === index ? "bg-light-blue-200 border-sm text-blue-gray-900" : "",
    onClick: () => setActive(index),
  });

  const toggleOpen = (birdId) =>
    setSelectedBirdId((prev) => (prev === birdId ? null : birdId));

  useEffect(() => {
    const fetchBirdList = async () => {
      try {
        const { data: birdsData, error: birdsError } = await supabase.from(
          "birds"
        ).select(`
        *,
        type_id (
          bird_type
        ),
        profile_id (
          avatar_url,
          username  
        )
      `);

        if (birdsError) {
          throw birdsError;
        }

        setBirdList(birdsData);
      } catch (error) {
        console.log("Error fetching bird data:", error.message);
      }
    };

    fetchBirdList();
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "birds",
        },
        (payload) => {
          fetchBirdList();
        }
      )
      .subscribe();
  }, []);

  const birdTypeColors = {
    Songbird: "deep-orange",
    "Bird of Prey": "indigo",
    Waterfowl: "light-blue",
    Flightless: "amber",
    Wading: "light-green",
    Owl: "brown",
    Seabird: "blue",
    "Pigeon/Dove": "purple",
    Hummingbird: "green",
    Woodpecker: "red",
    Kingfisher: "pink",
  };

  const playAudio = (birdId, audioURL) => {
    if (!sound[birdId]) {
      const newSound = new Howl({
        src: [audioURL],
        onplay: () =>
          setIsPlaying((prevIsPlaying) => ({
            ...prevIsPlaying,
            [birdId]: true,
          })),
        onstop: () =>
          setIsPlaying((prevIsPlaying) => ({
            ...prevIsPlaying,
            [birdId]: false,
          })),
        onend: () =>
          setIsPlaying((prevIsPlaying) => ({
            ...prevIsPlaying,
            [birdId]: false,
          })),
      });
      setSound((prevSound) => ({
        ...prevSound,
        [birdId]: newSound,
      }));
    }

    if (isPlaying[birdId]) {
      sound[birdId].stop();
    } else {
      sound[birdId].play();
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

  const handleSort = (criteria) => {
    if (criteria === sortingCriteria) {
      setSortAscending((prev) => !prev); // Reverse the order if the same criteria is clicked again
    } else {
      setSortingCriteria(criteria);
      setSortAscending(true);
    }
  };

  const sortBirdList = (list) => {
    if (!sortingCriteria) return list; // Return the original list if no sorting criteria is selected

    return list.slice().sort((a, b) => {
      // Use the sorting criteria to compare elements a and b
      if (sortingCriteria === "Bird") {
        return sortAscending
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortingCriteria === "Type") {
        return sortAscending
          ? a.type_id.bird_type.localeCompare(b.type_id.bird_type)
          : b.type_id.bird_type.localeCompare(a.type_id.bird_type);
      } else if (sortingCriteria === "Uploaded By") {
        return sortAscending
          ? a.profile_id.username.localeCompare(b.profile_id.username)
          : b.profile_id.username.localeCompare(a.profile_id.username);
      } else if (sortingCriteria === "Date Uploaded") {
        const dateA = new Date(a.uploaded);
        const dateB = new Date(b.uploaded);
        return sortAscending ? dateA - dateB : dateB - dateA;
      } else {
        return 0;
      }
    });
  };

  const filterBirdList = (list) => {
    if (active === 0) return list; // "All" TAB, return the original list

    return list.filter((bird) => {
      if (active === 1) {
        // "Endangered" TAB, filter birds with "endangered" in cons_class
        return bird.cons_class === "endangered";
      } else if (active === 2) {
        // "Extinct" TAB, filter birds with "extinct" in cons_class
        return bird.cons_class === "extinct";
      }
    });
  };

  const sortedAndFilteredBirdList = sortBirdList(filterBirdList(birdList));

  const totalBirds = sortedAndFilteredBirdList.length;
  const totalPages = Math.ceil(totalBirds / birdsPerPage);

  const next = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prev = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const indexOfLastBird = currentPage * birdsPerPage;
  const indexOfFirstBird = indexOfLastBird - birdsPerPage;
  const currentBirds = sortedAndFilteredBirdList.slice(
    indexOfFirstBird,
    indexOfLastBird
  );

  const handleTabChange = (value) => {
    setActive(value);
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginationItemProps = (index) => ({
    className: currentPage === index ? "bg-light-blue-400 text-white" : "",
    onClick: () => setCurrentPage(index),
  });

  const searchFilteredBirdList = sortedAndFilteredBirdList.filter((bird) => {
    const birdNameLower = bird.name.toLowerCase();
    const birdTypeLower = bird.type_id.bird_type.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    return (
      birdNameLower.includes(searchTermLower) ||
      birdTypeLower.includes(searchTermLower)
    );
  });

  const isMobile = window.innerWidth <= 638;
  const isTablet = window.innerWidth < 1024 && window.innerWidth > 638;
  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <Flowbite>
      <Card className="h-full w-full bg-transparent">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none bg-transparent"
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value={TABS[active].value} className="w-full md:w-max">
              <TabsHeader>
                {TABS.map(({ label, value }, index) => (
                  <Tab
                    key={value}
                    value={value}
                    {...getItemProps(index)}
                    onClick={() => handleTabChange(index)}
                  >
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="w-full md:w-72 mb-2">
              <Input
                label="Search"
                icon={
                  <MagnifyingGlassIcon className="h-5 w-5" color="light-blue" />
                }
                color="light-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0">
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th
                    key={head}
                    className={`cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50 sm:text-sm ${
                      (index !== 0 && index !== 1 && index !== 5 && isTablet) ||
                      (index !== 0 && index !== 5 && isMobile)
                        ? "hidden"
                        : ""
                    }`}
                    onClick={() => handleSort(head)}
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                    >
                      {head}{" "}
                      {index !== TABLE_HEAD.length - 1 && (
                        <ChevronUpDownIcon
                          strokeWidth={2}
                          className={`h-4 w-4 ${
                            sortingCriteria === head
                              ? sortAscending
                                ? "transform rotate-180"
                                : ""
                              : ""
                          }`}
                        />
                      )}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentBirds
                .filter((bird) => {
                  // Apply search filtering on 'currentBirds'
                  const birdNameLower = bird.name.toLowerCase();
                  const birdTypeLower = bird.type_id.bird_type.toLowerCase();
                  const searchTermLower = searchTerm.toLowerCase();
                  return (
                    birdNameLower.includes(searchTermLower) ||
                    birdTypeLower.includes(searchTermLower)
                  );
                })
                .map((bird, index) => {
                  const isLast = index === birdList.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  const chipColor =
                    birdTypeColors[bird.type_id.bird_type] || "gray";

                  return (
                    <tr key={bird.id}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={bird.photo}
                            size="xxl"
                            variant="rounded"
                            className="h-auto hover:z-50"
                          />
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {bird.name}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {bird.genus} {bird.species}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={`${isMobile ? "hidden" : ""} ${classes}`}>
                        {bird.calls ? (
                          <Button
                            size="sm"
                            className="rounded-full"
                            color="light-blue"
                            onClick={() => playAudio(bird.id, bird.calls)}
                          >
                            {isPlaying[bird.id] ? (
                              <StopCircleIcon
                                className="h-5 w-5"
                                color="white"
                              />
                            ) : (
                              <PlayCircleIcon
                                className="h-5 w-5"
                                color="white"
                              />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="rounded-full"
                            color="gray"
                          >
                            <NoSymbolIcon className="h-5 w-5" color="white" />
                          </Button>
                        )}
                      </td>
                      {isTablet ? (
                        <div className="text-center leading-[100px]">
                          <Button
                            size="md"
                            className="rounded-full"
                            onClick={() => toggleOpen(bird.id)}
                            variant="gradient"
                            color="light-blue"
                          >
                            Show All
                          </Button>
                          <Dialog
                            className="overflow-y-auto h-5/6"
                            open={selectedBirdId === bird.id} // Compare with the selectedBirdId
                            handler={() => toggleOpen(bird.id)}
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0.9, y: -100 },
                            }}
                          >
                            <DialogHeader className="flex justify-center items-center">
                              <Typography variant="h3" color="blue-gray">
                                {bird.name}
                              </Typography>
                            </DialogHeader>
                            <DialogBody divider>
                              <img
                                src={bird.photo}
                                size="xxl"
                                className="h-auto object-cover object-center rounded-lg mb-2"
                              />
                            </DialogBody>
                            <DialogBody divider>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                  <Typography variant="h4">
                                    Appearance:
                                  </Typography>
                                  <Typography variant="paragraph">
                                    {bird.appearance}
                                  </Typography>
                                  <Typography variant="h4">Range:</Typography>
                                  <Typography>{bird.range}</Typography>
                                  <Typography variant="h4">Habitat:</Typography>
                                  <Typography>{bird.habitat}</Typography>
                                </div>
                                <div className="col-span-2 space-y-2">
                                  <Typography variant="h4">
                                    Behavior:
                                  </Typography>
                                  <Typography>{bird.behavior}</Typography>
                                  <Typography variant="h4">
                                    Conservation:
                                  </Typography>
                                  <Typography>{bird.conservation}</Typography>
                                  <Typography variant="h5">
                                    Fun Fact:
                                  </Typography>
                                  <Typography>{bird.funfact}</Typography>
                                </div>
                              </div>
                            </DialogBody>
                            <DialogBody className="flex justify-left text-left -mt-2 -mb-8">
                              <Typography variant="small" color="gray">
                                Uploaded by {bird.profile_id.username} at{" "}
                                {formatDateTime(bird.uploaded)}
                              </Typography>
                            </DialogBody>
                            <DialogFooter>
                              <Button
                                variant="outlined"
                                color="red"
                                onClick={() => toggleOpen(bird.id)}
                                className="mr-1"
                              >
                                <span>Close</span>
                              </Button>
                            </DialogFooter>
                          </Dialog>
                        </div>
                      ) : isMobile ? (
                        <div className="text-center leading-[100px]">
                          <Button
                            size="md"
                            className="rounded-full"
                            onClick={() => toggleOpen(bird.id)}
                            variant="gradient"
                            color="light-blue"
                          >
                            Show All
                          </Button>
                          <Dialog
                            className="overflow-y-auto h-5/6"
                            open={selectedBirdId === bird.id} // Compare with the selectedBirdId
                            handler={() => toggleOpen(bird.id)}
                            animate={{
                              mount: { scale: 1, y: 0 },
                              unmount: { scale: 0.9, y: -100 },
                            }}
                          >
                            <DialogHeader className="flex justify-center items-center">
                              <Typography
                                variant="h3"
                                color="blue-gray"
                                className="mr-4"
                              >
                                {bird.name}
                              </Typography>
                              {bird.calls ? (
                                <Button
                                  size="sm"
                                  className="rounded-full ml-4"
                                  color="light-blue"
                                  onClick={() => playAudio(bird.id, bird.calls)}
                                >
                                  {isPlaying[bird.id] ? (
                                    <StopCircleIcon
                                      className="h-5 w-5"
                                      color="white"
                                    />
                                  ) : (
                                    <PlayCircleIcon
                                      className="h-5 w-5"
                                      color="white"
                                    />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="rounded-full"
                                  color="gray"
                                >
                                  <NoSymbolIcon
                                    className="h-5 w-5"
                                    color="white"
                                  />
                                </Button>
                              )}
                            </DialogHeader>
                            <DialogBody divider>
                              <img
                                src={bird.photo}
                                size="xxl"
                                className="h-auto object-cover object-center rounded-lg mb-2"
                              />
                            </DialogBody>
                            <DialogBody divider>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                  <Typography variant="h4">
                                    Appearance:
                                  </Typography>
                                  <Typography variant="paragraph">
                                    {bird.appearance}
                                  </Typography>
                                  <Typography variant="h4">Range:</Typography>
                                  <Typography>{bird.range}</Typography>
                                  <Typography variant="h4">Habitat:</Typography>
                                  <Typography>{bird.habitat}</Typography>
                                </div>
                                <div className="col-span-2 space-y-2">
                                  <Typography variant="h4">
                                    Behavior:
                                  </Typography>
                                  <Typography>{bird.behavior}</Typography>
                                  <Typography variant="h4">
                                    Conservation:
                                  </Typography>
                                  <Typography>{bird.conservation}</Typography>
                                  <Typography variant="h5">
                                    Fun Fact:
                                  </Typography>
                                  <Typography>{bird.funfact}</Typography>
                                </div>
                              </div>
                            </DialogBody>
                            <DialogBody className="flex justify-left text-left -mt-2 -mb-8">
                              <Typography variant="small" color="gray">
                                Uploaded by {bird.profile_id.username} at{" "}
                                {formatDateTime(bird.uploaded)}
                              </Typography>
                            </DialogBody>
                            <DialogFooter>
                              <Button
                                variant="outlined"
                                color="red"
                                onClick={() => toggleOpen(bird.id)}
                                className="mr-1"
                              >
                                <span>Close</span>
                              </Button>
                            </DialogFooter>
                          </Dialog>
                        </div>
                      ) : (
                        <>
                          <td className={classes}>
                            <div
                              className={`flex flex-col place-items-left w-24 ${
                                isTablet ? "hidden sm:flex" : ""
                              }`}
                            >
                              <Chip
                                variant="gradient"
                                value={
                                  <Typography
                                    variant="small"
                                    color="white"
                                    className="font-medium capitalize leading-none text-center"
                                  >
                                    {bird.type_id.bird_type}
                                  </Typography>
                                }
                                color={chipColor}
                              />
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              className={`w-max ${
                                isTablet ? "hidden sm:flex" : ""
                              }`}
                            >
                              <Chip
                                icon={
                                  <Avatar
                                    size="xs"
                                    variant="circular"
                                    className="w-full h-full -translate-x-0.5"
                                    alt={`${bird.profile_id.username}'s avatar`}
                                    src={bird.profile_id.avatar_url}
                                  />
                                }
                                value={
                                  <Typography
                                    variant="small"
                                    color="white"
                                    className="font-medium capitalize leading-none"
                                  >
                                    {bird.profile_id.username}
                                  </Typography>
                                }
                                color="blue-gray"
                                className="rounded-full py-1.5"
                              />
                            </div>
                          </td>
                          <td className={classes}>
                            <div
                              className={`w-max ${
                                isTablet ? "hidden sm:flex" : ""
                              }`}
                            >
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {formatDateTime(bird.uploaded)}
                              </Typography>
                            </div>
                          </td>
                          <td className={classes}>
                            <React.Fragment>
                              <Button
                                onClick={() => toggleOpen(bird.id)}
                                variant="gradient"
                              >
                                Read more
                              </Button>
                              <Dialog
                                className="overflow-y-auto h-fit"
                                open={selectedBirdId === bird.id} // Compare with the selectedBirdId
                                handler={() => toggleOpen(bird.id)}
                                animate={{
                                  mount: { scale: 1, y: 0 },
                                  unmount: { scale: 0.9, y: -100 },
                                }}
                              >
                                <DialogHeader>{bird.name}</DialogHeader>
                                <DialogBody divider>
                                  <React.Fragment>
                                    <Typography variant="h4">
                                      Appearance:
                                    </Typography>
                                    <Typography>{bird.appearance}</Typography>
                                    <Typography variant="h4">Range:</Typography>
                                    <Typography>{bird.range}</Typography>
                                    <Typography variant="h4">
                                      Habitat:
                                    </Typography>
                                    <Typography>{bird.habitat}</Typography>
                                    <Typography variant="h4">
                                      Behavior:
                                    </Typography>
                                    <Typography>{bird.behavior}</Typography>
                                    <Typography variant="h4">
                                      Conservation:
                                    </Typography>
                                    <Typography>{bird.conservation}</Typography>
                                    <Typography variant="h5">
                                      Fun Fact:
                                    </Typography>
                                    <Typography>{bird.funfact}</Typography>
                                  </React.Fragment>
                                </DialogBody>
                                <DialogFooter>
                                  <Button
                                    variant="gradient"
                                    color="blue"
                                    onClick={() => toggleOpen(bird.id)}
                                    className="mr-1"
                                  >
                                    <span>Close</span>
                                  </Button>
                                </DialogFooter>
                              </Dialog>
                            </React.Fragment>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </CardBody>
        <CardFooter>
          <ButtonGroup variant="outlined" color="blue-gray">
            <IconButton onClick={prev}>
              <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
            </IconButton>
            {Array.from({ length: totalPages }, (_, i) => (
              <IconButton
                key={i}
                {...getPaginationItemProps(i + 1)}
                onClick={() => handlePaginationChange(i + 1)}
              >
                {i + 1}
              </IconButton>
            ))}
            <IconButton onClick={next}>
              <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
            </IconButton>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </Flowbite>
  );
}

export default BirdInformation;
