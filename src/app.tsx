import Footer from "./Components/footer";
import Wow from "./Components/wow";

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
