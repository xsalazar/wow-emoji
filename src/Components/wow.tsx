import {
  CheckCircleTwoTone,
  Clear,
  Close,
  Download,
  Settings,
  Upload,
} from "@mui/icons-material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import diceAnimation from "./dice.gif";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

export default function Wow() {
  const [emojiName, setEmojiName] = useState("wow-emoji");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [hasWowifiedImage, setHasWowifiedImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingColor, setLoadingColor] = useState<{
    color: string;
    r: number;
    g: number;
    b: number;
  }>({ color: "rgb(255,0,0)", r: 255, g: 0, b: 0 });
  const [loadingQuote, setLoadingQuote] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [originalImageFile, setOriginalImageFile] = useState<File>();
  const rgbTimer = useRef(0);
  const quoteTimer = useRef(0);
  const pollTimer = useRef(0);
  const [wowifiedImage, setWowifiedImage] = useState<{
    original: string;
    small: string;
  }>({
    original: "",
    small: "",
  });
  const [wowifySettings, setWowifySettings] = useState<{
    isModalOpen: boolean;
    selectedBackground: string;
    thumbnails: {};
  }>({
    isModalOpen: false,
    selectedBackground: "",
    thumbnails: {},
  });

  // Grab the thumbnails from the backend
  useEffect(() => {
    async function fetch() {
      var response = await axios.get(`https://backend.wowemoji.dev`, {
        params: { thumbnails: true },
        validateStatus: (status: number) => {
          return status === 200 || status === 404;
        },
      });

      setWowifySettings({
        ...wowifySettings,
        thumbnails: response.data.thumbnails,
      });
    }

    fetch();
  }, []);

  // Upload image to website and store information
  const handleImageUpload = async (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    if (event.currentTarget.files === null) {
      return;
    }

    const fileSizeKiloBytes = event.currentTarget.files[0].size / 1000;
    if (fileSizeKiloBytes > 5000) {
      setErrorMessage("🙊 Oh no, your file is larger than 5MB!");
      setHasError(true);
      return;
    }

    setEmojiName(`wow-${event.currentTarget.files[0].name.split(".")[0]}`);
    setHasUploadedImage(true);
    setOriginalImageFile(event.currentTarget.files[0]);
    setOriginalImage(URL.createObjectURL(event.currentTarget.files[0]));
  };

  // Save emoji name
  const handleEmojiNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmojiName(event.currentTarget.value);
  };

  // Upload image to backend for wowification
  const wowifyImage = async () => {
    if (!originalImageFile) {
      return;
    }

    rgbTimer.current = setInterval(() => {
      generateRGBColor();
    }, 25);

    quoteTimer.current = setInterval(() => {
      generateFunnyQuote();
    }, 6000);

    setLoadingQuote("");
    setIsUploading(true);

    try {
      var response = await axios.put(
        `https://backend.wowemoji.dev/`,
        originalImageFile,
        { params: { backgroundId: wowifySettings.selectedBackground } }
      );

      // Use this token to poll the backend API for result
      var token = response.data.token;

      pollTimer.current = setInterval(() => {
        pollWowifiedAPI(token);
      }, 5000);
    } catch (e) {
      // There was an error submitting image to backend, clear timers and reset state
      setErrorMessage(
        "🙈 Uh oh, something went wrong -- sorry! Try again soon"
      );
      setHasWowifiedImage(false);
      setIsUploading(false);
      setHasError(true);

      clearInterval(rgbTimer.current);
      clearInterval(quoteTimer.current);
      clearInterval(pollTimer.current);
    }
  };

  // Save images to local machine
  const saveImages = async () => {
    const a = document.createElement("a");
    a.href = "data:image/webp;base64," + wowifiedImage.small;
    a.download = `${emojiName}.webp`;
    a.click();
  };

  // Handler for closing error toast
  const handleErrorClose = () => {
    setHasError(false);
  };

  // Poll backend API for result
  const pollWowifiedAPI = async (token: string) => {
    try {
      var response = await axios.get(`https://backend.wowemoji.dev`, {
        params: { wowToken: token },
        validateStatus: (status: number) => {
          return status === 200 || status === 404;
        },
      });

      // Image was processed 🎉
      if (response.status === 200) {
        setWowifiedImage({
          original: response.data.wowifiedOriginal,
          small: response.data.wowifiedSmall,
        });
        setHasWowifiedImage(true);
        setIsUploading(false);

        clearInterval(rgbTimer.current);
        clearInterval(quoteTimer.current);
        clearInterval(pollTimer.current);
      }
    } catch (e) {
      setHasError(true);
      setHasWowifiedImage(false);
      setIsUploading(false);

      clearInterval(rgbTimer.current);
      clearInterval(quoteTimer.current);
      clearInterval(pollTimer.current);
    }
  };

  // RGB generator for loading icon
  const generateRGBColor = () => {
    setLoadingColor((prev) => {
      let { r, g, b } = prev;

      if (r === 255 && g !== 255 && b === 0) {
        g += 5;
      }

      if (r !== 0 && g === 255 && b === 0) {
        r -= 5;
      }

      if (r === 0 && g === 255 && b !== 255) {
        b += 5;
      }

      if (r === 0 && g !== 0 && b === 255) {
        g -= 5;
      }

      if (r !== 255 && g === 0 && b === 255) {
        r += 5;
      }

      if (r === 255 && g === 0 && b !== 0) {
        b -= 5;
      }

      return {
        color: `rgb(${r}, ${g}, ${b})`,
        r,
        g,
        b,
      };
    });
  };

  // Quotes displayed during loading screen
  const generateFunnyQuote = () => {
    const randomNumber = Math.floor(Math.random() * 1024);
    const securityCode = Math.floor(Math.random() * 999999);
    const quotes = [
      "Made with 🧡 for Slack",
      "Reticulating splines...",
      "Generating witty dialog...",
      "Swapping time and space...",
      "Spinning violently around the y-axis...",
      "Tokenizing real life...",
      "Bending the spoon...",
      "Filtering morale...",
      "Replacing blown fuse...",
      "Embiggening prototypes...",
      "Checking the gravitational constant in your locale...",
      "Have a nice day",
      "Upgrading Windows, your PC will restart several times...",
      "🎶 Please enjoy the elevator music 🎵",
      "Would you prefer chicken, steak, or tofu?",
      "Testing your patience...",
      "Insert quarter to continue...",
      "Moving satellites into position...",
      "The other loading screen is much faster",
      "Counting backwards from infinity...",
      "Spinning the wheel of fortune...",
      "Computing chance of success...",
      "Finding exact change...",
      "I promise it's almost done",
      "Keeping all the 1's and removing all the 0's...",
      "Convincing AI not to turn evil..",
      "Wait, do you smell something burning?",
      "Turning it on and off again...",
      "Loading funny message...",
      "Waiting for paint to dry...",
      "Proving P=NP...",
      "Laughing at your pictures- I mean, loading...",
      "Converting bug to feature...",
      "Filing JIRA ticket...",
      "Finding cat gifs...",
      "TODO: Insert funny loading message",
      "Mining Bitcoins...",
      "Optimizing the optimizer...",
      "Debugging the debugger...",
      "Updating the updater...",
      "Downloading more RAM...",
      "Updating to Windows Vista...",
      "Agreeing to Terms and Conditions...",
      "Entering Konami code...",
      "Do you like the loading animation? I made it myself",
      "The premium plan is faster",
      `You are number ${randomNumber} in the queue`,
      "TODO: Insert elevator music",
      "Discovering new ways of making you wait...",
      "Hacking the mainframe...",
      "Don't panic...",
      "Do you come here often?",
      "I'm sorry Dave, I can't do that.",
      "Taking a mindfulness minute...",
      "Dusting off the cobwebs...",
      "How did you get here?",
      "Finding problems for your solutions...",
      "Filing taxes...",
      "Well, this is embarrassing.",
      "Walking the dog...",
      "Dividing by zero...",
      "Twiddling thumbs...",
      "Searching for plot device...",
      "Trying to sort in O(n)...",
      "Refilling coffee...",
      "Shovelling coal into the server...",
      "Polishing pixels...",
      "Running with scissors...",
      "Working very hard...",
      "Reversing the shield polarity...",
      "Tending to the garden...",
      "Wowifying the pictures...",
      "Connecting internet tubes...",
      "Building lore...",
      "🌈",
      "🐸",
      "🍄",
      "👻",
      "🙈",
      "🐙",
      "🦪",
      "🌻",
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "🤎",
      "💜",
      "🖤",
      "🤍",
      "🤖",
      "🎷🐛",
      "Adding more loading messages...",
      "Asking ChatGPT for more jokes...",
      "Applying for Chapter 9 Bankruptcy...",
      "Adding more fuel to the wowifier...",
      "Taking a 10-day digital detox in French Polynesia...",
      "(* ^ ω ^)",
      "٩(◕‿◕｡)۶",
      "(≧◡≦)",
      "(◕‿◕)",
      "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
      "(๑˃ᴗ˂)ﻭ",
      "(.❛ ᴗ ❛.)",
      "You look nice today",
      "Asking Bezos for more AWS credits...",
      "Billing your credit card...",
      "Wowifying the wowifier...",
      "Randomizing the randomizer...",
      "Recovering your lost data...",
      `Here's your security code: ${securityCode}`,
      "Retrieving shipping information...",
      `${randomNumber} bits processed`,
      "Reallocating skill points...",
      `Approximately ${randomNumber} hours remaining`,
    ];

    setLoadingQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  // Reset page state to beginning
  const restart = () => {
    setEmojiName("wow-emoji");
    setHasError(false);
    setHasUploadedImage(false);
    setHasWowifiedImage(false);
    setIsUploading(false);
    setLoadingQuote("");
    setOriginalImage("");
    setOriginalImageFile(undefined);
    setWowifiedImage({ original: "", small: "" });
  };

  // Handle settings modal open
  const handleSettingsModalOpen = () => {
    setWowifySettings({ ...wowifySettings, isModalOpen: true });
  };

  const handleSettingsModalClose = () => {
    setWowifySettings({ ...wowifySettings, isModalOpen: false });
  };

  const handleSettingsModalSetBackground = (key: string) => {
    setWowifySettings({ ...wowifySettings, selectedBackground: key });
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        flexDirection: "column",
        flexGrow: "1",
      }}
    >
      {/* Upload / Display */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pb: 2,
          position: "relative",
        }}
      >
        {/* Display upload form if nothing has been uploaded */}
        {!hasUploadedImage ? (
          <label htmlFor="contained-button-file">
            <input
              hidden
              accept="image/*"
              id="contained-button-file"
              type="file"
              onChange={handleImageUpload}
            />
            <Button
              variant="contained"
              component="span"
              loading={isUploading}
              startIcon={<Upload />}
              loadingPosition="start"
            >
              Upload Image
            </Button>
          </label>
        ) : null}

        {/* Display uploaded image if there's no wowified image */}
        {hasUploadedImage && !hasWowifiedImage ? (
          <Box sx={{ position: "relative" }}>
            {/* Uploaded image */}
            <img
              src={originalImage}
              alt="uploaded"
              style={{ objectFit: "cover" }}
              width={250}
              height={250}
            />

            {/* Overlay restart button */}
            <IconButton
              sx={{ position: "absolute", right: "0px" }}
              onClick={restart}
            >
              <Close />
            </IconButton>
          </Box>
        ) : null}

        {/* Display wowified image */}
        {hasWowifiedImage ? (
          <img
            src={`data:image/gif;base64,${wowifiedImage.original}`}
            alt="wowified"
            width={250}
            height={250}
          />
        ) : null}

        {/* Loading Overlay */}
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: "flex",
            flexDirection: "column",
          }}
          open={isUploading}
        ></Backdrop>

        {/* Loading Indicator */}
        {isUploading ? (
          <Container
            sx={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "absolute",
              textAlign: "center",
              zIndex: (theme) => theme.zIndex.drawer + 2,
            }}
          >
            <CircularProgress sx={{ color: loadingColor }} />
            <Typography sx={{ pt: 2 }} variant="caption" color="white">
              {loadingQuote ?? " "}
            </Typography>
          </Container>
        ) : null}
      </Box>

      {/* Error Toast */}
      <Snackbar
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleErrorClose}
          >
            <Clear fontSize="small" />
          </IconButton>
        }
        open={hasError}
        onClose={handleErrorClose}
        autoHideDuration={4000}
        message={errorMessage}
      />

      {/* Settings Modal */}
      <Modal
        open={wowifySettings.isModalOpen}
        onClose={handleSettingsModalClose}
      >
        <Box sx={modalStyle}>
          <Grid container>
            {/* Header: Title and Close Icon */}
            <Grid container size={12} sx={{ pb: 1 }}>
              {/* Title */}
              <Grid size={10} sx={{ pl: 1 }} alignSelf="center">
                <Typography>Select background</Typography>
              </Grid>
              {/* Close Icon */}
              <Grid
                container
                size={2}
                justifyContent="flex-end"
                alignSelf="center"
              >
                <IconButton onClick={handleSettingsModalClose}>
                  <Close />
                </IconButton>
              </Grid>
            </Grid>

            {/* Image List */}
            <Grid container size={12}>
              <ImageList
                cols={3}
                rowHeight={96}
                sx={{ height: 328, width: "100%" }}
              >
                {/* Random Option (default) */}
                <ImageListItem
                  sx={{
                    position: "relative",
                    "&:hover": {
                      bgcolor: "white",
                      opacity: 0.5,
                    },
                  }}
                >
                  <img
                    src={diceAnimation}
                    alt="🎲"
                    style={{
                      width: "100%",
                      position: "absolute",
                      opacity:
                        wowifySettings.selectedBackground === "" ? 0.6 : 1,
                    }}
                    onClick={() => {
                      handleSettingsModalSetBackground("");
                    }}
                  />
                  {wowifySettings.selectedBackground === "" ? (
                    <CheckCircleTwoTone sx={{ position: "absolute" }} />
                  ) : null}
                </ImageListItem>

                {/* Available GIFs on the backend */}
                {Object.entries(wowifySettings.thumbnails).map(
                  ([key, value]) => {
                    return (
                      <ImageListItem
                        sx={{
                          position: "relative",
                          "&:hover": {
                            bgcolor: "gray",
                            opacity: 0.5,
                          },
                        }}
                      >
                        <img
                          src={`data:image/png;base64,${value}`}
                          alt="thumbnail"
                          style={{
                            height: "100%",
                            position: "absolute",
                            opacity:
                              wowifySettings.selectedBackground === key
                                ? 0.6
                                : 1,
                          }}
                          onClick={() => {
                            handleSettingsModalSetBackground(key);
                          }}
                        />
                        {wowifySettings.selectedBackground === key ? (
                          <CheckCircleTwoTone sx={{ position: "absolute" }} />
                        ) : null}
                      </ImageListItem>
                    );
                  }
                )}
              </ImageList>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Wowify Button */}
      {/* Only show if image has been uploaded but not wowified */}
      {hasUploadedImage && !hasWowifiedImage ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
          <Button
            color="primary"
            onClick={wowifyImage}
            variant="contained"
            startIcon={"🌈"}
          >
            Wowify Image
          </Button>
          <IconButton
            sx={{ ml: 1 }}
            onClick={handleSettingsModalOpen}
            color={
              wowifySettings.selectedBackground === "" ? "default" : "secondary"
            }
          >
            <Settings />
          </IconButton>
        </Box>
      ) : null}

      {/* Emoji Name and Download */}
      {/* Only show if image has been wowified */}
      {hasWowifiedImage ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            pt: 2,
          }}
        >
          {/* Emoji Name */}
          <TextField
            id="standard-basic"
            label=":emoji-name:"
            variant="outlined"
            size="small"
            value={emojiName}
            onChange={handleEmojiNameChange}
          />

          <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
            {/* Download Button */}
            <Button
              color="primary"
              variant="contained"
              onClick={saveImages}
              startIcon={<Download aria-label="download" />}
            >
              Download
            </Button>

            {/* Reset Button */}
            <Button
              color="error"
              variant="contained"
              onClick={restart}
              startIcon={<Clear aria-label="restart" />}
            >
              Restart
            </Button>
          </Stack>

          {/* Only show Rewowify if you selected the random background option */}
          {wowifySettings.selectedBackground === "" ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ pt: 2 }}
            >
              <Button
                color="secondary"
                onClick={wowifyImage}
                variant="contained"
                startIcon={"🎲"}
              >
                Rewowify Image
              </Button>
            </Stack>
          ) : null}
        </Box>
      ) : null}
    </Container>
  );
}
