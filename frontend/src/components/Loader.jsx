import { Loader2 } from "lucide-react";
import { animations } from "../styles/theme";

const Loader = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className={"h-8 w-8 text-blue-600 " + animations.spinner} />
    </div>
  );
};

export default Loader;
