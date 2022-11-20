import { Close, Download, Replay, Upload } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import axios from "axios";

interface WowProps {}
interface WowState {
  emojiName: string;
  hasError: boolean;
  hasUploadedImage: boolean;
  hasWowifiedImage: boolean;
  isUploading: boolean;
  loadingColor: { color: string; r: number; g: number; b: number };
  loadingQuote: string;
  originalImage: string;
  originalImageFile?: File;
  wowifiedImage: {
    original: string;
    small: string;
  };
}

export default class Wow extends React.Component<WowProps, WowState> {
  constructor(props: WowProps) {
    super(props);

    this.state = {
      emojiName: "wow-emoji",
      hasError: false,
      hasUploadedImage: false,
      hasWowifiedImage: false,
      isUploading: false,
      loadingColor: { color: "rgb(255,0,0)", r: 255, g: 0, b: 0 },
      loadingQuote: "",
      originalImage: "",
      wowifiedImage: {
        original: "",
        small: "",
      },
    };

    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleEmojiNameChange = this.handleEmojiNameChange.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
    this.wowifyImage = this.wowifyImage.bind(this);
    this.saveImages = this.saveImages.bind(this);
    this.generateRGBColor = this.generateRGBColor.bind(this);
    this.generateFunnyQuote = this.generateFunnyQuote.bind(this);
    this.restart = this.restart.bind(this);
  }

  render() {
    const {
      emojiName,
      hasError,
      hasUploadedImage,
      hasWowifiedImage,
      isUploading,
      loadingColor,
      loadingQuote,
      originalImage,
      wowifiedImage,
    } = this.state;

    return (
      <div style={{ height: "calc(100vh - 200px)" }}>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            flexDirection: "column",
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
                  onChange={this.handleImageUpload}
                />
                <LoadingButton
                  variant="contained"
                  component="span"
                  loading={isUploading}
                  startIcon={<Upload />}
                  loadingPosition="start"
                >
                  Upload Image
                </LoadingButton>
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
                  onClick={this.restart}
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
                onClick={this.handleErrorClose}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            open={hasError}
            onClose={this.handleErrorClose}
            autoHideDuration={4000}
            message="🙈 Uh oh, something went wrong -- sorry! Try again soon"
          />

          {/* Wowify Button */}
          {/* Only show if image has been uploaded but not wowified */}
          {hasUploadedImage && !hasWowifiedImage ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
              <Button
                color="primary"
                onClick={this.wowifyImage}
                variant="contained"
                startIcon={"🌈"}
              >
                Wowify Image
              </Button>
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
                onChange={this.handleEmojiNameChange}
              />

              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                {/* Download Button */}
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.saveImages}
                  startIcon={<Download aria-label="download" />}
                >
                  Download
                </Button>
                {/* Reset Button */}
                <Button
                  color="error"
                  variant="contained"
                  onClick={this.restart}
                  startIcon={<Replay aria-label="restart" />}
                >
                  Restart
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Container>
      </div>
    );
  }

  // Upload image to website and store information
  async handleImageUpload(event: React.FormEvent<HTMLInputElement>) {
    if (event.currentTarget.files === null) {
      return;
    }

    this.setState({
      emojiName: `wow-${event.currentTarget.files[0].name.split(".")[0]}`,
      hasUploadedImage: true,
      originalImageFile: event.currentTarget.files[0],
      originalImage: URL.createObjectURL(event.currentTarget.files[0]),
    });
  }

  // Save emoji name
  handleEmojiNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      emojiName: event.currentTarget.value,
    });
  }

  // Upload image to backend for wowification
  async wowifyImage() {
    const { originalImageFile } = this.state;

    const rgbTimer = setInterval(() => {
      this.generateRGBColor();
    }, 25);

    const quoteTimer = setInterval(() => {
      this.generateFunnyQuote();
    }, 6000);

    this.setState({
      isUploading: true,
    });

    try {
      var response = await axios.put(
        `https://image-wower-alb-1019418099.us-west-2.elb.amazonaws.com/`,
        originalImageFile
      );

      this.setState({
        hasWowifiedImage: true,
        isUploading: false,
        wowifiedImage: {
          original: response.data.wowifiedOriginal,
          small: response.data.wowifiedSmall,
        },
      });
    } catch (e) {
      this.setState({
        hasError: true,
        hasWowifiedImage: false,
        isUploading: false,
      });
    }

    clearInterval(rgbTimer);
    clearInterval(quoteTimer);
  }

  // Save images to local machine
  async saveImages() {
    const { emojiName } = this.state;
    const { small } = this.state.wowifiedImage;

    const a = document.createElement("a");
    a.href = "data:image/gif;base64," + small;
    a.download = `${emojiName}.gif`;
    a.click();
  }

  // Handler for closing error toast
  handleErrorClose() {
    this.setState({
      hasError: false,
    });
  }

  // RGB generator for loading icon
  generateRGBColor() {
    let { r, g, b } = this.state.loadingColor;

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

    this.setState({
      loadingColor: {
        color: `rgb(${r}, ${g}, ${b})`,
        r: r,
        g: g,
        b: b,
      },
    });
  }

  // Quotes displayed during loading screen
  generateFunnyQuote() {
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
      "You are number 93840 in the queue",
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
    ];

    this.setState({
      loadingQuote: quotes[Math.floor(Math.random() * quotes.length)],
    });
  }

  // Reset page state to beginning
  restart() {
    this.setState({
      emojiName: "wow-emoji",
      hasError: false,
      hasUploadedImage: false,
      hasWowifiedImage: false,
      isUploading: false,
      originalImage: "",
      wowifiedImage: { original: "", small: "" },
      originalImageFile: undefined,
    });
  }
}
