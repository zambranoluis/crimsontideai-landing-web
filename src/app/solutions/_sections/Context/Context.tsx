import { ThreeItems } from "../../_components/ThreeItems/ThreeItems";

const context = [
  { title: "Your Objective", kicker: "Start with what you want to achieve.", body: "We define the purpose of the solution around the outcome, improvement, or new capability you want to develop." },
  { title: "Your Environment", kicker: "Understand where it needs to work.", body: "We consider the processes, systems, and conditions that shape the environment in which the solution will operate." },
  { title: "Your Solution", kicker: "Build around those needs.", body: "From that context, we define a solution that brings together the right technology and capabilities for the project." },
] as const;

export function Context() {
  return <ThreeItems title="The solution should adapt to your organisation, not the other way around." description="Every project starts with different objectives, ways of working, and conditions. We design around that reality." items={context} />;
}
