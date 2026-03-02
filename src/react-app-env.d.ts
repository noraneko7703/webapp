/// <reference types="vite/client" />

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

// Fix for @ionic/react requiring placeholder / pointer capture props on all components
declare namespace React {
  interface HTMLAttributes<T> {
    placeholder?: string;
    onPointerEnterCapture?: React.PointerEventHandler<T>;
    onPointerLeaveCapture?: React.PointerEventHandler<T>;
  }
}

declare module "*.avif" {
	const src: string;
	export default src;
}

declare module "*.bmp" {
	const src: string;
	export default src;
}

declare module "*.gif" {
	const src: string;
	export default src;
}

declare module "*.jpg" {
	const src: string;
	export default src;
}

declare module "*.jpeg" {
	const src: string;
	export default src;
}

declare module "*.png" {
	const src: string;
	export default src;
}

declare module "*.webp" {
	const src: string;
	export default src;
}

declare module "*.svg" {
	import * as React from "react";

	export const ReactComponent: React.FunctionComponent<
		React.SVGProps<SVGSVGElement> & { title?: string }
	>;

	const src: string;
	export default src;
}

declare module "*.module.css" {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module "*.module.scss" {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module "*.module.sass" {
	const classes: { readonly [key: string]: string };
	export default classes;
}

