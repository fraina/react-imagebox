import * as React from "react";
export interface TitleBarConfig {
    enable?: boolean;
    className?: string;
    text?: string;
    closeButton?: boolean;
    closeButtonClassName?: string;
    closeText?: string;
    position?: string;
    nextText?: string;
    prevText?: string;
}

export interface LightboxConfig {
    speed?: number;
    smoothResize?: boolean;
    fadeMode?: boolean;
    fadeSpeed?: number;
    loop?: boolean;
    clickSwitch?: boolean;
    compatible?: boolean;
    maxHeight?: number;
    maxWidth?: number;
    minHeight?: number;
    minWidth?: number;
    initHeight?: number;
    initWidth?: number;
}

export interface Config {
    className?: string;
    overlayOpacity?: number;
    fadeIn?: boolean;
    fadeInSpeed?: number;
    fadeOut?: boolean;
    fadeOutSpeed?: number;
    titleBar?: TitleBarConfig;
    lightbox?: LightboxConfig;
    onOpen?: () => void;
    onComplete?: () => void;
    onCleanup?: () => void;
    onClosed?: () => void;
}

export class Imagebox extends React.Component<Config, {}> {
    openImagebox(): void;
    closeImagebox(): void;
}

export class ImageboxTrigger extends React.Component<{}, {}> {
}
export class ImageboxModal extends React.Component<{}, {}> {
}
