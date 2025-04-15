import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";


export default function Home() {
  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div>
        <Button variant={"elevated"}>Soy un boton</Button>
      </div>
      <div>
        <Input placeholder="Soy un input" />
      </div>
      <div>
        <Progress value={50} max={100} />
      </div>
      <div>
        <Textarea placeholder="Soy una text-area" />
      </div><div>
        <Checkbox />
      </div>
    </div>
  );
}
