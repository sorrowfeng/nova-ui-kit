import type { ShowcaseNavItem } from "@/data/components";
import { ApplicationPatternsShowcase } from "@/components/showcase/ApplicationPatternsShowcase";
import { BuilderShowcase } from "@/components/showcase/BuilderShowcase";
import { ButtonsShowcase } from "@/components/showcase/ButtonsShowcase";
import { DataDisplayShowcase } from "@/components/showcase/DataDisplayShowcase";
import { FeedbackShowcase } from "@/components/showcase/FeedbackShowcase";
import { FormControlsShowcase } from "@/components/showcase/FormControlsShowcase";
import { NavigationShowcase } from "@/components/showcase/NavigationShowcase";
import { ShowcaseHeader } from "@/components/showcase/ShowcaseScaffold";

type ShowcasePageProps = {
  item: ShowcaseNavItem;
  onOpenCommand: () => void;
  onToast: () => void;
};

export function ShowcasePage({ item, onOpenCommand, onToast }: ShowcasePageProps) {
  return (
    <div className="space-y-[var(--panel-gap)] pb-10">
      <ShowcaseHeader
        eyebrow={item.category}
        title={item.title}
        description={item.description}
        tags={item.tags}
      />

      {item.id === "builder" ? <BuilderShowcase /> : null}
      {item.id === "buttons" ? <ButtonsShowcase /> : null}
      {item.id === "forms" ? <FormControlsShowcase /> : null}
      {item.id === "navigation" ? <NavigationShowcase onOpenCommand={onOpenCommand} /> : null}
      {item.id === "feedback" ? <FeedbackShowcase onToast={onToast} /> : null}
      {item.id === "data-display" ? <DataDisplayShowcase /> : null}
      {item.id === "patterns" ? <ApplicationPatternsShowcase onToast={onToast} /> : null}
    </div>
  );
}
