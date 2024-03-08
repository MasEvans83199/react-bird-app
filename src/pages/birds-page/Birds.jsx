import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../services/supabase.js";
import BirdInformation from "./BirdInformation.jsx";
import BirdImage from "./BirdImage.jsx";
import { DarkThemeToggle, Flowbite } from "flowbite-react";
import {
  Collapse,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Input,
  Select,
  Option,
  Radio,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";

function Birds() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [genus, setGenus] = useState("");
  const [species, setSpecies] = useState("");
  const [appearance, setAppearance] = useState("");
  const [range, setRange] = useState("");
  const [habitat, setHabitat] = useState("");
  const [diet, setDiet] = useState("");
  const [behavior, setBehavior] = useState("");
  const [conservation, setConservation] = useState("");
  const [funFact, setFunFact] = useState("");
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [birdTypes, setBirdTypes] = useState([]);
  const [consStatus, setConsStatus] = useState("");
  const [callUrl, setCallUrl] = useState("");

  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((cur) => !cur);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("username", "avatar_url")
            .eq("id", user.id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setUsername(data.username);
            setAvatarUrl(data.avatar_url);
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchBirdTypes = async (event) => {
      try {
        const { data, error } = await supabase.from("type").select("bird_type");
        if (error) {
          throw error;
        }
        setBirdTypes(data.map((row) => row.bird_type));
      } catch (error) {
        console.log("Error fetching bird types:", error.message);
      }
    };

    fetchBirdTypes();
  }, []);

  const handleUpload = async (event, filePath) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const storagePath = `birds/${fileName}`;

      let { data, error } = await supabase.storage
        .from("bird-bucket")
        .upload(storagePath, file);

      if (error) {
        throw error;
      }

      setPhotoUrl(
        `https://ycfcamxsouvagmrltkbj.supabase.co/storage/v1/object/public/bird-bucket/${storagePath}`
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCallUpload = async (event, filePath) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an mp3 file to upload.");
      }

      const file = event.target.files[0];

      const storagePath = file.name;

      let { data, error } = await supabase.storage
        .from("sound")
        .upload(storagePath, file);

      if (error) {
        throw error;
      }

      setCallUrl(
        `https://ycfcamxsouvagmrltkbj.supabase.co/storage/v1/object/public/${storagePath}`
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const loggedInUserId = user.id;

      const { data: birdTypeData, error: birdTypeError } = await supabase
        .from("type")
        .select("id")
        .eq("bird_type", selectedType)
        .single();

      if (birdTypeError) {
        throw birdTypeError;
      }

      const birdTypeId = birdTypeData.id;

      const { data, error } = await supabase.from("birds").insert({
        name,
        photo: photoUrl,
        genus,
        species,
        appearance,
        range,
        habitat,
        diet,
        behavior,
        conservation,
        funfact: funFact,
        profile_id: loggedInUserId,
        type_id: birdTypeId,
        cons_class: consStatus,
        calls: callUrl,
      });

      if (error) {
        throw error;
      }

      alert("Bird created", data);

      // Reset form fields
      setName("");
      setPhotoUrl("");
      setGenus("");
      setSpecies("");
      setAppearance("");
      setRange("");
      setHabitat("");
      setDiet("");
      setBehavior("");
      setConservation("");
      setFunFact("");
      setSelectedType("");
      setConsStatus("");
      setShowForm(false);
    } catch (error) {
      alert("Error creating bird", error.message);
    }
  };

  const formRef = useRef(null);

  const isMobileOrTablet = window.innerWidth < 1024;

  return (
    <Flowbite>
      <React.Fragment>
        <Card shadow={false} className="bg-transparent">
          <div className="grid place-items-center mb-8">
            <CardHeader
              color="deep-orange"
              className="mt-4 w-2/3 lg:w-1/3 md:w-1/2 "
            >
              <Typography variant="h1" className="mb-4 mt-6">
                Bird Catalog
              </Typography>
            </CardHeader>
          </div>
          <CardBody>
            <div className="grid place-items-end lg:mr-16 ">
              <Button
                className="mt-4 mb-2"
                color="light-blue"
                onClick={toggleOpen}
              >
                Upload Bird
              </Button>
            </div>
            {isMobileOrTablet ? (
              <Dialog
                size="lg"
                className="bg-transparent shadow-none max-h-screen overflow-y-scroll"
                open={open}
              >
                <Card className="mx-auto w-full max-w-[48rem]">
                  <CardHeader
                    variant="gradient"
                    color="light-blue"
                    className="mb-4 grid h-28 place-items-center"
                  >
                    <Typography
                      variant="h3"
                      color="white"
                      className="mt-1 font-normal"
                    >
                      Upload New Bird
                    </Typography>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4 overflow-y-auto h-auto">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-2">
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <BirdImage
                          url={null}
                          onUpload={handleUpload}
                          uploading={uploading}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Genus"
                          value={genus}
                          onChange={(e) => setGenus(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Species"
                          value={species}
                          onChange={(e) => setSpecies(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          type="file"
                          label="Bird Call (mp3)"
                          onChange={(e) => handleCallUpload(e)}
                        />
                        <Select
                          label="Type"
                          value={selectedType}
                          onChange={(value) => setSelectedType(value)}
                          className="max-h-96 overflow-y-auto"
                        >
                          {birdTypes.map((type) => (
                            <Option key={type} value={type}>
                              {type}
                            </Option>
                          ))}
                        </Select>
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Appearance"
                          value={appearance}
                          onChange={(e) => setAppearance(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Range"
                          value={range}
                          onChange={(e) => setRange(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Habitat"
                          value={habitat}
                          onChange={(e) => setHabitat(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Diet"
                          value={diet}
                          onChange={(e) => setDiet(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Behavior"
                          value={behavior}
                          onChange={(e) => setBehavior(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Conservation"
                          value={conservation}
                          onChange={(e) => setConservation(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Fun Fact"
                          value={funFact}
                          onChange={(e) => setFunFact(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Card className="mb-4 mt-2 ml-2 w-full max-w-[24rem]">
                        <List className="flex-row">
                          <ListItem className="p-0">
                            <label
                              htmlFor="horizontal-list-react"
                              className="flex w-full cursor-pointer items-center px-3 py-2"
                            >
                              <ListItemPrefix className="mr-3">
                                <Radio
                                  name="horizontal-list"
                                  id="horizontal-list-extinct"
                                  ripple={true}
                                  color="light-blue"
                                  className="hover:before:opacity-0 border-light-blue-400/50 bg-light-blue-400/25"
                                  containerProps={{
                                    className: "p-0",
                                  }}
                                  onChange={() => setConsStatus("extinct")}
                                />
                              </ListItemPrefix>
                              <Typography
                                color="blue-gray"
                                className="font-medium"
                              >
                                Extinct
                              </Typography>
                            </label>
                          </ListItem>
                          <ListItem className="p-0">
                            <label
                              htmlFor="horizontal-list-vue"
                              className="flex w-full cursor-pointer items-center px-3 py-2"
                            >
                              <ListItemPrefix className="mr-3">
                                <Radio
                                  name="horizontal-list"
                                  id="horizontal-list-endanger"
                                  ripple={true}
                                  color="light-blue"
                                  className="hover:before:opacity-0 border-light-blue-400/50 bg-light-blue-400/25"
                                  containerProps={{
                                    className: "p-0",
                                  }}
                                  onChange={() => setConsStatus("endangered")}
                                />
                              </ListItemPrefix>
                              <Typography
                                color="blue-gray"
                                className="font-medium"
                              >
                                Endangered
                              </Typography>
                            </label>
                          </ListItem>
                        </List>
                      </Card>
                    </div>
                    <Button color="light-blue" size="lg" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </CardBody>
                  <CardFooter className="pt-0">
                    <div className="flex justify-end border-t">
                      <Button
                        className="mt-4 mb-2"
                        color="red"
                        variant="outlined"
                        onClick={toggleOpen}
                      >
                        Close
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </Dialog>
            ) : (
              <Collapse open={open}>
                <Card className="my-4 mx-auto w-1/3 items-center">
                  <CardBody>
                    <Typography color="gray" className="mt-1 font-normal">
                      Fill in the following information about a bird.
                    </Typography>
                    <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 ">
                      <div className="mb-1 grid grid-cols-2 gap-x-52 gap-y-2 mr-52">
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <BirdImage
                          url={null}
                          onUpload={handleUpload}
                          uploading={uploading}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Genus"
                          value={genus}
                          onChange={(e) => setGenus(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          type="file"
                          label="Bird Call (mp3)"
                          onChange={(e) => handleCallUpload(e)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Species"
                          value={species}
                          onChange={(e) => setSpecies(e.target.value)}
                        />
                        <Select
                          label="Type"
                          value={selectedType}
                          onChange={(value) => setSelectedType(value)}
                        >
                          {birdTypes.map((type) => (
                            <Option key={type} value={type}>
                              {type}
                            </Option>
                          ))}
                        </Select>
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Appearance"
                          value={appearance}
                          onChange={(e) => setAppearance(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Range"
                          value={range}
                          onChange={(e) => setRange(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Habitat"
                          value={habitat}
                          onChange={(e) => setHabitat(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Diet"
                          value={diet}
                          onChange={(e) => setDiet(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Behavior"
                          value={behavior}
                          onChange={(e) => setBehavior(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Conservation"
                          value={conservation}
                          onChange={(e) => setConservation(e.target.value)}
                        />
                        <Input
                          size="lg"
                          color="light-blue"
                          label="Fun Fact"
                          value={funFact}
                          onChange={(e) => setFunFact(e.target.value)}
                        />
                      </div>
                      <Card className="mb-4 mt-2 ml-2 w-full max-w-[24rem]">
                        <List className="flex-row">
                          <ListItem className="p-0">
                            <label
                              htmlFor="horizontal-list-react"
                              className="flex w-full cursor-pointer items-center px-3 py-2"
                            >
                              <ListItemPrefix className="mr-3">
                                <Radio
                                  name="horizontal-list"
                                  id="horizontal-list-extinct"
                                  ripple={true}
                                  color="light-blue"
                                  className="hover:before:opacity-0 border-light-blue-400/50 bg-light-blue-400/25"
                                  containerProps={{
                                    className: "p-0",
                                  }}
                                  onChange={() => setConsStatus("extinct")}
                                />
                              </ListItemPrefix>
                              <Typography
                                color="blue-gray"
                                className="font-medium"
                              >
                                Extinct
                              </Typography>
                            </label>
                          </ListItem>
                          <ListItem className="p-0">
                            <label
                              htmlFor="horizontal-list-vue"
                              className="flex w-full cursor-pointer items-center px-3 py-2"
                            >
                              <ListItemPrefix className="mr-3">
                                <Radio
                                  name="horizontal-list"
                                  id="horizontal-list-endanger"
                                  ripple={true}
                                  color="light-blue"
                                  className="hover:before:opacity-0 border-light-blue-400/50 bg-light-blue-400/25"
                                  containerProps={{
                                    className: "p-0",
                                  }}
                                  onChange={() => setConsStatus("endangered")}
                                />
                              </ListItemPrefix>
                              <Typography
                                color="blue-gray"
                                className="font-medium"
                              >
                                Endangered
                              </Typography>
                            </label>
                          </ListItem>
                        </List>
                      </Card>
                      <Button
                        color="light-blue"
                        size="lg"
                        onClick={handleSubmit}
                      >
                        Submit
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </Collapse>
            )}
          </CardBody>
        </Card>
        <BirdInformation supabase={supabase} />
      </React.Fragment>
    </Flowbite>
  );
}

export default Birds;
