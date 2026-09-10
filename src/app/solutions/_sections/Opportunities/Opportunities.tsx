import { ThreeItems } from "../../_components/ThreeItems/ThreeItems";

const opportunities = [
  { title: "Solve a specific challenge", body: "Explore how artificial intelligence can become part of a solution designed around a specific business or operational need." },
  { title: "Improve how work gets done", body: "Identify opportunities to reduce friction, support decisions, and improve existing processes through artificial intelligence capabilities." },
  { title: "Create a new capability", body: "Develop new tools, experiences, or ways of working that expand what your organisation can do." },
] as const;

export function Opportunities() {
  return <ThreeItems alternate title="We start with what you want to achieve, not the technology." description="Every organisation starts from a different context. An AI solution can begin with a challenge, a process that could work better, or a new capability you want to develop." items={opportunities} />;
}
