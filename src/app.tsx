import Body from "./Components/brb";
import Footer from "./Components/footer";
// import Wow from "./Components/wow";

function App() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        maxHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <Wow /> */}
      <Body />
      <Footer />
    </div>
  );
}

export default App;
