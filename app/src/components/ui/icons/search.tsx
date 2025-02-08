import { Icon, type IconNode, type IconProps } from "./shared";

const iconNode: IconNode = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
];

export const SearchIcon = (props: IconProps) => (
  <Icon {...props} iconNode={iconNode} />
);
