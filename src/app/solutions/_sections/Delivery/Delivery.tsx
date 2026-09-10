import { ThreeItems } from "../../_components/ThreeItems/ThreeItems";

const delivery = [
  { title: "Build", kicker: "Turn the direction into a working solution.", body: "We develop the software and capabilities required to transform an approved concept into technology that can be used." },
  { title: "Connect", kicker: "Integrate it where it needs to work.", body: "When required, we connect the solution with the systems, processes, or environments that form part of its operation." },
  { title: "Put into Use", kicker: "Move from development to real implementation.", body: "We bring the solution into use within the organisation, considering what it needs to become part of the working environment." },
] as const;

export function Delivery() {
  return <ThreeItems alternate connected title="A solution creates value when it can be put into practice." description="CrimsonTide can take a defined direction beyond the concept stage and prepare it to work where it will be used." items={delivery} />;
}
