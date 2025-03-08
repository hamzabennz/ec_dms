import { styled } from "@mui/material/styles";

export default styled("div")(({ theme, ownerState }) => {
    const { palette, typography, borders, functions } = theme;
    const { color, variant, size } = ownerState;

    const { white, dark, text, transparent, gradients } = palette;
    const { size: fontSize } = typography;
    const { borderRadius } = borders;
    const { pxToRem } = functions;

    // Chip styles based on variant
    let colorValue = color === "default" ? dark.main : palette[color].main;
    let textColorValue = white.main;

    if (variant === "outlined") {
        colorValue = transparent.main;
        textColorValue = color === "default" ? dark.main : palette[color].main;
    }

    // Chip size styles
    const sizeStyles = {
        small: {
            height: pxToRem(24),
            fontSize: fontSize.xs,
            borderRadius: borderRadius.md,
        },
        medium: {
            height: pxToRem(32),
            fontSize: fontSize.sm,
            borderRadius: borderRadius.lg,
        },
        large: {
            height: pxToRem(40),
            fontSize: fontSize.md,
            borderRadius: borderRadius.lg,
        },
    };

    return {
        "& .MuiChip-root": {
            color: textColorValue,
            backgroundColor: colorValue,
            borderColor: color === "default" ? dark.main : palette[color].main,
            ...sizeStyles[size],
        },
        "& .MuiChip-label": {
            paddingLeft: pxToRem(12),
            paddingRight: pxToRem(12),
            fontWeight: 400,
        },
        "& .MuiChip-deleteIcon": {
            color: textColorValue,
            "&:hover": {
                color: textColorValue,
                opacity: 0.75,
            },
        },
    };
});