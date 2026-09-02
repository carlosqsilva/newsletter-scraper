interface PixelProps {
  class?: string;
}

/** 4-pointed sparkle star (two rotated squares crossing at center). */
export function Sparkle(props: PixelProps) {
  return (
    <svg
      class={`sparkle ${props.class ?? ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z" />
    </svg>
  );
}

/** Classic 9x7 pixel heart. */
export function PixelHeart(props: PixelProps) {
  return (
    <svg
      class={props.class}
      viewBox="0 0 9 7"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1 0h3v1H1zM5 0h3v1H5zM0 1h9v2H0zM1 3h7v1H1zM2 4h5v1H2zM3 5h3v1H3zM4 6h1v1H4z" />
    </svg>
  );
}

/** Pixel cloud made of overlapping squares. */
export function PixelCloud(props: PixelProps) {
  return (
    <svg
      class={`y2k-float ${props.class ?? ""}`}
      viewBox="0 0 14 7"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 0h4v1H4zM3 1h6v1H3zM1 2h10v1H1zM0 3h14v2H0zM1 5h12v1H1zM2 6h10v1H2z" />
    </svg>
  );
}

/** 8x8 pixel sad face (:-X) for the "no results" dialog. */
export function PixelSad(props: PixelProps) {
  return (
    <svg
      class={props.class}
      viewBox="0 0 8 8"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1 0h6v1H1zM0 1h1v6H0zM7 1h1v6H7zM2 2h1v1H2z M5 2h1v1H5zM2 5h1v1H2z M5 5h1v1H5z M3 6h2v1H3zM1 7h6v1H1z" />
    </svg>
  );
}
