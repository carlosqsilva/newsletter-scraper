import { Icon, type IconNode, type IconProps } from "./shared";

const iconNode: IconNode = [
  [
    "path",
    { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" },
  ],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
];

export const RotateCcw = (props: IconProps) => (
  <Icon {...props} iconNode={iconNode} />
);
