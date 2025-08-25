import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="140"
      height="40"
      {...props}
    >
      <path
        fill="hsl(var(--primary))"
        d="M25.5,6.3c-2.4,0-4.6,0.9-6.3,2.6L14,3.7c2.4-2.4,5.7-3.8,9.2-3.8c6.9,0,12.5,5.6,12.5,12.5c0,6.9-5.6,12.5-12.5,12.5c-3.5,0-6.7-1.4-9.2-3.8l5.2-5.2c1.7,1.7,3.9,2.6,6.3,2.6c3.9,0,7-3.1,7-7S29.4,6.3,25.5,6.3z"
      ></path>
      <text
        x="45"
        y="32"
        fontFamily="'Poppins', sans-serif"
        fontSize="28"
        fontWeight="600"
        fill="hsl(var(--foreground))"
      >
        BranchFlow
      </text>
    </svg>
  );
}
