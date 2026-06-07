import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/stat-card";
import { Server } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total VMs" value={100} icon={Server} />);
    expect(screen.getByText("Total VMs")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <StatCard title="Active VMs" value={75} icon={Server} description="Currently running" />
    );
    expect(screen.getByText("Currently running")).toBeInTheDocument();
  });
});
