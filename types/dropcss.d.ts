declare namespace dropcss {
  export interface DropcssOptions {
    html: string;
    css: string;
    keepText?: boolean;
    dropUsedFontFace?: boolean;
    dropUsedKeyframes?: boolean;
    shouldDrop?: (sel: string) => boolean;
    didRetain?: (sel: string) => void;
  }

  export default function dropcss(opts: DropcssOptions): {
    css: string;
  };
}

export = dropcss;
