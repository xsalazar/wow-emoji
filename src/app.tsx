import Footer from "./Components/footer.js";
import Wow from "./Components/wow.js";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        maxHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Wow />
      <Footer />
    </div>
  );
}
