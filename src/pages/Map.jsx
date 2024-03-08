import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { supabase } from "../services/supabase.js";
import {
  Typography,
  Card,
  CardHeader,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";

function Globe() {
  const canvasRef = useRef();
  const [birdList, setBirdList] = useState([]);
  const [selectedBirdId, setSelectedBirdId] = useState(null);

  useEffect(() => {
    let phi = 0;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 100000,
      mapBrightness: 1.2,
      baseColor: [0.7, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      opacity: 1,
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        // Add more markers as needed
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
      onClick: (event) => {
        // Handle click on the globe
        const { lng, lat } = event;
        const region = getRegionFromCoordinates(lng, lat); // Implement this function to determine the region from coordinates
        const birdsInRegion = getBirdsInRegion(region);
        if (birdsInRegion.length > 0) {
          const selectedBirdId = birdsInRegion[0].id; // Choose the first bird for simplicity
          setSelectedBirdId(selectedBirdId);
        }
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchBirdList = async () => {
      try {
        const { data: birdsData, error: birdsError } = await supabase.from(
          "birds"
        ).select(`
            *,
            type_id (
              bird_type
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
  }, []);

  const toggleOpen = (birdId) => {
    setSelectedBirdId(selectedBirdId === birdId ? null : birdId);
  };

  const getBirdsInRegion = (region) => {
    return birdList.filter((bird) => bird.region === region);
  };

  const getRegionFromCoordinates = (lng, lat) => {
    // Implement this function to determine the region from coordinates
    // Your implementation should map the longitude and latitude to one of the regions defined in the birds table.
    // Return the matching region name.
  };

  return (
    <div className="App">
      <Typography variant="h1" color="blue-gray">
        Birds of the World
      </Typography>
      <Card className="mt-10">
        <CardHeader>
          <Typography variant="h4">
            Click and drag the globe to look at different birds in different
            regions of the Earth.
          </Typography>
        </CardHeader>
        <canvas
          ref={canvasRef}
          style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
        />
      </Card>

      {/* Render the Popout for each region */}
      {birdList.length > 0 &&
        birdList.map((bird) => (
          <Dialog
            key={bird.id}
            className="overflow-y-auto"
            open={selectedBirdId === bird.id}
            handler={() => toggleOpen(bird.id)}
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0.9, y: -100 },
            }}
          >
            <DialogHeader>{bird.name}</DialogHeader>
            <DialogBody divider>
              {/* Bird information */}
              <React.Fragment>
                <Typography variant="h4">Appearance:</Typography>
                <Typography>{bird.appearance}</Typography>
                <Typography variant="h4">Range:</Typography>
                <Typography>{bird.range}</Typography>
                <Typography variant="h4">Habitat:</Typography>
                <Typography>{bird.habitat}</Typography>
                <Typography variant="h4">Behavior:</Typography>
                <Typography>{bird.behavior}</Typography>
                <Typography variant="h4">Conservation:</Typography>
                <Typography>{bird.conservation}</Typography>
                <Typography variant="h5">Fun Fact:</Typography>
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
        ))}
    </div>
  );
}

export default Globe;
